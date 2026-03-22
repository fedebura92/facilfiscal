import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo') || 'mono'

  const { data, error } = await supabase
    .from('vencimientos')
    .select('*')
    .in('tipo', [tipo, 'todos'])
    .eq('activo', true)
    .order('dia_mes')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const withFecha = (data || []).map(v => ({
    ...v,
    fecha: new Date(y, m, v.dia_mes).toISOString(),
  }))

  return NextResponse.json({ vencimientos: withFecha })
}
