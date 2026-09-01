import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo') || 'mono'

  const now = new Date()
  const categoria = tipo === 'mono' ? 'monotributo' : tipo === 'ri' ? 'responsable' : 'autonomo'
  const { data, error } = await supabaseAdmin()
    .from('vencimientos_fiscales')
    .select('*')
    .eq('anio', now.getFullYear())
    .eq('mes', now.getMonth() + 1)
    .eq('estado', 'validado')
    .contains('categoria', [categoria])
    .not('dia', 'is', null)
    .order('dia')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const y = now.getFullYear()
  const m = now.getMonth()
  const withFecha = (data || []).map(v => ({
    id:v.id,
    nombre:v.titulo,
    emoji:categoria === 'monotributo' ? '📋' : categoria === 'responsable' ? '🧾' : '⚡',
    detalle:v.descripcion,
    dia_mes:v.dia,
    tipo,
    fecha:new Date(y, m, v.dia!).toISOString(),
    fuente:v.fuente,
    verificado:true,
  }))

  return NextResponse.json({ vencimientos: withFecha })
}
