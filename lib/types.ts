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

// ── Mi Perfil v2 ─────────────────────────────────────────
// situacion_fiscal incluye 'no_se': la spec exige que "no sé" sea una
// respuesta válida, no un valor faltante.
export type SituacionFiscal = 'mono' | 'ri' | 'exento' | 'no_inscripto' | 'no_se'

export type FormaOperacion = 'local_fisico' | 'oficina' | 'fabrica' | 'domicilio' | 'online' | 'mixto'

// Bloque libre para lo condicional/situacional de baja frecuencia.
// Se extiende sin migraciones (ver supabase-schema-perfil.sql).
export interface PerfilDataExtra {
  situaciones_especiales?: string[]   // 'importaciones' | 'exportaciones' | 'servicios_exterior' | 'comercio_electronico' | 'alquiler_local' | ...
  tipo_clientes?: string[]            // 'consumidor_final' | 'monotributistas' | 'responsables_inscriptos' | 'empresas' | 'exterior'
  canales_venta?: string[]            // 'local' | 'online' | 'mercado_libre' | 'redes_sociales' | 'otros'
  medios_cobro?: string[]             // 'efectivo' | 'transferencia' | 'mercadopago' | 'tarjeta' | 'otros'
  empleados_detalle?: {
    art?: boolean
    convenio_colectivo?: string
  }
}

export interface PerfilFiscal {
  id: string
  email?: string

  // Datos personales
  nombre?: string
  dni?: string
  cuit?: string
  telefono?: string
  domicilio_fiscal?: string

  // Negocio
  nombre_fantasia?: string
  actividad?: string                     // legado, mantenido por compatibilidad
  actividad_principal?: string
  actividades_secundarias?: string[]
  fecha_inicio_actividad?: string        // ISO date
  cantidad_sucursales?: number
  forma_operacion?: FormaOperacion[]

  // Situación fiscal
  situacion_fiscal?: SituacionFiscal
  categoria_monotributo?: string
  fecha_alta_fiscal?: string
  inscripto_iva?: boolean | null
  inscripto_ganancias?: boolean | null
  inscripto_autonomos?: boolean | null

  // Jurisdicciones
  provincia?: string
  localidad?: string
  inscripto_iibb?: boolean | null
  convenio_multilateral?: boolean | null
  otras_jurisdicciones?: string[]

  // Empleados
  tiene_empleados?: boolean | null
  cantidad_empleados?: number | null

  // Facturación
  facturacion_estimada?: number | null
  rango_facturacion?: string

  // Identificación/vencimientos
  terminacion_cuit?: string

  // Legado: 'mono' | 'ri' | 'aut'. Se sigue escribiendo desde Mi Perfil
  // (derivado de situacion_fiscal + inscripto_autonomos) para no romper
  // el resto de la app (checklist, vencimientos, panel financiero) que
  // todavía no migró al nuevo modelo.
  tipo_contribuyente?: string

  // Meta
  perfil_completitud?: number
  perfil_onboarding_step?: string
  perfil_data?: PerfilDataExtra

  updated_at?: string
}

// ── Diagnóstico (Nivel 2, calculado por el motor de reglas) ─────────────
export interface DiagnosticoObligacion {
  id?: string
  user_id: string
  obligacion_key: string
  aplica: boolean | null
  motivo: string
  falta_info: string[]
  calculado_at?: string
}
