// ============================================================================
// MOTOR DE COMPARACIÓN — Crear Mi Negocio
// Datos del proyecto → análisis de las 3 alternativas + recomendación
//
// Mismo principio de seguridad que reglas-fiscales.ts: nunca afirmar que una
// alternativa es "la mejor" sin explicar por qué, y declarar explícitamente
// cuándo falta información en vez de forzar una recomendación (spec puntos
// 6, 7, 9, 15). adecuacion es 'alta' | 'media' | 'baja' | null — null =
// "no tenemos info suficiente para evaluar esta alternativa puntual".
//
// Varios umbrales acá (tope de facturación "cerca del límite", cantidad de
// empleados que empieza a pesar, etc.) son criterios de producto, no cifras
// oficiales de AFIP — están marcados TODO-VERIFICAR para que se revisen
// antes de que esto le hable a un usuario real.
// ============================================================================

import { CATEGORIAS_MONO } from './data'
import type { DatosNegocio, AnalisisAlternativa, AlternativaKey, Nivel, Certeza } from './types'

function nivel(v: Nivel, o: { alta: string; media: string; baja: string }) {
  return o[v]
}

// ── Monotributo ─────────────────────────────────────────────────────────
function evaluarMonotributo(d: DatosNegocio): AnalisisAlternativa {
  const socios = d.cantidad_socios ?? 1
  const desventajas: string[] = []

  if (socios > 1) {
    return {
      alternativa_key: 'monotributo',
      label: 'Monotributo',
      adecuacion: 'baja',
      explicacion: 'El Monotributo es un régimen individual: no está pensado para varios socios en la misma inscripción.',
      desventajas: ['Cada socio debería inscribirse por separado, o evaluar directamente una sociedad.'],
      criterios: { simplicidad: 'alta', costos_administrativos: 'baja', escalabilidad: 'baja', complejidad: 'baja' },
      es_recomendada: false,
    }
  }

  let adecuacion: Nivel | null = null
  let explicacion = 'Necesitamos tu facturación estimada para evaluar si el Monotributo te queda cómodo.'

  if (d.facturacion_estimada != null) {
    const anual = d.facturacion_estimada * 12
    const topeMax = CATEGORIAS_MONO[CATEGORIAS_MONO.length - 1].limite_anual
    if (anual > topeMax) {
      adecuacion = 'baja'
      explicacion = 'Tu facturación estimada superaría el techo del Monotributo — no podrías mantenerte en este régimen.'
    } else if (anual > topeMax * 0.8) {
      // TODO-VERIFICAR: el umbral del 80% es un criterio de producto (zona
      // de alerta), no un límite oficial de AFIP.
      adecuacion = 'media'
      explicacion = 'Con tu facturación estimada entrarías en Monotributo, pero cerca del techo — conviene vigilar el crecimiento.'
      desventajas.push('Si tu facturación sigue creciendo, en poco tiempo podrías tener que pasar a Responsable Inscripto.')
    } else {
      adecuacion = 'alta'
      explicacion = 'Por tu nivel de facturación estimado, el Monotributo podría ser una alternativa simple para empezar.'
    }
  }

  if (d.importaciones || d.exportaciones) {
    // TODO-VERIFICAR: el Monotributo tiene reglas particulares para
    // operaciones de comercio exterior — esto queda como advertencia
    // genérica hasta confirmar el detalle normativo.
    desventajas.push('Hacer importaciones o exportaciones desde Monotributo tiene reglas particulares — conviene revisar tu caso puntual.')
  }
  if (d.tiene_empleados && (d.cantidad_empleados ?? 0) > 5) {
    // TODO-VERIFICAR: umbral de producto, no un límite normativo puntual.
    desventajas.push('Con varios empleados, la carga administrativa puede empezar a acercarse a la de un régimen general.')
  }

  return {
    alternativa_key: 'monotributo',
    label: 'Monotributo',
    adecuacion,
    explicacion,
    desventajas,
    criterios: { simplicidad: 'alta', costos_administrativos: 'baja', escalabilidad: 'baja', complejidad: 'baja' },
    es_recomendada: false,
  }
}

// ── Régimen General / Responsable Inscripto ────────────────────────────
function evaluarRegimenGeneral(d: DatosNegocio): AnalisisAlternativa {
  const desventajas: string[] = [
    'Más carga administrativa: liquidación mensual de IVA y, en general, de Ganancias.',
  ]

  let adecuacion: Nivel = 'media' // sin techo de facturación, siempre es una alternativa viable
  let explicacion = 'El Régimen General no tiene techo de facturación y te permite tomar crédito fiscal de tus compras.'

  const socios = d.cantidad_socios ?? 1
  const necesitaCreditoFiscal = (d.tipo_clientes || []).some(t => t === 'responsables_inscriptos' || t === 'empresas')
  const anual = d.facturacion_estimada != null ? d.facturacion_estimada * 12 : null
  const topeMono = CATEGORIAS_MONO[CATEGORIAS_MONO.length - 1].limite_anual
  const excedeMono = anual != null && anual > topeMono

  if (excedeMono) {
    adecuacion = 'alta'
    explicacion = 'Tu facturación estimada superaría el techo del Monotributo, así que el Régimen General pasa a ser la alternativa natural.'
  } else if (necesitaCreditoFiscal) {
    adecuacion = 'alta'
    explicacion = 'Si tus clientes son mayormente Responsables Inscriptos o empresas, van a necesitar que les factures con IVA discriminado.'
  } else if (d.importaciones || d.exportaciones) {
    adecuacion = 'alta'
    explicacion = 'Las operaciones de comercio exterior suelen encajar mejor en el Régimen General que en Monotributo.'
  }

  if (socios <= 1 && anual != null && !excedeMono && !necesitaCreditoFiscal) {
    desventajas.push('Para un proyecto chico e individual, puede ser más carga administrativa de la que necesitás por ahora.')
  }

  return {
    alternativa_key: 'regimen_general',
    label: 'Régimen General / Responsable Inscripto',
    adecuacion,
    explicacion,
    desventajas,
    criterios: { simplicidad: 'media', costos_administrativos: 'alta', escalabilidad: 'alta', complejidad: 'media' },
    es_recomendada: false,
  }
}

// ── Sociedad ────────────────────────────────────────────────────────────
function evaluarSociedad(d: DatosNegocio): AnalisisAlternativa {
  const socios = d.cantidad_socios ?? 1
  const desventajas: string[] = [
    'Mayor complejidad y costo de constitución y mantenimiento (contabilidad, balances, etc.).',
  ]

  let adecuacion: Nivel
  let explicacion: string

  if (socios > 1) {
    adecuacion = 'alta'
    explicacion = 'Con más de un socio, una estructura societaria formaliza cómo se reparten responsabilidades, decisiones y resultados.'
  } else if (d.expectativa_crecimiento === 'alta') {
    adecuacion = 'media'
    explicacion = 'Aunque hoy seas el único titular, si esperás crecer fuerte puede convenir evaluar una sociedad (incluso unipersonal) para separar tu patrimonio personal del del negocio.'
    desventajas.push('Para un proyecto que recién arranca, puede ser una estructura más pesada de lo que necesitás por ahora.')
  } else {
    adecuacion = 'baja'
    explicacion = 'Sin socios y sin una expectativa de crecimiento fuerte, una sociedad probablemente agregue más complejidad de la que necesitás hoy.'
  }

  return {
    alternativa_key: 'sociedad',
    label: 'Sociedad',
    adecuacion,
    explicacion,
    desventajas,
    criterios: { simplicidad: 'baja', costos_administrativos: 'alta', escalabilidad: 'alta', complejidad: 'alta' },
    es_recomendada: false,
  }
}

const ORDEN_NIVEL: Record<Nivel, number> = { alta: 3, media: 2, baja: 1 }
// Desempate cuando dos alternativas quedan parejas: preferir la más simple.
const ORDEN_SIMPLICIDAD: Record<AlternativaKey, number> = {
  monotributo: 3,
  regimen_general: 2,
  sociedad: 1,
}

export function compararAlternativas(d: DatosNegocio): AnalisisAlternativa[] {
  const resultados = [evaluarMonotributo(d), evaluarRegimenGeneral(d), evaluarSociedad(d)]

  const mejor = [...resultados]
    .filter(r => r.adecuacion != null)
    .sort((a, b) => {
      const diff = ORDEN_NIVEL[b.adecuacion!] - ORDEN_NIVEL[a.adecuacion!]
      if (diff !== 0) return diff
      return ORDEN_SIMPLICIDAD[b.alternativa_key] - ORDEN_SIMPLICIDAD[a.alternativa_key]
    })[0]

  if (mejor) {
    mejor.es_recomendada = true
  }

  return resultados
}

// ── Certeza global del análisis (spec punto 9) ────────────────────────────
export function calcularCerteza(d: DatosNegocio, resultados: AnalisisAlternativa[]): { certeza: Certeza; faltaInfo: string[] } {
  const faltaInfo: string[] = []
  if (!d.actividad) faltaInfo.push('actividad')
  if (d.facturacion_estimada == null) faltaInfo.push('facturacion_estimada')
  if (d.cantidad_socios == null) faltaInfo.push('cantidad_socios')

  if (faltaInfo.length > 0) {
    return { certeza: 'insuficiente', faltaInfo }
  }

  const conAdecuacion = resultados.filter(r => r.adecuacion != null)
  const hayNulos = conAdecuacion.length < resultados.length
  const maxNivel = Math.max(...conAdecuacion.map(r => ORDEN_NIVEL[r.adecuacion!]))
  const empatados = conAdecuacion.filter(r => ORDEN_NIVEL[r.adecuacion!] === maxNivel)

  if (hayNulos || empatados.length > 1) {
    return { certeza: 'requiere_analisis', faltaInfo: [] }
  }

  return { certeza: 'clara', faltaInfo: [] }
}

// ── Completitud del wizard ────────────────────────────────────────────────
export function calcularCompletitudNegocio(d: DatosNegocio): number {
  const campos: (keyof DatosNegocio)[] = [
    'actividad',
    'forma_operacion',
    'facturacion_estimada',
    'cantidad_socios',
    'tiene_empleados',
    'provincia',
    'expectativa_crecimiento',
  ]
  const respondidos = campos.filter(c => {
    const v = d[c]
    if (Array.isArray(v)) return v.length > 0
    return v !== null && v !== undefined && v !== ''
  }).length
  return Math.round((respondidos / campos.length) * 100)
}

// ── Función principal: hace las 3 cosas juntas con la regla de seguridad
// aplicada (spec punto 15: nunca dar una falsa sensación de certeza). Los
// llamadores (API route, wizard) deberían usar esta, no compararAlternativas
// suelta, para no tener que acordarse de esta regla en cada lugar.
export function analizarProyecto(d: DatosNegocio) {
  const resultados = compararAlternativas(d)
  const { certeza, faltaInfo } = calcularCerteza(d, resultados)
  const completitud = calcularCompletitudNegocio(d)

  // Si la certeza es insuficiente, no destacamos ninguna como "recomendada"
  // — mostrar un ganador con datos insuficientes daría una falsa sensación
  // de seguridad, justo lo que la spec pide evitar.
  if (certeza === 'insuficiente') {
    resultados.forEach(r => { r.es_recomendada = false })
  }

  return { resultados, certeza, faltaInfo, completitud }
}
