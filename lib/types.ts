// ── Tipos de contribuyente ──────────────────────────────
export type TipoContribuyente = 'mono' | 'ri' | 'aut'

// ── Vencimiento ─────────────────────────────────────────
export interface Vencimiento {
  id: string
  nombre: string
  emoji: string
  detalle: string
  dia: number          // día del mes (1-31)
  tipo: TipoContribuyente
  fecha?: Date         // calculada en runtime
}

// ── Alerta ──────────────────────────────────────────────
export interface Alerta {
  id: string
  icon: string
  tipo: 'warn' | 'info' | 'danger'
  title: string
  desc: string
  tipo_contribuyente: TipoContribuyente
  activa: boolean
  created_at?: string
}

// ── Suscriptor de alertas por email ─────────────────────
export interface Suscriptor {
  id?: string
  email: string
  tipo_contribuyente: TipoContribuyente
  cuit?: string
  created_at?: string
}

// ── Calculadora ─────────────────────────────────────────
export interface CategoriaMonotributo {
  letra: string
  limite_anual: number
  imp: number
  prev: number
}

export interface ResultadoCalculo {
  impositivo: number
  previsional: number
  obraSocial: number
  total: number
}
