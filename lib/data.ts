import type { TipoContribuyente, CategoriaMonotributo } from './types'

// ── Terminación CUIT → día de vencimiento ───────────────
export const TERMINACION_DIAS: Record<string, number> = {
  '0': 3, '1': 4, '2': 5, '3': 6, '4': 7,
  '5': 10, '6': 11, '7': 12, '8': 13, '9': 14,
}

// ── Categorías de Monotributo (A–K) ─────────────────────
// Snapshot de emergencia de la fuente versionada en Supabase.
// Fuente oficial: ARCA — valores vigentes desde el 01/08/2026.
// https://www.arca.gob.ar/monotributo/categorias.asp
// Última verificación manual: 31/08/2026

export const VIGENCIA_MONTOS = 'Vigente desde el 01/08/2026 — Fuente: ARCA — verificado el 31/08/2026'

export const CATEGORIAS_MONO: CategoriaMonotributo[] = [
  // imp = impuesto integrado (servicios), prev = aportes SIPA, os se suma aparte
  { letra: 'A', limite_anual: 12009410.45,  imp: 5585.77,    prev: 18246.86  },
  { letra: 'B', limite_anual: 17595182.74,  imp: 10612.98,   prev: 20071.55  },
  { letra: 'C', limite_anual: 24670494.31,  imp: 18246.86,   prev: 22078.71  },
  { letra: 'D', limite_anual: 30628651.43,  imp: 29790.79,   prev: 24286.58  },
  { letra: 'E', limite_anual: 36028231.33,  imp: 55857.73,   prev: 26715.24  },
  { letra: 'F', limite_anual: 45151659.41,  imp: 78573.20,   prev: 29386.76  },
  { letra: 'G', limite_anual: 53995798.87,  imp: 142995.76,  prev: 41141.46  },
  { letra: 'H', limite_anual: 81924660.37,  imp: 409623.31,  prev: 57598.04  },
  { letra: 'I', limite_anual: 91699761.90,  imp: 814591.79,  prev: 80637.26  },
  { letra: 'J', limite_anual: 105012519.20, imp: 977510.14,  prev: 112892.16 },
  { letra: 'K', limite_anual: 126610838.75, imp: 1368514.20, prev: 158049.02 },
]

export const OS_EXTRA = 25694.55 // Categorías A-C; categorías superiores varían según ARCA

// ── Tabla de montos (FUENTE ÚNICA) ──────────────────────
export const MONTOS = {
  mono: {
    cats:    CATEGORIAS_MONO.map(c => c.letra),
    limites: ['$12,0M','$17,6M','$24,7M','$30,6M','$36,0M','$45,2M','$54,0M','$81,9M','$91,7M','$105,0M','$126,6M'],
    imp:     CATEGORIAS_MONO.map(c => c.imp),
    prev:    CATEGORIAS_MONO.map(c => c.prev),
    os:      OS_EXTRA,
  },
  ri: {
    cats:    ['Pequeño RI (hasta $30M)', 'Mediano RI (hasta $100M)', 'Gran RI (más de $100M)'],
    limites: ['hasta $30M/año', 'hasta $100M/año', 'más de $100M/año'],
    imp:     [18000, 35000, 60000],
    prev:    [28000, 40000, 50000],
    os:      0,
  },
  aut: {
    cats:    ['Categoría I', 'Categoría II', 'Categoría III', 'Categoría IV', 'Categoría V'],
    limites: ['menor actividad', '—', '—', '—', 'mayor actividad'],
    imp:     [15000, 22000, 32000, 48000, 65000],
    prev:    [22000, 28000, 35000, 45000, 58000],
    os:      0,
  },
}

// ── Tipo UI de vencimiento (con dia_mes) ─────────────────
export interface VencimientoUI {
  id: string
  nombre: string
  emoji: string
  detalle: string
  dia_mes: number
  tipo: string
  fecha: string
}

export type AlertaUI = {
  id: string
  icon: string
  tipo: 'warn' | 'info' | 'danger'
  title: string
  description: string
}

// ── Fallback de vencimientos (FUENTE ÚNICA) ──────────────
export const FALLBACK_VENC: Record<TipoContribuyente, VencimientoUI[]> = {
  mono: [
    { id:'1', nombre:'Monotributo — cuota mensual', emoji:'📋', detalle:'Fecha general; verificá feriados en el calendario oficial de ARCA', dia_mes:20, tipo:'mono', fecha:'' },
  ],
  ri: [
    { id:'4',  nombre:'IVA (term. 0-1)',             emoji:'🧾', detalle:'Terminación CUIT 0 o 1 — Presentación y pago',  dia_mes:19, tipo:'ri', fecha:'' },
    { id:'5',  nombre:'IVA (term. 2-3)',             emoji:'🧾', detalle:'Terminación CUIT 2 o 3 — Presentación y pago',  dia_mes:20, tipo:'ri', fecha:'' },
    { id:'6',  nombre:'IVA (term. 4-5)',             emoji:'🧾', detalle:'Terminación CUIT 4 o 5 — Presentación y pago',  dia_mes:21, tipo:'ri', fecha:'' },
    { id:'7',  nombre:'IVA (term. 6-7)',             emoji:'🧾', detalle:'Terminación CUIT 6 o 7 — Presentación y pago',  dia_mes:22, tipo:'ri', fecha:'' },
    { id:'8',  nombre:'IVA (term. 8-9)',             emoji:'🧾', detalle:'Terminación CUIT 8 o 9 — Presentación y pago',  dia_mes:23, tipo:'ri', fecha:'' },
    { id:'9',  nombre:'Ganancias — Anticipo',        emoji:'💼', detalle:'Anticipo mensual personas jurídicas y físicas', dia_mes:25, tipo:'ri', fecha:'' },
    { id:'10', nombre:'Bienes Personales — Anticipo',emoji:'🏠', detalle:'Anticipo mensual',                              dia_mes:22, tipo:'ri', fecha:'' },
    { id:'11', nombre:'SUSS / Contribuciones',       emoji:'👥', detalle:'Contribuciones patronales si tenés empleados',  dia_mes:12, tipo:'ri', fecha:'' },
  ],
  aut: [
    { id:'12', nombre:'Autónomos — Aporte mensual',  emoji:'⚡', detalle:'Aporte mensual según categoría (I a V)',        dia_mes:8,  tipo:'aut', fecha:'' },
    { id:'13', nombre:'IVA — Si estás inscripto',    emoji:'🧾', detalle:'Presentación y pago mensual de IVA',            dia_mes:19, tipo:'aut', fecha:'' },
    { id:'14', nombre:'Ganancias — Anticipo',         emoji:'💼', detalle:'Anticipo mensual personas humanas',             dia_mes:25, tipo:'aut', fecha:'' },
    { id:'15', nombre:'Bienes Personales — Anticipo', emoji:'🏠', detalle:'Anticipo mensual si corresponde',              dia_mes:22, tipo:'aut', fecha:'' },
  ],
}

// ── Fallback de alertas (FUENTE ÚNICA) ──────────────────
export const FALLBACK_ALERTAS: Record<TipoContribuyente, AlertaUI[]> = {
  mono: [
    { id:'a1', icon:'🔄', tipo:'warn',   title:'Recategorización abierta', description:'Período enero-febrero. Revisá si tus ingresos cambiaron.' },
    { id:'a2', icon:'💰', tipo:'warn',   title:'Nuevos valores de cuota',  description:'Los montos del monotributo se actualizaron. Verificá en ARCA.' },
    { id:'a3', icon:'📢', tipo:'info',   title:'ARCA reemplaza a AFIP',    description:'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.' },
  ],
  ri: [
    { id:'a4', icon:'📅', tipo:'warn',   title:'IVA según terminación de CUIT', description:'El vencimiento del IVA varía según el último dígito de tu CUIT. Revisá tu fecha exacta.' },
    { id:'a5', icon:'💼', tipo:'danger', title:'Retenciones y percepciones',    description:'Si sufriste retenciones o percepciones, descontálas de tu IVA. Verificá el F.2002.' },
    { id:'a6', icon:'📑', tipo:'warn',   title:'Factura A con CBU',             description:'Para emitir factura A necesitás validar el CBU en ARCA. Sin esto, solo podés emitir B.' },
    { id:'a7', icon:'📢', tipo:'info',   title:'ARCA reemplaza a AFIP',         description:'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.' },
  ],
  aut: [
    { id:'a8',  icon:'⚡', tipo:'warn', title:'Ajuste de categorías autónomos', description:'Las categorías de autónomos se actualizan por inflación. Verificá la tuya.' },
    { id:'a9',  icon:'💰', tipo:'warn', title:'Aportes jubilatorios',            description:'El importe varía según tu categoría (I a V). Confirmá el monto en ARCA.' },
    { id:'a10', icon:'📑', tipo:'info', title:'Podés estar inscripto en IVA',   description:'Si además de autónomo estás inscripto en IVA, tenés vencimientos mensuales adicionales.' },
    { id:'a11', icon:'📢', tipo:'info', title:'ARCA reemplaza a AFIP',          description:'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.' },
  ],
}

// ── Helpers de fecha ─────────────────────────────────────
export function addFecha(v: VencimientoUI): VencimientoUI {
  const n = new Date()
  const fecha = new Date(n.getFullYear(), n.getMonth(), v.dia_mes)
  if (fecha < new Date(n.getFullYear(), n.getMonth(), n.getDate())) fecha.setMonth(fecha.getMonth() + 1)
  return { ...v, fecha: fecha.toISOString() }
}

export function diffDias(f: string): number {
  const h = new Date(); h.setHours(0,0,0,0)
  const d = new Date(f); d.setHours(0,0,0,0)
  return Math.round((d.getTime() - h.getTime()) / 86400000)
}

export function fmtLarga(f: string): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' }).format(new Date(f))
}

export function fmtCorta(f: string): string {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(f))
}

export function money(n: number): string {
  return '$' + n.toLocaleString('es-AR')
}

// Aliases para compatibilidad con componentes existentes
export const formatMoney      = money
export const formatFechaLarga = fmtLarga
export const formatFechaCorta = fmtCorta



// ── Navegación del sidebar (FUENTE ÚNICA) ────────────────
export const NAV_ITEMS = [
  { href: '/',                        emoji: '📋', label: 'Monotributo',        group: 'regimen' },
  { href: '/responsable-inscripto',   emoji: '🧾', label: 'Resp. Inscripto',    group: 'regimen' },
  { href: '/autonomos',               emoji: '⚡', label: 'Autónomos',          group: 'regimen' },
  { href: '/mi-categoria',            emoji: '📊', label: 'Mi categoría',       group: 'herramientas' },
  { href: '/como-facturar',           emoji: '📄', label: 'Cómo facturar',      group: 'herramientas' },
  { href: '/calendario-fiscal',       emoji: '📅', label: 'Calendario Fiscal',  group: 'herramientas' },
  { href: '/iva',                     emoji: '💰', label: 'IVA',                group: 'calculadoras' },
  { href: '/ingresos-brutos',         emoji: '📈', label: 'Ingresos Brutos',    group: 'calculadoras' },
  { href: '/impuesto-ganancias',      emoji: '💼', label: 'Ganancias',          group: 'calculadoras' },
  { href: '/impuestos-importacion',   emoji: '📦', label: 'Importaciones',      group: 'calculadoras' },
  { href: '/impuestos-por-provincia', emoji: '🗺️', label: 'Por provincia',      group: 'calculadoras' },
  { href: '/mipanel/financiero',      emoji: '💼', label: 'Panel financiero',   group: 'mipanel' },
  { href: '/mipanel/facturacion',     emoji: '🧾', label: 'Facturación',        group: 'mipanel' },
]
