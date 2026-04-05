import type { TipoContribuyente, CategoriaMonotributo } from './types'

// ── Terminación CUIT → día de vencimiento ───────────────
export const TERMINACION_DIAS: Record<string, number> = {
  '0': 3, '1': 4, '2': 5, '3': 6, '4': 7,
  '5': 10, '6': 11, '7': 12, '8': 13, '9': 14,
}

// ── Categorías de Monotributo (A–K) ─────────────────────
export const CATEGORIAS_MONO: CategoriaMonotributo[] = [
  { letra: 'A', limite_anual: 6450000,  imp: 11000, prev: 28000 },
  { letra: 'B', limite_anual: 9450000,  imp: 12400, prev: 28000 },
  { letra: 'C', limite_anual: 13250000, imp: 13900, prev: 28000 },
  { letra: 'D', limite_anual: 16450000, imp: 17000, prev: 28000 },
  { letra: 'E', limite_anual: 19350000, imp: 20500, prev: 28000 },
  { letra: 'F', limite_anual: 24250000, imp: 25000, prev: 28000 },
  { letra: 'G', limite_anual: 29000000, imp: 30000, prev: 28000 },
  { letra: 'H', limite_anual: 44000000, imp: 42000, prev: 28000 },
  { letra: 'I', limite_anual: 52000000, imp: 55000, prev: 28000 },
  { letra: 'J', limite_anual: 62000000, imp: 70000, prev: 28000 },
  { letra: 'K', limite_anual: 72000000, imp: 85000, prev: 28000 },
]

export const OS_EXTRA = 14000

// ── Tabla de montos (FUENTE ÚNICA) ──────────────────────
export const MONTOS = {
  mono: {
    cats:    CATEGORIAS_MONO.map(c => c.letra),
    limites: ['$6,4M','$9,4M','$13,2M','$16,4M','$19,3M','$24,2M','$29M','$44M','$52M','$62M','$72M'],
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
    { id:'1', nombre:'Monotributo (term. 0-4)', emoji:'📋', detalle:'Terminación CUIT 0, 1, 2, 3 o 4', dia_mes:3,  tipo:'mono', fecha:'' },
    { id:'2', nombre:'Monotributo (term. 5-9)', emoji:'📋', detalle:'Terminación CUIT 5, 6, 7, 8 o 9', dia_mes:10, tipo:'mono', fecha:'' },
    { id:'3', nombre:'Obra Social / Previsional',emoji:'🏥', detalle:'Componente previsional',           dia_mes:12, tipo:'mono', fecha:'' },
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
  return { ...v, fecha: new Date(n.getFullYear(), n.getMonth(), v.dia_mes).toISOString() }
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



// ── Navegación del sidebar (FUENTE ÚNICA) ────────────────
export const NAV_ITEMS = [
  { href: '/',                       emoji: '📋', label: 'Monotributo',       group: 'regimen' },
  { href: '/responsable-inscripto',  emoji: '🧾', label: 'Resp. Inscripto',   group: 'regimen' },
  { href: '/autonomos',              emoji: '⚡', label: 'Autónomos',         group: 'regimen' },
  { href: '/mi-categoria',           emoji: '📊', label: 'Mi categoría',      group: 'herramientas' },
  { href: '/como-facturar',          emoji: '📄', label: 'Cómo facturar',     group: 'herramientas' },
  { href: '/iva',                    emoji: '💰', label: 'IVA',               group: 'calculadoras' },
  { href: '/ingresos-brutos',        emoji: '📈', label: 'Ingresos Brutos',   group: 'calculadoras' },
  { href: '/impuesto-ganancias',     emoji: '💼', label: 'Ganancias',         group: 'calculadoras' },
  { href: '/impuestos-importacion',  emoji: '📦', label: 'Importaciones',     group: 'calculadoras' },
  { href: '/impuestos-por-provincia',emoji: '🗺️', label: 'Por provincia',     group: 'calculadoras' },
]
