import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase
    .from('users')
    .update({ activo: false })
    .eq('email', email)

  if (error) {
    return NextResponse.json({ error: 'No se pudo cancelar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
