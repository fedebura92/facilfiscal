import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analizarProyecto } from '@/lib/comparador-negocio'
import { calcularDiagnostico, calcularCompletitud } from '@/lib/reglas-fiscales'
import type { DatosNegocio, EstadoProyecto, AlternativaKey } from '@/lib/types'

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
  return NextResponse.json({ proyectos: data })
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

  // ── Activación: conectar con Mi Perfil (spec punto 12 y 13) ────────────
  if (estado === 'activo' && alternativa_elegida) {
    const situacionFiscal = mapearASituacionFiscal(alternativa_elegida)

    const perfilUpdate: Record<string, any> = {
      situacion_fiscal: situacionFiscal,
      tipo_contribuyente: situacionFiscal, // compat legado, igual que Mi Perfil
    }
    if (datos.actividad) {
      perfilUpdate.actividad_principal = datos.actividad
      perfilUpdate.actividad = datos.actividad // compat legado
    }
    if (datos.provincia) perfilUpdate.provincia = datos.provincia
    if (datos.tiene_empleados != null) perfilUpdate.tiene_empleados = datos.tiene_empleados
    if (datos.cantidad_empleados != null) perfilUpdate.cantidad_empleados = datos.cantidad_empleados
    if (datos.facturacion_estimada != null) perfilUpdate.facturacion_estimada = datos.facturacion_estimada
    if ((datos.provincias_operacion?.length ?? 0) > 1) perfilUpdate.otras_jurisdicciones = datos.provincias_operacion!.filter(p => p !== datos.provincia)

    const { error: perfilErr } = await admin.from('profiles').update(perfilUpdate).eq('id', user.id)
    if (perfilErr) return NextResponse.json({ error: `Proyecto activado, pero no se pudo actualizar Mi Perfil: ${perfilErr.message}` }, { status: 500 })

    // Recalcular el diagnóstico fiscal con los datos nuevos (misma lógica
    // que /api/perfil/recalcular, inline para no depender de un segundo
    // request HTTP dentro del mismo handler).
    const { data: perfilActualizado } = await admin.from('profiles').select('*').eq('id', user.id).single()
    if (perfilActualizado) {
      const diagnostico = calcularDiagnostico(perfilActualizado as any)
      const completitudPerfil = calcularCompletitud(perfilActualizado as any)
      const filasDiag = diagnostico.map(d => ({
        user_id: user.id,
        obligacion_key: d.key,
        aplica: d.aplica,
        motivo: d.motivo,
        falta_info: d.faltaInfo,
        calculado_at: new Date().toISOString(),
      }))
      if (filasDiag.length > 0) {
        await admin.from('profile_diagnostico').upsert(filasDiag, { onConflict: 'user_id,obligacion_key' })
      }
      await admin.from('profiles').update({ perfil_completitud: completitudPerfil }).eq('id', user.id)
    }
  }

  return NextResponse.json({ id: proyectoId, resultados, certeza, faltaInfo, completitud })
}
