import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/alertas?tipo=mono
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'mono'

  const supabase = supabaseAdmin()

  const { data, error } = await supabase
    .from('alertas')
    .select('*')
    .eq('activa', true)
    .or(`tipo_contribuyente.eq.${tipo},tipo_contribuyente.eq.todos`)
    .order('orden', { ascending: true })
    .limit(5)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filtrar alertas vencidas (fecha_hasta < hoy)
  const hoy = new Date().toISOString().split('T')[0]
  const alertas = (data || []).filter(a => !a.fecha_hasta || a.fecha_hasta >= hoy)

  return NextResponse.json(
    { alertas },
    { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=3600' } }
  )
}
