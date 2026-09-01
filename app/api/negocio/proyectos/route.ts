import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analizarProyecto } from '@/lib/comparador-negocio'
import { calcularDiagnostico, calcularCompletitudFiscal } from '@/lib/reglas-fiscales'
import type { DatosNegocio, EstadoProyecto, AlternativaKey, RelacionNegocio, TipoEntidadFiscal } from '@/lib/types'

async function getUser(req: NextRequest) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '')
  if (!token) return null
  const { data: { user } } = await supabaseAdmin().auth.getUser(token)
  return user
}

// Traduce la alternativa elegida a los campos de Mi Perfil, para cuando el
// usuario decide activar el proyecto (spec punto 13: Crear Mi Negocio →
// Mi Perfil → Motor fiscal). "Sociedad" también implica inscripción en IVA
// (Responsable Inscripto) para el negocio, aunque sea otra la razón de
// elegirla — por eso mapea a 'ri' igual que Régimen General.
function mapearASituacionFiscal(alt: AlternativaKey): 'mono' | 'ri' {
  return alt === 'monotributo' ? 'mono' : 'ri'
}

function normalizarCuit(cuit?: string) {
  const digitos = (cuit || '').replace(/\D/g, '')
  return digitos.length === 11 ? digitos : null
}

function clasificarEntidad(
  alternativa: AlternativaKey,
  relacion: RelacionNegocio
): TipoEntidadFiscal {
  if (alternativa === 'sociedad') return 'persona_juridica'
  if (['administrador', 'empleado', 'otro'].includes(relacion)) return 'tercero'
  return 'persona_fisica'
}

// Vincula el negocio con la entidad que realmente tributa. Dos actividades
// individuales del mismo usuario comparten la entidad personal y, por lo
// tanto, CUIT, régimen, límites y vencimientos. Una sociedad o un negocio de
// terceros recibe una entidad separada.
async function sincronizarEntidadFiscal({
  admin,
  userId,
  proyectoId,
  nombre,
  datos,
  alternativa,
}: {
  admin: ReturnType<typeof supabaseAdmin>
  userId: string
  proyectoId: string
  nombre?: string
  datos: DatosNegocio
  alternativa: AlternativaKey
}) {
  const relacion: RelacionNegocio = datos.relacion
    || (alternativa === 'sociedad' ? 'socio' : 'titular')
  const tipo = clasificarEntidad(alternativa, relacion)
  let entidadId: string | null = null

  if (tipo === 'persona_fisica') {
    const { data: personal, error } = await admin
      .from('entidades_fiscales')
      .select('id')
      .eq('creada_por', userId)
      .eq('tipo', 'persona_fisica')
      .single()
    if (error || !personal) throw new Error(error?.message || 'No se encontró la entidad fiscal personal.')
    entidadId = personal.id
  } else {
    const cuit = normalizarCuit(datos.cuit)
    const payload = {
      creada_por: userId,
      tipo,
      nombre: nombre || datos.nombre_fantasia || datos.actividad || 'Negocio',
      cuit,
      terminacion_cuit: cuit?.slice(-1) || datos.terminacion_cuit || null,
      regimen_fiscal: datos.situacion_fiscal || null,
      provincia: datos.provincia || null,
      localidad: datos.localidad || null,
      proyecto_origen_id: proyectoId,
    }
    const { data: entidad, error } = await admin
      .from('entidades_fiscales')
      .upsert(payload, { onConflict: 'proyecto_origen_id' })
      .select('id')
      .single()
    if (error || !entidad) throw new Error(error?.message || 'No se pudo crear la entidad fiscal del negocio.')
    entidadId = entidad.id
  }

  const relacionEntidad: RelacionNegocio = tipo === 'persona_fisica' ? 'titular' : relacion
  const { error: miembroError } = await admin.from('entidad_usuarios').upsert({
    entidad_fiscal_id: entidadId,
    user_id: userId,
    relacion: relacionEntidad,
    permiso: relacion === 'empleado' ? 'ver' : 'administrar',
  }, { onConflict: 'entidad_fiscal_id,user_id' })
  if (miembroError) throw new Error(miembroError.message)

  const { error: proyectoError } = await admin.from('negocio_proyectos').update({
    entidad_fiscal_id: entidadId,
    relacion,
  }).eq('id', proyectoId).eq('user_id', userId)
  if (proyectoError) throw new Error(proyectoError.message)

  return { entidadId, relacion, tipo }
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('negocio_proyectos')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const proyectos = data || []
  const idsActivos = proyectos.filter(p => p.estado === 'activo').map(p => p.id)
  const entidadIds = Array.from(new Set(
    proyectos.map(p => p.entidad_fiscal_id).filter((id): id is string => Boolean(id))
  ))

  let entidadesPorId: Record<string, any> = {}
  if (entidadIds.length > 0) {
    const { data: entidades, error: entidadesError } = await admin
      .from('entidades_fiscales')
      .select('*')
      .in('id', entidadIds)
    if (entidadesError) return NextResponse.json({ error: entidadesError.message }, { status: 500 })
    entidadesPorId = Object.fromEntries((entidades || []).map(entidad => [entidad.id, entidad]))
  }

  // Traer el diagnóstico de todos los negocios activos en una sola consulta
  // y agruparlo por proyecto, para que el panel pueda mostrar las
  // obligaciones de cada negocio sin pegarle a la API una vez por cada uno.
  let diagnosticoPorProyecto: Record<string, any[]> = {}
  if (idsActivos.length > 0) {
    const { data: diagRows } = await admin
      .from('negocio_diagnostico')
      .select('*')
      .in('proyecto_id', idsActivos)
    for (const row of diagRows || []) {
      if (!diagnosticoPorProyecto[row.proyecto_id]) diagnosticoPorProyecto[row.proyecto_id] = []
      diagnosticoPorProyecto[row.proyecto_id].push(row)
    }
  }

  const proyectosConDiagnostico = proyectos.map(p => ({
    ...p,
    entidad_fiscal: p.entidad_fiscal_id ? entidadesPorId[p.entidad_fiscal_id] ?? null : null,
    diagnostico: diagnosticoPorProyecto[p.id] || [],
  }))

  return NextResponse.json({ proyectos: proyectosConDiagnostico })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const {
    id,
    nombre,
    datos,
    estado,
    alternativa_elegida,
  }: {
    id?: string
    nombre?: string
    datos: DatosNegocio
    estado: EstadoProyecto
    alternativa_elegida?: AlternativaKey
  } = body

  if (estado === 'simulacion') {
    return NextResponse.json(
      { error: 'Una simulación no se guarda en el servidor — corré el análisis en el cliente.' },
      { status: 400 }
    )
  }
  if (estado === 'activo' && !alternativa_elegida) {
    return NextResponse.json({ error: 'Falta indicar qué alternativa elegiste para activar el negocio.' }, { status: 400 })
  }

  // Si se activa, la situación fiscal elegida pasa a ser parte de LOS DATOS
  // de este negocio (no de profiles) — así cada negocio guarda la suya.
  if (estado === 'activo' && alternativa_elegida) {
    datos.situacion_fiscal = mapearASituacionFiscal(alternativa_elegida)
    datos.alternativa_elegida = alternativa_elegida

    // El motor de reglas (lib/reglas-fiscales.ts) lee las situaciones
    // especiales desde perfil_data.situaciones_especiales, pero el wizard
    // de Crear Mi Negocio las carga como datos.importaciones/exportaciones
    // (booleans sueltos, usados también por el comparador de alternativas).
    // Las sincronizamos acá para que también aparezcan como "requiere
    // revisión" en las obligaciones corrientes del negocio, no solo en la
    // comparación inicial.
    const especiales = new Set(datos.perfil_data?.situaciones_especiales ?? [])
    if (datos.importaciones) especiales.add('importaciones')
    if (datos.exportaciones) especiales.add('exportaciones')
    if (especiales.size > 0) {
      datos.perfil_data = { ...(datos.perfil_data ?? {}), situaciones_especiales: Array.from(especiales) }
    }
  }

  const admin = supabaseAdmin()
  const { resultados, certeza, faltaInfo, completitud } = analizarProyecto(datos)
  const recomendada = resultados.find(r => r.es_recomendada)?.alternativa_key ?? null

  const proyectoPayload = {
    user_id: user.id,
    estado,
    nombre: nombre ?? null,
    datos,
    completitud,
    certeza,
    falta_info: faltaInfo,
    alternativa_recomendada: recomendada,
  }

  let proyectoId = id

  if (proyectoId) {
    // Confirmar que el proyecto es del usuario antes de tocarlo — admin
    // bypassea RLS, así que el filtro por user_id hay que hacerlo a mano acá.
    const { data: existente } = await admin
      .from('negocio_proyectos')
      .select('id')
      .eq('id', proyectoId)
      .eq('user_id', user.id)
      .single()
    if (!existente) return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })

    const { error: updErr } = await admin.from('negocio_proyectos').update(proyectoPayload).eq('id', proyectoId)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
  } else {
    const { data: nuevo, error: insErr } = await admin
      .from('negocio_proyectos')
      .insert(proyectoPayload)
      .select('id')
      .single()
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
    proyectoId = nuevo.id
  }

  // Persistir el análisis por alternativa
  const filasAnalisis = resultados.map(r => ({
    proyecto_id: proyectoId,
    alternativa_key: r.alternativa_key,
    adecuacion: r.adecuacion,
    explicacion: r.explicacion,
    desventajas: r.desventajas,
    criterios: r.criterios,
    es_recomendada: r.es_recomendada,
    calculado_at: new Date().toISOString(),
  }))
  const { error: analisisErr } = await admin
    .from('negocio_analisis')
    .upsert(filasAnalisis, { onConflict: 'proyecto_id,alternativa_key' })
  if (analisisErr) return NextResponse.json({ error: analisisErr.message }, { status: 500 })

  if (!proyectoId) {
    return NextResponse.json({ error: 'No se pudo identificar el proyecto guardado.' }, { status: 500 })
  }

  // ── Activación: conectar con Mi Perfil (spec punto 12 y 13) ────────────
  if (estado === 'activo' && alternativa_elegida) {
    try {
      await sincronizarEntidadFiscal({
        admin,
        userId: user.id,
        proyectoId,
        nombre,
        datos,
        alternativa: alternativa_elegida,
      })
    } catch (error) {
      console.error('[negocio/proyectos] No se pudo vincular la entidad fiscal', error)
      return NextResponse.json({
        error: error instanceof Error ? error.message : 'No se pudo vincular la entidad fiscal.',
      }, { status: 500 })
    }

    // 1) Diagnóstico PROPIO de este negocio — corre el motor de reglas
    // sobre los datos de ESTE negocio. La agrupación final por régimen,
    // facturación y vencimientos se hace por entidad fiscal/CUIT: varios
    // negocios individuales no pueden inventar regímenes distintos si
    // comparten la entidad personal.
    const diagnosticoNegocio = calcularDiagnostico(datos, 'negocio')
    const completitudFiscal = calcularCompletitudFiscal(datos)

    const filasDiagNegocio = diagnosticoNegocio.map(d => ({
      proyecto_id: proyectoId,
      obligacion_key: d.key,
      aplica: d.aplica,
      motivo: d.motivo,
      falta_info: d.faltaInfo,
      calculado_at: new Date().toISOString(),
    }))
    if (filasDiagNegocio.length > 0) {
      const { error: diagNegErr } = await admin
        .from('negocio_diagnostico')
        .upsert(filasDiagNegocio, { onConflict: 'proyecto_id,obligacion_key' })
      if (diagNegErr) return NextResponse.json({ error: diagNegErr.message }, { status: 500 })
    }
    await admin.from('negocio_proyectos').update({ completitud_fiscal: completitudFiscal }).eq('id', proyectoId)

    // NOTA: hasta acá escribíamos también en `profiles` (situacion_fiscal,
    // actividad, provincia, etc.) para que el resto de la app siguiera
    // funcionando con "una sola situación fiscal por usuario". Eso es
    // justo lo que generaba la contradicción: el negocio decía "sos RI"
    // mientras Mi Perfil (que responde la persona por su cuenta) podía
    // decir otra cosa distinta, o el último negocio activado pisaba al
    // anterior. Ahora cada negocio tiene SU PROPIO diagnóstico (arriba) y
    // Mi Perfil queda como la situación de la PERSONA, sin que un negocio
    // se la pise.
    //
    // Las entidades fiscales permiten que el siguiente paso lea régimen,
    // CUIT y vencimientos desde el responsable real, no desde la tarjeta de
    // negocio o desde el último proyecto activado.
  }

  return NextResponse.json({ id: proyectoId, resultados, certeza, faltaInfo, completitud })
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id del proyecto' }, { status: 400 })

  const admin = supabaseAdmin()
  const { error } = await admin
    .from('negocio_proyectos')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // admin bypassea RLS: filtro manual para no borrar de otro usuario

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
