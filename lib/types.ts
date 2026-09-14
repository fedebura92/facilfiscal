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
  os?: number
  imp_productos?: number
  total_servicios?: number
  total_productos?: number
}

export interface ResultadoCalculo {
  impositivo: number
  previsional: number
  obraSocial: number
  total: number
}

// ── Mi Perfil v2 ─────────────────────────────────────────
export type SituacionFiscal = 'mono' | 'ri' | 'exento' | 'no_inscripto' | 'no_se'

export type FormaOperacion = 'local_fisico' | 'oficina' | 'fabrica' | 'domicilio' | 'online' | 'mixto'

export interface PerfilDataExtra {
  situaciones_especiales?: string[]
  tipo_clientes?: string[]
  canales_venta?: string[]
  medios_cobro?: string[]
  empleados_detalle?: {
    art?: boolean
    convenio_colectivo?: string
  }
}

export interface PerfilFiscal {
  id: string
  email?: string

  nombre?: string
  dni?: string
  cuit?: string
  telefono?: string
  domicilio_fiscal?: string

  nombre_fantasia?: string
  actividad?: string
  actividad_principal?: string
  actividades_secundarias?: string[]
  fecha_inicio_actividad?: string
  cantidad_sucursales?: number
  forma_operacion?: FormaOperacion[]

  situacion_fiscal?: SituacionFiscal
  categoria_monotributo?: string
  fecha_alta_fiscal?: string
  inscripto_iva?: boolean | null
  inscripto_ganancias?: boolean | null
  inscripto_autonomos?: boolean | null

  provincia?: string
  localidad?: string
  inscripto_iibb?: boolean | null
  convenio_multilateral?: boolean | null
  otras_jurisdicciones?: string[]

  tiene_empleados?: boolean | null
  cantidad_empleados?: number | null

  facturacion_estimada?: number | null
  rango_facturacion?: string

  terminacion_cuit?: string
  tipo_contribuyente?: string

  perfil_completitud?: number
  perfil_onboarding_step?: string
  perfil_data?: PerfilDataExtra

  updated_at?: string
}

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

export interface DatosNegocio {
  actividad?: string
  forma_operacion?: string[]
  facturacion_estimada?: number | null
  inversion_inicial?: number | null
  cantidad_socios?: number
  socios_detalle?: { participaciones?: number[] }
  tiene_empleados?: boolean | null
  cantidad_empleados?: number | null
  tipo_clientes?: string[]
  provincia?: string
  localidad?: string
  provincias_operacion?: string[]
  venta_online?: boolean | null
  importaciones?: boolean | null
  exportaciones?: boolean | null
  expectativa_crecimiento?: ExpectativaCrecimiento
  otras_circunstancias?: string

  nombre_fantasia?: string
  cuit?: string
  terminacion_cuit?: string
  situacion_fiscal?: SituacionFiscal
  categoria_monotributo?: string
  fecha_alta_fiscal?: string
  inscripto_iva?: boolean | null
  inscripto_ganancias?: boolean | null
  inscripto_autonomos?: boolean | null
  inscripto_iibb?: boolean | null
  convenio_multilateral?: boolean | null
  perfil_data?: PerfilDataExtra

  relacion?: RelacionNegocio
  alternativa_elegida?: AlternativaKey
}

export type RelacionNegocio = 'titular' | 'socio' | 'administrador' | 'empleado' | 'otro'
export type TipoEntidadFiscal = 'persona_fisica' | 'persona_juridica' | 'tercero'
export type EstadoEntidadFiscal = 'activa' | 'inactiva'
export type PermisoEntidad = 'ver' | 'cargar' | 'administrar'

export interface EntidadFiscal {
  id: string
  creada_por: string
  tipo: TipoEntidadFiscal
  nombre: string
  cuit?: string | null
  terminacion_cuit?: string | null
  regimen_fiscal?: SituacionFiscal | null
  provincia?: string | null
  localidad?: string | null
  estado: EstadoEntidadFiscal
  proyecto_origen_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface NegocioProyecto {
  id: string
  user_id: string
  estado: EstadoProyecto
  nombre?: string
  entidad_fiscal_id?: string | null
  relacion?: RelacionNegocio | null
  entidad_fiscal?: EntidadFiscal | null
  datos: DatosNegocio
  completitud: number
  certeza?: Certeza | null
  falta_info?: string[]
  alternativa_recomendada?: AlternativaKey | null
  created_at?: string
  updated_at?: string
}

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
  adecuacion: Nivel | null
  explicacion: string
  desventajas: string[]
  criterios: CriteriosAlternativa
  es_recomendada: boolean
}

// ── Motor de reglas fiscales ─────────────────────────────────────────────
// Forma mínima que necesita lib/reglas-fiscales.ts para calcular obligaciones.
// Incluye actividad porque Mi Panel puede advertir inconsistencias como
// "tenés actividad declarada pero no estás inscripto en IIBB" sin afirmar
// automáticamente que exista deuda u obligación confirmada.
export interface SituacionFiscalInput {
  situacion_fiscal?: SituacionFiscal
  alternativa_elegida?: AlternativaKey
  actividad?: string
  actividad_principal?: string
  inscripto_autonomos?: boolean | null
  provincia?: string
  inscripto_iibb?: boolean | null
  otras_jurisdicciones?: string[]
  provincias_operacion?: string[]
  tiene_empleados?: boolean | null
  cantidad_empleados?: number | null
  perfil_data?: PerfilDataExtra
}

export type OrigenDiagnostico = 'perfil' | 'negocio'
