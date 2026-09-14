// ============================================================================
// MOTOR DE REGLAS FISCALES
// Perfil declarado (Nivel 1) → Obligaciones aplicables (Nivel 2)
//
// Principio de seguridad (spec Mi Perfil, punto 15): nunca afirmar una
// obligación si falta información. `aplica` es siempre true | false | null.
// null = "no tenemos info suficiente" → se lista en `faltaInfo`.
//
// Cada obligación tiene un `nivel`: 'persona' (le corresponde a vos como
// individuo, sin importar cuántos negocios tengas — ej: Autónomos) o
// 'negocio' (le corresponde a ESE negocio puntual — ej: IVA, IIBB).
//
// Y una `confianza`, que explica CÓMO llegamos a esa respuesta:
//   'confirmado'     → lo contestaste vos directamente.
//   'inferido'       → lo dedujimos de otra respuesta tuya.
//   'por_confirmar'  → todavía no lo sabemos.
//   'heredado'       → vendría de otro contexto relacionado.
//
// Esta es la única fuente de verdad para el diagnóstico. No duplicar esta
// lógica en componentes: importar desde acá.
// ============================================================================

import type { SituacionFiscalInput, PerfilFiscal, OrigenDiagnostico } from './types'

export type NivelObligacion = 'persona' | 'negocio'
export type NivelConfianza = 'confirmado' | 'inferido' | 'heredado' | 'por_confirmar'

export type Obligacion = {
  key: string
  label: string
  aplica: boolean | null
  motivo: string
  faltaInfo: string[]
  nivel: NivelObligacion
  confianza: NivelConfianza
  // Datos operativos para que Mi Panel no solo diga "te corresponde", sino
  // también qué clase de obligación es y a dónde ir para resolverla.
  frecuencia?: 'mensual' | 'anual' | 'semestral' | 'eventual' | 'segun-caso'
  frecuenciaLabel?: string
  detalleHref?: string
  accionLabel?: string
  requiereRevision?: boolean
}

type MetaObligacion = Pick<Obligacion, 'frecuencia' | 'frecuenciaLabel' | 'detalleHref' | 'accionLabel' | 'requiereRevision'>

const META: Record<string, MetaObligacion> = {
  autonomos: {
    frecuencia: 'mensual',
    frecuenciaLabel: 'Todos los meses',
    detalleHref: '/autonomos',
    accionLabel: 'Ver aporte y cómo pagarlo',
  },
  iva: {
    frecuencia: 'mensual',
    frecuenciaLabel: 'Todos los meses',
    detalleHref: '/iva',
    accionLabel: 'Ver IVA, vencimiento y pago',
  },
  ganancias: {
    frecuencia: 'anual',
    frecuenciaLabel: 'Declaración anual y anticipos cuando correspondan',
    detalleHref: '/impuesto-ganancias',
    accionLabel: 'Ver Ganancias',
  },
  iibb: {
    frecuencia: 'mensual',
    frecuenciaLabel: 'Generalmente mensual; depende del régimen y jurisdicción',
    detalleHref: '/ingresos-brutos',
    accionLabel: 'Revisar Ingresos Brutos',
  },
  empleados_931: {
    frecuencia: 'mensual',
    frecuenciaLabel: 'Todos los meses',
    detalleHref: '/responsable-inscripto-obligaciones',
    accionLabel: 'Ver cargas sociales',
  },
  recategorizacion: {
    frecuencia: 'semestral',
    frecuenciaLabel: 'Enero y julio, si corresponde',
    detalleHref: '/mi-categoria',
    accionLabel: 'Revisar categoría',
  },
}

function ob(
  key: string,
  label: string,
  aplica: boolean | null,
  motivo: string,
  nivel: NivelObligacion,
  confianza: NivelConfianza,
  faltaInfo: string[] = [],
  meta: Partial<MetaObligacion> = {}
): Obligacion {
  return { key, label, aplica, motivo, faltaInfo, nivel, confianza, ...(META[key] || {}), ...meta }
}

export function calcularDiagnostico(
  p: SituacionFiscalInput,
  origen: OrigenDiagnostico = 'perfil'
): Obligacion[] {
  const out: Obligacion[] = []
  const sit = p.situacion_fiscal

  // ── Situación fiscal base ────────────────────────────────────────────────
  if (!sit || sit === 'no_se') {
    out.push(
      ob(
        'situacion_fiscal',
        'Régimen fiscal',
        null,
        'Todavía no sabemos qué régimen tenés (Monotributo, Responsable Inscripto u otro). Completalo para poder decirte qué impuestos te corresponden.',
        'negocio',
        'por_confirmar',
        ['situacion_fiscal'],
        { detalleHref:'/mipanel/perfil', accionLabel:'Completar régimen fiscal', requiereRevision:true }
      )
    )
  }

  // ── Autónomos ────────────────────────────────────────────────────────────
  if (p.inscripto_autonomos === true) {
    out.push(ob('autonomos', 'Aportes como Autónomo', true, 'Hacés aportes como Autónomo. Es una obligación mensual personal, separada de las obligaciones de tus negocios.', 'persona', 'confirmado'))
  } else if (p.inscripto_autonomos === false) {
    out.push(ob('autonomos', 'Aportes como Autónomo', false, 'Nos indicaste que no hacés aportes como Autónomo.', 'persona', 'confirmado'))
  } else {
    out.push(ob('autonomos', 'Aportes como Autónomo', null, 'Falta confirmar si estás inscripto como Autónomo. Conviene revisarlo porque puede generar un aporte mensual personal.', 'persona', 'por_confirmar', ['inscripto_autonomos'], { requiereRevision:true }))
  }

  // ── IVA ──────────────────────────────────────────────────────────────────
  if (sit === 'ri') {
    out.push(ob('iva', 'IVA', true, 'Sos Responsable Inscripto: liquidás IVA todos los meses. El importe surge de tus ventas, compras computables, retenciones, percepciones y saldos anteriores.', 'negocio', 'inferido'))
  } else if (sit === 'mono') {
    out.push(ob('iva', 'IVA', false, 'El Monotributo incluye el componente impositivo: no liquidás IVA por separado mientras permanezcas en ese régimen.', 'negocio', 'inferido'))
  } else if (sit === 'exento') {
    out.push(ob('iva', 'IVA', null, 'El tratamiento depende del tipo de exención que tengas. Hay que confirmarlo antes de afirmar que no corresponde.', 'negocio', 'por_confirmar', ['tipo_exencion'], { requiereRevision:true }))
  } else {
    out.push(ob('iva', 'IVA', null, 'Necesitamos saber tu régimen fiscal para determinar si tenés que liquidar IVA.', 'negocio', 'por_confirmar', ['situacion_fiscal'], { requiereRevision:true }))
  }

  // ── Ganancias ────────────────────────────────────────────────────────────
  const nivelGanancias: NivelObligacion = origen === 'negocio' ? 'negocio' : 'persona'
  const esSociedad = p.alternativa_elegida === 'sociedad'
  if (sit === 'ri' || p.inscripto_autonomos) {
    const motivo = esSociedad
      ? 'La sociedad tributa Ganancias como persona jurídica. La declaración es anual y puede haber anticipos durante el año.'
      : 'Como Responsable Inscripto o Autónomo, en general corresponde revisar Ganancias. La declaración es anual y pueden corresponder anticipos.'
    out.push(ob('ganancias', 'Impuesto a las Ganancias', true, motivo, nivelGanancias, 'inferido'))
  } else if (sit === 'mono') {
    out.push(ob('ganancias', 'Impuesto a las Ganancias', false, 'El Monotributo reemplaza a Ganancias por esa actividad mientras te mantengas dentro del régimen.', nivelGanancias, 'inferido'))
  } else {
    out.push(ob('ganancias', 'Impuesto a las Ganancias', null, 'Necesitamos confirmar tu régimen fiscal antes de determinar si corresponde Ganancias.', nivelGanancias, 'por_confirmar', ['situacion_fiscal'], { requiereRevision:true }))
  }

  // ── Ingresos Brutos / Convenio Multilateral ─────────────────────────────
  const tieneActividad = Boolean(p.actividad_principal || p.actividad)
  const otras = p.otras_jurisdicciones?.length
    ?? p.provincias_operacion?.filter(prov => prov !== p.provincia).length
    ?? 0

  if (!p.provincia) {
    out.push(ob('iibb', 'Ingresos Brutos', null, 'Falta saber en qué provincia operás. La jurisdicción es necesaria para determinar el régimen de Ingresos Brutos.', 'negocio', 'por_confirmar', ['provincia'], { requiereRevision:true }))
  } else if (p.inscripto_iibb === true) {
    if (otras > 0) {
      out.push(ob('iibb', 'Ingresos Brutos', true, `Estás inscripto y operás en ${p.provincia} y en ${otras} jurisdicción(es) más. Hay que revisar Convenio Multilateral y no liquidar todo como contribuyente local.`, 'negocio', 'confirmado'))
    } else {
      out.push(ob('iibb', 'Ingresos Brutos', true, `Estás inscripto en Ingresos Brutos de ${p.provincia}. En general es una obligación mensual; el importe y la forma de pago dependen de tu actividad y régimen provincial.`, 'negocio', 'confirmado'))
    }
  } else if (p.inscripto_iibb === false) {
    // Cambio importante: "no estoy inscripto" describe el estado declarado,
    // pero NO demuestra que IIBB no corresponda. Si hay actividad económica
    // y provincia conocida, Mi Panel debe advertir que puede faltar un alta.
    if (tieneActividad && sit && sit !== 'no_se' && sit !== 'no_inscripto') {
      out.push(ob(
        'iibb',
        'Ingresos Brutos',
        null,
        `Nos dijiste que no estás inscripto en Ingresos Brutos, pero tenés una actividad declarada en ${p.provincia}. Eso no significa automáticamente que estés exento: conviene revisar si te corresponde el alta o un régimen simplificado provincial.`,
        'negocio',
        'por_confirmar',
        ['confirmar_iibb'],
        { requiereRevision:true, accionLabel:'Revisar si me corresponde IIBB' }
      ))
    } else {
      out.push(ob('iibb', 'Ingresos Brutos', false, 'Nos dijiste que no estás inscripto en Ingresos Brutos. Con los datos actuales no detectamos suficiente información para afirmar que debas inscribirte.', 'negocio', 'confirmado', ['confirmar_iibb']))
    }
  } else {
    out.push(ob('iibb', 'Ingresos Brutos', null, 'Falta confirmar si estás inscripto en Ingresos Brutos. Con tu provincia y actividad podemos ayudarte a revisar si debería corresponderte.', 'negocio', 'por_confirmar', ['inscripto_iibb'], { requiereRevision:true }))
  }

  // ── Empleados / cargas sociales (F.931) ─────────────────────────────────
  if (p.tiene_empleados === true) {
    out.push(ob('empleados_931', 'Cargas sociales (F.931)', true, `Tenés ${p.cantidad_empleados ?? 'al menos un'} empleado(s): corresponde liquidar F.931 y las obligaciones laborales asociadas todos los meses.`, 'negocio', 'confirmado'))
  } else if (p.tiene_empleados === false) {
    out.push(ob('empleados_931', 'Cargas sociales (F.931)', false, 'No tenés empleados en relación de dependencia, por lo que no te corresponde F.931 por este negocio.', 'negocio', 'confirmado'))
  } else {
    out.push(ob('empleados_931', 'Cargas sociales (F.931)', null, 'Falta saber si tenés empleados. Si los tenés, hay obligaciones mensuales adicionales.', 'negocio', 'por_confirmar', ['tiene_empleados'], { requiereRevision:true }))
  }

  // ── Recategorización de Monotributo ─────────────────────────────────────
  if (sit === 'mono') {
    out.push(ob('recategorizacion', 'Recategorización semestral', true, 'Como monotributista tenés que revisar tu categoría en enero y julio y recategorizarte sólo si corresponde según los parámetros vigentes.', 'negocio', 'inferido'))
  }

  // ── Situaciones especiales ──────────────────────────────────────────────
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
    out.push(ob(key, label, null, 'Esta situación puede generar obligaciones o tratamientos especiales. La marcamos para revisión en lugar de asumir una regla que podría no corresponder a tu caso.', 'negocio', 'por_confirmar', [key], { frecuencia:'segun-caso', frecuenciaLabel:'Según el caso', requiereRevision:true }))
  }

  return out
}

// Completitud del perfil: % de campos "clave" respondidos.
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
