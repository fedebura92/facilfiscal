import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo') || 'mono'
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .in('tipo_contribuyente', [tipo, 'todos'])
    .eq('activa', true)
    .or(`fecha_expiracion.is.null,fecha_expiracion.gte.${today}`)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alerts: data })
}
