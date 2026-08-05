import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calcularDiagnostico, calcularCompletitud } from '@/lib/reglas-fiscales'
import type { PerfilFiscal } from '@/lib/types'

// Recalcula el diagnóstico (Nivel 2) a partir del perfil declarado (Nivel 1).
// El user_id NUNCA se toma del body: se verifica el token del usuario logueado
// para evitar que alguien recalcule/pise el diagnóstico de otra cuenta.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const admin = supabaseAdmin()

  const { data: { user }, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !user) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
  }

  const { data: perfil, error: perfilErr } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (perfilErr || !perfil) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
  }

  const p = perfil as PerfilFiscal
  const diagnostico = calcularDiagnostico(p)
  const completitud = calcularCompletitud(p)

  // Upsert de cada obligación calculada
  const rows = diagnostico.map(d => ({
    user_id: user.id,
    obligacion_key: d.key,
    aplica: d.aplica,
    motivo: d.motivo,
    falta_info: d.faltaInfo,
    calculado_at: new Date().toISOString(),
  }))

  if (rows.length > 0) {
    const { error: upsertErr } = await admin
      .from('profile_diagnostico')
      .upsert(rows, { onConflict: 'user_id,obligacion_key' })

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }
  }

  // Limpia obligaciones que ya no aplican al perfil actual (ej: sacó una
  // situación especial que antes había marcado)
  const keysVigentes = diagnostico.map(d => d.key)
  await admin
    .from('profile_diagnostico')
    .delete()
    .eq('user_id', user.id)
    .not('obligacion_key', 'in', `(${keysVigentes.map(k => `"${k}"`).join(',')})`)

  // Guarda completitud en el perfil
  await admin
    .from('profiles')
    .update({ perfil_completitud: completitud })
    .eq('id', user.id)

  return NextResponse.json({ diagnostico, completitud })
}
