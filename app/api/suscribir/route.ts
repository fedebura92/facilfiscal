import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, tipo_contribuyente, cuit } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  const supabase = supabaseAdmin()
  const { error } = await supabase
    .from('users')
    .upsert({ email, tipo: tipo_contribuyente || 'mono', cuit }, { onConflict: 'email' })
  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
