import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface VencimientoFiscal {
  id: string
  mes: number
  anio: number
  titulo: string
  descripcion: string
  categoria: string[]
  tipo: 'pago' | 'declaracion' | 'presentacion' | 'recategorizacion'
  dia: number | null
  rango: string | null
  pendiente: boolean
  verificado: boolean
  fuente: string | null
}

export interface MesCache {
  [mesAnio: string]: {  // key: "5-2026"
    vencimientos: VencimientoFiscal[]
    verificado: boolean
    cargado: boolean
  }
}

export function useVencimientosFiscales(mes: number, anio: number) {
  const [vencimientos, setVencimientos] = useState<VencimientoFiscal[]>([])
  const [verificado, setVerificado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: sbError } = await supabase
          .from('vencimientos_fiscales')
          .select('*')
          .eq('mes', mes)
          .eq('anio', anio)
          .order('dia', { ascending: true, nullsFirst: false })

        if (sbError) throw new Error(sbError.message)

        if (data && data.length > 0) {
          setVencimientos(data)
          setVerificado(data.some(v => v.verificado))
        } else {
          // Sin datos en Supabase — mes no cargado aún
          setVencimientos([])
          setVerificado(false)
        }
      } catch (e: any) {
        console.error('Error cargando vencimientos:', e)
        setError(e.message)
        setVencimientos([])
      } finally {
        setLoading(false)
      }
    }

    cargar()
  }, [mes, anio])

  return { vencimientos, verificado, loading, error }
}
