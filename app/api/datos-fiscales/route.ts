import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { CATEGORIAS_MONO, VIGENCIA_MONTOS } from '@/lib/data'

export const revalidate = 3600

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from('datos_fiscales_versiones')
    .select('contenido, version, vigente_desde, fuente_nombre, fuente_url, verificado_at')
    .eq('dominio', 'monotributo')
    .eq('clave', 'categorias')
    .eq('estado', 'validado')
    .lte('vigente_desde', new Date().toISOString().slice(0, 10))
    .order('vigente_desde', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data || !Array.isArray(data.contenido)) {
    return NextResponse.json({
      categorias: CATEGORIAS_MONO,
      vigencia: VIGENCIA_MONTOS,
      origen: 'fallback_verificado',
      advertencia: error?.message || 'No hay una versión validada disponible.',
    })
  }

  return NextResponse.json({
    categorias: data.contenido.map((c: any) => ({
      letra: c.letra,
      limite_anual: Number(c.limite_anual),
      imp: Number(c.imp_servicios),
      imp_productos: Number(c.imp_productos),
      prev: Number(c.prev_sipa),
      os: Number(c.obra_social),
      total_servicios: Number(c.total_servicios),
      total_productos: Number(c.total_productos),
    })),
    version: data.version,
    vigente_desde: data.vigente_desde,
    fuente_nombre: data.fuente_nombre,
    fuente_url: data.fuente_url,
    verificado_at: data.verificado_at,
    origen: 'supabase_validado',
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
