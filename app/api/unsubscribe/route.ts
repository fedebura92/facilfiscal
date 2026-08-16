import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validarTokenUnsub } from '@/lib/unsubscribe'

export async function POST(req: NextRequest) {
  const { email, token } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  if (!validarTokenUnsub(email, token)) {
    return NextResponse.json(
      { error: 'Este link no es válido. Usá el link de "Cancelar suscripción" del email que recibiste.' },
      { status: 401 }
    )
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
