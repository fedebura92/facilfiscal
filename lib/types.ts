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

// ── Crear Mi Negocio ─────────────────────────────────────────────────────
export type EstadoProyecto = 'simulacion' | 'proyecto' | 'activo'
export type Certeza = 'clara' | 'requiere_analisis' | 'insuficiente'
export type AlternativaKey = 'monotributo' | 'regimen_general' | 'sociedad'
export type Nivel = 'alta' | 'media' | 'baja'
export type ExpectativaCrecimiento = 'baja' | 'media' | 'alta'

// Respuestas del wizard — igual que PerfilDataExtra, estructura libre para
// lo condicional (no todos los campos aplican a todos los proyectos).
export interface DatosNegocio {
  actividad?: string
  forma_operacion?: string[]           // 'local_fisico' | 'oficina' | 'fabrica' | 'domicilio' | 'online' | 'mixto'
  facturacion_estimada?: number | null // mensual, en pesos
  inversion_inicial?: number | null
  cantidad_socios?: number             // 1 = individual, sin socios
  socios_detalle?: { participaciones?: number[] }
  tiene_empleados?: boolean | null
  cantidad_empleados?: number | null
  tipo_clientes?: string[]             // 'consumidor_final' | 'monotributistas' | 'responsables_inscriptos' | 'empresas' | 'exterior'
  provincia?: string
  provincias_operacion?: string[]      // más de una => Convenio Multilateral
  venta_online?: boolean | null
  importaciones?: boolean | null
  exportaciones?: boolean | null
  expectativa_crecimiento?: ExpectativaCrecimiento
  otras_circunstancias?: string

  // ── Situación fiscal de ESTE negocio. Antes vivía una sola vez en
  // profiles (una persona = una situación fiscal); ahora cada negocio tiene
  // la propia, porque una misma persona puede ser Responsable Inscripto
  // para un local Y Monotributista para otra actividad al mismo tiempo. ──
  nombre_fantasia?: string
  cuit?: string                          // puede ser propio (sociedad) o el de la persona
  terminacion_cuit?: string
  situacion_fiscal?: SituacionFiscal
  categoria_monotributo?: string
  fecha_alta_fiscal?: string
  inscripto_iva?: boolean | null
  inscripto_ganancias?: boolean | null
  inscripto_autonomos?: boolean | null
  inscripto_iibb?: boolean | null
  convenio_multilateral?: boolean | null
  // Mismo shape que PerfilFiscal.perfil_data, para que lib/reglas-fiscales.ts
  // funcione igual sobre un negocio que sobre un perfil de persona, sin
  // necesitar un adaptador.
  perfil_data?: PerfilDataExtra

  // ── Relación de la persona con este negocio ──────────────────────────
  // Importa para saber a quién le corresponde cada obligación: si sos
  // 'empleado' de este negocio (no dueño/socio), las obligaciones fiscales
  // del negocio no son tuyas personalmente — trabajás en relación de
  // dependencia para otra persona/entidad que sí es la responsable.
  relacion?: RelacionNegocio
}

export type RelacionNegocio = 'titular' | 'socio' | 'administrador' | 'empleado' | 'otro'

export interface NegocioProyecto {
  id: string
  user_id: string
  estado: EstadoProyecto
  nombre?: string
  datos: DatosNegocio
  completitud: number
  certeza?: Certeza | null
  falta_info?: string[]
  alternativa_recomendada?: AlternativaKey | null
  created_at?: string
  updated_at?: string
}

// Criterios de la tabla comparativa (spec punto 7)
export interface CriteriosAlternativa {
  simplicidad?: Nivel
  costos_administrativos?: Nivel
  escalabilidad?: Nivel
  complejidad?: Nivel
}

export interface AnalisisAlternativa {
  proyecto_id?: string
  alternativa_key: AlternativaKey
  label: string
  adecuacion: Nivel | null           // null = sin info suficiente para esta alternativa puntual
  explicacion: string
  desventajas: string[]
  criterios: CriteriosAlternativa
  es_recomendada: boolean
}

// ── Motor de reglas fiscales ─────────────────────────────────────────────
// Forma mínima que necesita lib/reglas-fiscales.ts para calcular
// obligaciones. Tanto PerfilFiscal (una persona) como DatosNegocio (un
// negocio puntual) la satisfacen estructuralmente, así que el mismo
// calcularDiagnostico() sirve para los dos casos sin adaptador.
export interface SituacionFiscalInput {
  situacion_fiscal?: SituacionFiscal
  inscripto_autonomos?: boolean | null
  provincia?: string
  inscripto_iibb?: boolean | null
  otras_jurisdicciones?: string[]
  provincias_operacion?: string[]
  tiene_empleados?: boolean | null
  cantidad_empleados?: number | null
  perfil_data?: PerfilDataExtra
}
