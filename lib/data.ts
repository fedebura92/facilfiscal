import type { Vencimiento, Alerta, TipoContribuyente, CategoriaMonotributo } from './types'

// ── Terminación CUIT → día de vencimiento ───────────────
export const TERMINACION_DIAS: Record<string, number> = {
  '0': 3, '1': 4, '2': 5, '3': 6, '4': 7,
  '5': 10, '6': 11, '7': 12, '8': 13, '9': 14,
}

// ── Tabla de vencimientos por tipo ──────────────────────
// En producción: fetch desde Supabase tabla "vencimientos"
export const VENCIMIENTOS_BASE: Record<TipoContribuyente, Omit<Vencimiento, 'fecha'>[]> = {
  mono: [
    { id: 'mono-1', nombre: 'Monotributo', emoji: '📋', dia: 10, detalle: 'Terminación CUIT 0–4 · pago mensual', tipo: 'mono' },
    { id: 'mono-2', nombre: 'Monotributo', emoji: '📋', dia: 14, detalle: 'Terminación CUIT 5–9 · pago mensual', tipo: 'mono' },
    { id: 'mono-3', nombre: 'Obra Social / Previsional', emoji: '🏥', dia: 12, detalle: 'Componente previsional del monotributo', tipo: 'mono' },
  ],
  ri: [
    { id: 'ri-1', nombre: 'IVA', emoji: '🧾', dia: 19, detalle: 'Presentación y pago mensual', tipo: 'ri' },
    { id: 'ri-2', nombre: 'Ganancias anticipo', emoji: '💼', dia: 25, detalle: 'Anticipo mensual personas jurídicas y humanas', tipo: 'ri' },
    { id: 'ri-3', nombre: 'SUSS Empleadores', emoji: '👥', dia: 12, detalle: 'Contribuciones patronales y aportes', tipo: 'ri' },
    { id: 'ri-4', nombre: 'Bienes Personales', emoji: '🏠', dia: 22, detalle: 'Anticipo mensual', tipo: 'ri' },
  ],
  aut: [
    { id: 'aut-1', nombre: 'Autónomos', emoji: '⚡', dia: 8, detalle: 'Aporte mensual categorías I–V', tipo: 'aut' },
    { id: 'aut-2', nombre: 'IVA', emoji: '🧾', dia: 19, detalle: 'Si estás inscripto en IVA', tipo: 'aut' },
    { id: 'aut-3', nombre: 'Ganancias anticipo', emoji: '💼', dia: 25, detalle: 'Anticipo mensual personas humanas', tipo: 'aut' },
  ],
}

// Agrega la fecha del mes actual a cada vencimiento
export function getVencimientosConFecha(tipo: TipoContribuyente): Vencimiento[] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return VENCIMIENTOS_BASE[tipo]
    .map(v => ({ ...v, fecha: new Date(y, m, v.dia) }))
    .sort((a, b) => (a.fecha!.getTime()) - (b.fecha!.getTime()))
}

// ── Alertas por tipo ─────────────────────────────────────
// En producción: fetch desde Supabase tabla "alertas"
export const ALERTAS_STATIC: Record<TipoContribuyente, Alerta[]> = {
  mono: [
    { id: 'a1', icon: '🔄', tipo: 'warn', title: 'Recategorización abierta', desc: 'Período enero–febrero. Revisá si tus ingresos o parámetros cambiaron.', tipo_contribuyente: 'mono', activa: true },
    { id: 'a2', icon: '💰', tipo: 'warn', title: 'Nuevos valores de cuota', desc: 'Los montos del monotributo se actualizaron. Verificá tu cuota vigente en ARCA.', tipo_contribuyente: 'mono', activa: true },
    { id: 'a3', icon: '📢', tipo: 'info', title: 'ARCA reemplaza a AFIP', desc: 'Todos los trámites siguen disponibles en afip.gob.ar y arca.gob.ar.', tipo_contribuyente: 'mono', activa: true },
  ],
  ri: [
    { id: 'a4', icon: '📅', tipo: 'warn', title: 'IVA bimestral – revisá', desc: 'Si sos contribuyente bimestral, verificá el cronograma específico.', tipo_contribuyente: 'ri', activa: true },
    { id: 'a5', icon: '💼', tipo: 'danger', title: 'Retenciones y percepciones', desc: 'Verificá si debés presentar F.2002 o F.572 este mes.', tipo_contribuyente: 'ri', activa: true },
    { id: 'a6', icon: '📢', tipo: 'info', title: 'Cambios en alícuotas 2026', desc: 'Consultá novedades en el portal de ARCA antes de tu próxima presentación.', tipo_contribuyente: 'ri', activa: true },
  ],
  aut: [
    { id: 'a7', icon: '⚡', tipo: 'warn', title: 'Ajuste de categorías', desc: 'Las categorías de autónomos se actualizan por inflación. Verificá la tuya.', tipo_contribuyente: 'aut', activa: true },
    { id: 'a8', icon: '💰', tipo: 'warn', title: 'Aportes jubilatorios', desc: 'El importe varía según categoría. Confirmá el monto vigente en ARCA.', tipo_contribuyente: 'aut', activa: true },
    { id: 'a9', icon: '📢', tipo: 'info', title: 'Factura electrónica oblig.', desc: 'Todos deben emitir comprobantes electrónicos. Activá tu punto de venta.', tipo_contribuyente: 'aut', activa: true },
  ],
}

// ── Categorías de Monotributo ────────────────────────────
// Actualizar estos montos cuando ARCA publique nuevas tablas
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

// ── Helpers de fecha ─────────────────────────────────────
export function diffDias(fecha: Date): number {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const f = new Date(fecha); f.setHours(0, 0, 0, 0)
  return Math.round((f.getTime() - hoy.getTime()) / 86400000)
}

export function formatFechaLarga(fecha: Date): string {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' }).format(fecha)
}

export function formatFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(fecha)
}

export function formatMoney(n: number): string {
  return '$' + n.toLocaleString('es-AR')
}
