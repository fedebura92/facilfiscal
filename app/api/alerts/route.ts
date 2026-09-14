import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fechaArgentina } from '@/lib/notificaciones'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const solicitado = req.nextUrl.searchParams.get('tipo') || 'mono'
  const tipo = ['mono','ri','aut'].includes(solicitado) ? solicitado : 'mono'
  const today = fechaArgentina()

  const { data, error } = await supabaseAdmin()
    .from('alerts')
    .select('*')
    .in('tipo_contribuyente', [tipo, 'todos'])
    .eq('activa', true)
    .or(`fecha_expiracion.is.null,fecha_expiracion.gte.${today}`)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) return NextResponse.json({ error: 'No pudimos cargar las alertas.' }, { status: 500 })
  return NextResponse.json({ alerts: data || [] }, { headers: { 'Cache-Control': 'no-store' } })
}
