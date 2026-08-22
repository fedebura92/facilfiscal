// ============================================================================
// MOTOR DE REGLAS FISCALES
// Perfil declarado (Nivel 1) → Obligaciones aplicables (Nivel 2)
//
// Principio de seguridad (spec Mi Perfil, punto 15): nunca afirmar una
// obligación si falta información. `aplica` es siempre true | false | null.
// null = "no tenemos info suficiente" → se lista en `faltaInfo`.
//
// Esta es la única fuente de verdad para el diagnóstico. No duplicar esta
// lógica en componentes: importar desde acá.
// ============================================================================

import type { SituacionFiscalInput, PerfilFiscal } from './types'

export type Obligacion = {
  key: string
  label: string
  aplica: boolean | null
  motivo: string
  faltaInfo: string[]
}

function ob(
  key: string,
  label: string,
  aplica: boolean | null,
  motivo: string,
  faltaInfo: string[] = []
): Obligacion {
  return { key, label, aplica, motivo, faltaInfo }
}

export function calcularDiagnostico(p: SituacionFiscalInput): Obligacion[] {
  const out: Obligacion[] = []
  const sit = p.situacion_fiscal

  // ── Situación fiscal base ────────────────────────────────────────────────
  if (!sit || sit === 'no_se') {
    out.push(
      ob(
        'situacion_fiscal',
        'Régimen fiscal',
        null,
        'Todavía no sabemos qué régimen tenés (Monotributo, Responsable Inscripto, u otro).',
        ['situacion_fiscal']
      )
    )
    // Sin saber el régimen base, casi todo lo demás queda indeterminado.
    // Igual seguimos evaluando lo que no depende de esto (empleados, jurisdicción)
    // para no bloquear el resto del diagnóstico.
  }

  // ── IVA ───────────────────────────────────────────────────────────────────
  if (sit === 'ri') {
    out.push(ob('iva', 'IVA', true, 'Sos Responsable Inscripto: liquidás IVA todos los meses.'))
  } else if (sit === 'mono') {
    out.push(ob('iva', 'IVA', false, 'El Monotributo incluye el IVA dentro de la cuota mensual; no liquidás IVA por separado.'))
  } else if (sit === 'exento') {
    // TODO-VERIFICAR: confirmar tratamiento exacto según tipo de exención (objetiva/subjetiva)
    out.push(ob('iva', 'IVA', null, 'Depende del tipo de exención que tengas.', ['tipo_exencion']))
  } else {
    out.push(ob('iva', 'IVA', null, 'Necesitamos saber tu régimen fiscal para determinar esto.', ['situacion_fiscal']))
  }

  // ── Ganancias ────────────────────────────────────────────────────────────
  if (sit === 'ri' || p.inscripto_autonomos) {
    out.push(ob('ganancias', 'Impuesto a las Ganancias', true, 'Como Responsable Inscripto o Autónomo, en general te corresponde declarar Ganancias.'))
  } else if (sit === 'mono') {
    out.push(ob('ganancias', 'Impuesto a las Ganancias', false, 'El Monotributo reemplaza a Ganancias mientras te mantengas dentro del régimen.'))
  } else {
    out.push(ob('ganancias', 'Impuesto a las Ganancias', null, 'Necesitamos confirmar tu régimen fiscal.', ['situacion_fiscal']))
  }

  // ── Ingresos Brutos / Convenio Multilateral ─────────────────────────────
  if (!p.provincia) {
    out.push(ob('iibb', 'Ingresos Brutos', null, 'Falta saber en qué provincia operás.', ['provincia']))
  } else if (p.inscripto_iibb === true) {
    // PerfilFiscal ya trae otras_jurisdicciones armado. DatosNegocio (un
    // negocio de Crear Mi Negocio) en cambio trae provincias_operacion, que
    // incluye la provincia principal — hay que restarla para contar "otras".
    const otras = p.otras_jurisdicciones?.length
      ?? p.provincias_operacion?.filter(prov => prov !== p.provincia).length
      ?? 0
    if (otras > 0) {
      out.push(ob('iibb', 'Ingresos Brutos', true, `Operás en ${p.provincia} y en ${otras} jurisdicción(es) más: te corresponde Convenio Multilateral.`))
    } else {
      out.push(ob('iibb', 'Ingresos Brutos', true, `Estás inscripto en Ingresos Brutos de ${p.provincia}.`))
    }
  } else if (p.inscripto_iibb === false) {
    out.push(ob('iibb', 'Ingresos Brutos', false, 'Nos dijiste que no estás inscripto en Ingresos Brutos.', ['confirmar_iibb']))
  } else {
    out.push(ob('iibb', 'Ingresos Brutos', null, 'Falta confirmar si estás inscripto en Ingresos Brutos.', ['inscripto_iibb']))
  }

  // ── Empleados / cargas sociales (F.931) ─────────────────────────────────
  if (p.tiene_empleados === true) {
    out.push(ob('empleados_931', 'Cargas sociales (F.931)', true, `Tenés ${p.cantidad_empleados ?? 'al menos un'} empleado(s): corresponde liquidar F.931 y ART todos los meses.`))
  } else if (p.tiene_empleados === false) {
    out.push(ob('empleados_931', 'Cargas sociales (F.931)', false, 'No tenés empleados en relación de dependencia.'))
  } else {
    out.push(ob('empleados_931', 'Cargas sociales (F.931)', null, 'Falta saber si tenés empleados.', ['tiene_empleados']))
  }

  // ── Recategorización de Monotributo ──────────────────────────────────────
  if (sit === 'mono') {
    out.push(ob('recategorizacion', 'Recategorización semestral', true, 'Como monotributista, tenés que recategorizarte cada enero y julio si corresponde.'))
  }

  // ── Situaciones especiales (bloque libre en perfil_data) ────────────────
  const especiales = p.perfil_data?.situaciones_especiales ?? []
  const MAPA_ESPECIALES: Record<string, string> = {
    importaciones: 'Importaciones',
    exportaciones: 'Exportaciones',
    servicios_exterior: 'Servicios al exterior',
    comercio_electronico: 'Comercio electrónico',
    alquiler_local: 'Alquiler de local comercial',
  }
  for (const key of especiales) {
    const label = MAPA_ESPECIALES[key]
    if (!label) continue
    // TODO-VERIFICAR: cada una de estas requiere reglas propias (percepciones
    // de importación, retenciones, factura de exportación, etc.). Por ahora
    // las marcamos como "requiere revisión" en vez de inventar una regla.
    out.push(ob(key, label, null, 'Esta situación requiere una revisión específica de tu caso.', [key]))
  }

  return out
}

// Completitud del perfil: % de campos "clave" respondidos.
// Solo cuenta los campos que determinan obligaciones, no todos los opcionales.
export function calcularCompletitud(p: PerfilFiscal): number {
  const campos: (keyof PerfilFiscal)[] = [
    'situacion_fiscal',
    'provincia',
    'actividad_principal',
    'terminacion_cuit',
    'tiene_empleados',
    'inscripto_iibb',
  ]
  const respondidos = campos.filter(c => {
    const v = p[c]
    return v !== null && v !== undefined && v !== ''
  }).length
  return Math.round((respondidos / campos.length) * 100)
}

// Completitud fiscal de UN negocio (Crear Mi Negocio, una vez activo).
// Campos más chicos a propósito: solo lo que hace falta para que el motor
// de reglas deje de decir "falta info" en cada obligación.
export function calcularCompletitudFiscal(p: SituacionFiscalInput): number {
  const campos: (keyof SituacionFiscalInput)[] = [
    'situacion_fiscal',
    'provincia',
    'tiene_empleados',
    'inscripto_iibb',
  ]
  const respondidos = campos.filter(c => {
    const v = p[c]
    return v !== null && v !== undefined && v !== ''
  }).length
  return Math.round((respondidos / campos.length) * 100)
}
