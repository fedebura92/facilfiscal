export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          activa: boolean | null
          created_at: string | null
          description: string | null
          fecha_expiracion: string | null
          icon: string | null
          id: string
          tipo: string | null
          tipo_contribuyente: string
          title: string
        }
        Insert: {
          activa?: boolean | null
          created_at?: string | null
          description?: string | null
          fecha_expiracion?: string | null
          icon?: string | null
          id?: string
          tipo?: string | null
          tipo_contribuyente?: string
          title: string
        }
        Update: {
          activa?: boolean | null
          created_at?: string | null
          description?: string | null
          fecha_expiracion?: string | null
          icon?: string | null
          id?: string
          tipo?: string | null
          tipo_contribuyente?: string
          title?: string
        }
        Relationships: []
      }
      datos_fiscales_versiones: {
        Row: {
          clave: string
          contenido: Json
          created_at: string
          dominio: string
          estado: string
          fuente_nombre: string
          fuente_url: string
          id: string
          publicado_at: string | null
          updated_at: string
          verificado_at: string | null
          version: number
          vigente_desde: string
          vigente_hasta: string | null
        }
        Insert: {
          clave: string
          contenido: Json
          created_at?: string
          dominio: string
          estado?: string
          fuente_nombre: string
          fuente_url: string
          id?: string
          publicado_at?: string | null
          updated_at?: string
          verificado_at?: string | null
          version: number
          vigente_desde: string
          vigente_hasta?: string | null
        }
        Update: {
          clave?: string
          contenido?: Json
          created_at?: string
          dominio?: string
          estado?: string
          fuente_nombre?: string
          fuente_url?: string
          id?: string
          publicado_at?: string | null
          updated_at?: string
          verificado_at?: string | null
          version?: number
          vigente_desde?: string
          vigente_hasta?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          email: string
          enviado_at: string | null
          error: string | null
          fecha_envio: string | null
          id: string
          tipo_email: string
          user_id: string | null
          vencimiento_id: string | null
        }
        Insert: {
          email: string
          enviado_at?: string | null
          error?: string | null
          fecha_envio?: string | null
          id?: string
          tipo_email: string
          user_id?: string | null
          vencimiento_id?: string | null
        }
        Update: {
          email?: string
          enviado_at?: string | null
          error?: string | null
          fecha_envio?: string | null
          id?: string
          tipo_email?: string
          user_id?: string | null
          vencimiento_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_vencimiento_id_fkey"
            columns: ["vencimiento_id"]
            isOneToOne: false
            referencedRelation: "vencimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      entidad_usuarios: {
        Row: {
          created_at: string
          entidad_fiscal_id: string
          permiso: string
          relacion: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entidad_fiscal_id: string
          permiso?: string
          relacion: string
          user_id: string
        }
        Update: {
          created_at?: string
          entidad_fiscal_id?: string
          permiso?: string
          relacion?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entidad_usuarios_entidad_fiscal_id_fkey"
            columns: ["entidad_fiscal_id"]
            isOneToOne: false
            referencedRelation: "entidades_fiscales"
            referencedColumns: ["id"]
          },
        ]
      }
      entidades_fiscales: {
        Row: {
          creada_por: string
          created_at: string
          cuit: string | null
          estado: string
          id: string
          localidad: string | null
          nombre: string
          provincia: string | null
          proyecto_origen_id: string | null
          regimen_fiscal: string | null
          terminacion_cuit: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          creada_por: string
          created_at?: string
          cuit?: string | null
          estado?: string
          id?: string
          localidad?: string | null
          nombre: string
          provincia?: string | null
          proyecto_origen_id?: string | null
          regimen_fiscal?: string | null
          terminacion_cuit?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          creada_por?: string
          created_at?: string
          cuit?: string | null
          estado?: string
          id?: string
          localidad?: string | null
          nombre?: string
          provincia?: string | null
          proyecto_origen_id?: string | null
          regimen_fiscal?: string | null
          terminacion_cuit?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entidades_fiscales_proyecto_origen_id_fkey"
            columns: ["proyecto_origen_id"]
            isOneToOne: true
            referencedRelation: "negocio_proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas: {
        Row: {
          cliente: string
          concepto: string | null
          created_at: string | null
          entidad_fiscal_id: string | null
          estado: string
          fecha_emision: string
          fecha_vto: string | null
          id: string
          monto: number
          negocio_id: string | null
          notas: string | null
          numero: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cliente: string
          concepto?: string | null
          created_at?: string | null
          entidad_fiscal_id?: string | null
          estado?: string
          fecha_emision?: string
          fecha_vto?: string | null
          id?: string
          monto: number
          negocio_id?: string | null
          notas?: string | null
          numero?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cliente?: string
          concepto?: string | null
          created_at?: string | null
          entidad_fiscal_id?: string | null
          estado?: string
          fecha_emision?: string
          fecha_vto?: string | null
          id?: string
          monto?: number
          negocio_id?: string | null
          notas?: string | null
          numero?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facturas_entidad_fiscal_id_fkey"
            columns: ["entidad_fiscal_id"]
            isOneToOne: false
            referencedRelation: "entidades_fiscales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_entidad_usuario_fkey"
            columns: ["entidad_fiscal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "entidad_usuarios"
            referencedColumns: ["entidad_fiscal_id", "user_id"]
          },
          {
            foreignKeyName: "facturas_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocio_proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      ingresos_mensuales: {
        Row: {
          anio: number
          created_at: string | null
          entidad_fiscal_id: string | null
          id: string
          mes: number
          monto: number
          negocio_id: string | null
          notas: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anio: number
          created_at?: string | null
          entidad_fiscal_id?: string | null
          id?: string
          mes: number
          monto?: number
          negocio_id?: string | null
          notas?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anio?: number
          created_at?: string | null
          entidad_fiscal_id?: string | null
          id?: string
          mes?: number
          monto?: number
          negocio_id?: string | null
          notas?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingresos_entidad_usuario_fkey"
            columns: ["entidad_fiscal_id", "user_id"]
            isOneToOne: false
            referencedRelation: "entidad_usuarios"
            referencedColumns: ["entidad_fiscal_id", "user_id"]
          },
          {
            foreignKeyName: "ingresos_mensuales_entidad_fiscal_id_fkey"
            columns: ["entidad_fiscal_id"]
            isOneToOne: false
            referencedRelation: "entidades_fiscales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingresos_mensuales_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocio_proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      montos_monotributo: {
        Row: {
          fuente: string | null
          id: number
          imp_productos: number
          imp_servicios: number
          letra: string
          limite_anual: number
          orden: number
          os: number
          prev_sipa: number
          total_productos: number
          total_servicios: number
          updated_at: string | null
          vigencia: string
        }
        Insert: {
          fuente?: string | null
          id?: number
          imp_productos: number
          imp_servicios: number
          letra: string
          limite_anual: number
          orden: number
          os: number
          prev_sipa: number
          total_productos: number
          total_servicios: number
          updated_at?: string | null
          vigencia: string
        }
        Update: {
          fuente?: string | null
          id?: number
          imp_productos?: number
          imp_servicios?: number
          letra?: string
          limite_anual?: number
          orden?: number
          os?: number
          prev_sipa?: number
          total_productos?: number
          total_servicios?: number
          updated_at?: string | null
          vigencia?: string
        }
        Relationships: []
      }
      negocio_analisis: {
        Row: {
          adecuacion: string | null
          alternativa_key: string
          calculado_at: string | null
          criterios: Json | null
          desventajas: string[] | null
          es_recomendada: boolean | null
          explicacion: string | null
          id: string
          proyecto_id: string
        }
        Insert: {
          adecuacion?: string | null
          alternativa_key: string
          calculado_at?: string | null
          criterios?: Json | null
          desventajas?: string[] | null
          es_recomendada?: boolean | null
          explicacion?: string | null
          id?: string
          proyecto_id: string
        }
        Update: {
          adecuacion?: string | null
          alternativa_key?: string
          calculado_at?: string | null
          criterios?: Json | null
          desventajas?: string[] | null
          es_recomendada?: boolean | null
          explicacion?: string | null
          id?: string
          proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negocio_analisis_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "negocio_proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_diagnostico: {
        Row: {
          aplica: boolean | null
          calculado_at: string | null
          falta_info: string[] | null
          id: string
          motivo: string | null
          obligacion_key: string
          proyecto_id: string
        }
        Insert: {
          aplica?: boolean | null
          calculado_at?: string | null
          falta_info?: string[] | null
          id?: string
          motivo?: string | null
          obligacion_key: string
          proyecto_id: string
        }
        Update: {
          aplica?: boolean | null
          calculado_at?: string | null
          falta_info?: string[] | null
          id?: string
          motivo?: string | null
          obligacion_key?: string
          proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negocio_diagnostico_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "negocio_proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_proyectos: {
        Row: {
          alternativa_recomendada: string | null
          certeza: string | null
          completitud: number | null
          completitud_fiscal: number | null
          created_at: string | null
          datos: Json
          entidad_fiscal_id: string | null
          estado: string
          falta_info: string[] | null
          id: string
          nombre: string | null
          relacion: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alternativa_recomendada?: string | null
          certeza?: string | null
          completitud?: number | null
          completitud_fiscal?: number | null
          created_at?: string | null
          datos?: Json
          entidad_fiscal_id?: string | null
          estado?: string
          falta_info?: string[] | null
          id?: string
          nombre?: string | null
          relacion?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alternativa_recomendada?: string | null
          certeza?: string | null
          completitud?: number | null
          completitud_fiscal?: number | null
          created_at?: string | null
          datos?: Json
          entidad_fiscal_id?: string | null
          estado?: string
          falta_info?: string[] | null
          id?: string
          nombre?: string | null
          relacion?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "negocio_proyectos_entidad_fiscal_id_fkey"
            columns: ["entidad_fiscal_id"]
            isOneToOne: false
            referencedRelation: "entidades_fiscales"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_diagnostico: {
        Row: {
          aplica: boolean | null
          calculado_at: string | null
          falta_info: string[] | null
          id: string
          motivo: string | null
          obligacion_key: string
          user_id: string
        }
        Insert: {
          aplica?: boolean | null
          calculado_at?: string | null
          falta_info?: string[] | null
          id?: string
          motivo?: string | null
          obligacion_key: string
          user_id: string
        }
        Update: {
          aplica?: boolean | null
          calculado_at?: string | null
          falta_info?: string[] | null
          id?: string
          motivo?: string | null
          obligacion_key?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          actividad: string | null
          actividad_principal: string | null
          actividades_secundarias: string[] | null
          cantidad_empleados: number | null
          cantidad_sucursales: number | null
          categoria_monotributo: string | null
          convenio_multilateral: boolean | null
          created_at: string | null
          cuit: string | null
          dni: string | null
          domicilio_fiscal: string | null
          email: string
          facturacion_estimada: number | null
          fecha_alta_fiscal: string | null
          fecha_inicio_actividad: string | null
          forma_operacion: string[] | null
          id: string
          inscripto_autonomos: boolean | null
          inscripto_ganancias: boolean | null
          inscripto_iibb: boolean | null
          inscripto_iva: boolean | null
          localidad: string | null
          nombre: string | null
          nombre_fantasia: string | null
          otras_jurisdicciones: string[] | null
          perfil_completitud: number | null
          perfil_data: Json | null
          perfil_onboarding_step: string | null
          provincia: string | null
          rango_facturacion: string | null
          situacion_fiscal: string | null
          telefono: string | null
          terminacion_cuit: string | null
          tiene_empleados: boolean | null
          tipo_contribuyente: string | null
          updated_at: string | null
        }
        Insert: {
          actividad?: string | null
          actividad_principal?: string | null
          actividades_secundarias?: string[] | null
          cantidad_empleados?: number | null
          cantidad_sucursales?: number | null
          categoria_monotributo?: string | null
          convenio_multilateral?: boolean | null
          created_at?: string | null
          cuit?: string | null
          dni?: string | null
          domicilio_fiscal?: string | null
          email: string
          facturacion_estimada?: number | null
          fecha_alta_fiscal?: string | null
          fecha_inicio_actividad?: string | null
          forma_operacion?: string[] | null
          id: string
          inscripto_autonomos?: boolean | null
          inscripto_ganancias?: boolean | null
          inscripto_iibb?: boolean | null
          inscripto_iva?: boolean | null
          localidad?: string | null
          nombre?: string | null
          nombre_fantasia?: string | null
          otras_jurisdicciones?: string[] | null
          perfil_completitud?: number | null
          perfil_data?: Json | null
          perfil_onboarding_step?: string | null
          provincia?: string | null
          rango_facturacion?: string | null
          situacion_fiscal?: string | null
          telefono?: string | null
          terminacion_cuit?: string | null
          tiene_empleados?: boolean | null
          tipo_contribuyente?: string | null
          updated_at?: string | null
        }
        Update: {
          actividad?: string | null
          actividad_principal?: string | null
          actividades_secundarias?: string[] | null
          cantidad_empleados?: number | null
          cantidad_sucursales?: number | null
          categoria_monotributo?: string | null
          convenio_multilateral?: boolean | null
          created_at?: string | null
          cuit?: string | null
          dni?: string | null
          domicilio_fiscal?: string | null
          email?: string
          facturacion_estimada?: number | null
          fecha_alta_fiscal?: string | null
          fecha_inicio_actividad?: string | null
          forma_operacion?: string[] | null
          id?: string
          inscripto_autonomos?: boolean | null
          inscripto_ganancias?: boolean | null
          inscripto_iibb?: boolean | null
          inscripto_iva?: boolean | null
          localidad?: string | null
          nombre?: string | null
          nombre_fantasia?: string | null
          otras_jurisdicciones?: string[] | null
          perfil_completitud?: number | null
          perfil_data?: Json | null
          perfil_onboarding_step?: string | null
          provincia?: string | null
          rango_facturacion?: string | null
          situacion_fiscal?: string | null
          telefono?: string | null
          terminacion_cuit?: string | null
          tiene_empleados?: boolean | null
          tipo_contribuyente?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_checklist: {
        Row: {
          done: boolean | null
          done_at: string | null
          id: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          done?: boolean | null
          done_at?: string | null
          id?: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          done?: boolean | null
          done_at?: string | null
          id?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          actividad: string | null
          activo: boolean | null
          created_at: string | null
          cuit: string | null
          email: string
          facturacion_estimada: number | null
          id: string
          nombre: string | null
          provincia: string | null
          terminacion_cuit: string | null
          tipo: string
          tipo_contribuyente: string | null
          updated_at: string | null
        }
        Insert: {
          actividad?: string | null
          activo?: boolean | null
          created_at?: string | null
          cuit?: string | null
          email: string
          facturacion_estimada?: number | null
          id?: string
          nombre?: string | null
          provincia?: string | null
          terminacion_cuit?: string | null
          tipo?: string
          tipo_contribuyente?: string | null
          updated_at?: string | null
        }
        Update: {
          actividad?: string | null
          activo?: boolean | null
          created_at?: string | null
          cuit?: string | null
          email?: string
          facturacion_estimada?: number | null
          id?: string
          nombre?: string | null
          provincia?: string | null
          terminacion_cuit?: string | null
          tipo?: string
          tipo_contribuyente?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vencimientos: {
        Row: {
          activo: boolean | null
          created_at: string | null
          detalle: string | null
          dia_mes: number
          emoji: string | null
          id: string
          nombre: string
          tipo: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          detalle?: string | null
          dia_mes: number
          emoji?: string | null
          id?: string
          nombre: string
          tipo: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          detalle?: string | null
          dia_mes?: number
          emoji?: string | null
          id?: string
          nombre?: string
          tipo?: string
        }
        Relationships: []
      }
      vencimientos_fiscales: {
        Row: {
          anio: number
          categoria: string[]
          created_at: string | null
          descripcion: string
          dia: number | null
          estado: string
          fuente: string | null
          fuente_nombre: string | null
          id: string
          mes: number
          pendiente: boolean | null
          rango: string | null
          tipo: string
          titulo: string
          verificado: boolean | null
          verificado_at: string | null
          version: number
        }
        Insert: {
          anio: number
          categoria: string[]
          created_at?: string | null
          descripcion: string
          dia?: number | null
          estado?: string
          fuente?: string | null
          fuente_nombre?: string | null
          id?: string
          mes: number
          pendiente?: boolean | null
          rango?: string | null
          tipo: string
          titulo: string
          verificado?: boolean | null
          verificado_at?: string | null
          version?: number
        }
        Update: {
          anio?: number
          categoria?: string[]
          created_at?: string | null
          descripcion?: string
          dia?: number | null
          estado?: string
          fuente?: string | null
          fuente_nombre?: string | null
          id?: string
          mes?: number
          pendiente?: boolean | null
          rango?: string | null
          tipo?: string
          titulo?: string
          verificado?: boolean | null
          verificado_at?: string | null
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_vencimientos_proximos: {
        Args: { p_dias?: number; p_tipo: string }
        Returns: {
          detalle: string
          dia_mes: number
          emoji: string
          fecha: string
          id: string
          nombre: string
          tipo: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
