import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fechaArgentina } from '@/lib/notificaciones'

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo') || 'mono'
  const hoy = fechaArgentina()
  const [anio, mes] = hoy.split('-').map(Number)
  const categoria = tipo === 'mono' ? 'monotributo' : tipo === 'ri' ? 'responsable' : 'autonomo'

  const { data, error } = await supabaseAdmin()
    .from('vencimientos_fiscales')
    .select('*')
    .eq('anio', anio)
    .eq('mes', mes)
    .eq('estado', 'validado')
    .eq('verificado', true)
    .contains('categoria', [categoria])
    .not('dia', 'is', null)
    .order('dia')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const withFecha = (data || []).map(v => ({
    id:v.id,
    nombre:v.titulo,
    emoji:categoria === 'monotributo' ? '📋' : categoria === 'responsable' ? '🧾' : '⚡',
    detalle:v.descripcion,
    dia_mes:v.dia,
    tipo,
    fecha:`${anio}-${String(mes).padStart(2,'0')}-${String(v.dia).padStart(2,'0')}T12:00:00.000Z`,
    fuente:v.fuente,
    verificado:true,
  }))

  return NextResponse.json({ vencimientos: withFecha })
}
