import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Corre cada lunes a las 8am (ver vercel.json)
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()

  const { data: users } = await supabase
    .from('users').select('id, email, tipo, nombre').eq('activo', true)

  if (!users?.length) return NextResponse.json({ ok: true, sent: 0 })

  let sent = 0

  for (const user of users) {
    const { data: vencimientos } = await supabase.rpc('get_vencimientos_proximos', {
      p_tipo: user.tipo, p_dias: 7
    })

    if (!vencimientos?.length) continue

    const already = await supabase
      .from('email_logs')
      .select('id')
      .eq('email', user.email)
      .eq('tipo_email', 'resumen_semanal')
      .gte('enviado_at', new Date().toISOString().split('T')[0])
      .maybeSingle()

    if (already.data) continue

    try {
      await sendResumenEmail({ to: user.email, nombre: user.nombre || 'Contribuyente', vencimientos, tipo: user.tipo })
      await supabase.from('email_logs').insert({ user_id: user.id, email: user.email, tipo_email: 'resumen_semanal' })
      sent++
    } catch (err: any) {
      await supabase.from('email_logs').insert({ user_id: user.id, email: user.email, tipo_email: 'resumen_semanal', error: err.message })
    }
  }

  return NextResponse.json({ ok: true, sent })
}

async function sendResumenEmail({ to, nombre, vencimientos, tipo }: {
  to: string; nombre: string; vencimientos: any[]; tipo: string
}) {
  const rows = vencimientos.map(v => {
    const d = Math.round((new Date(v.fecha).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
    const color = d === 0 ? '#e53535' : d <= 3 ? '#d97706' : '#16a34a'
    const label = d === 0 ? 'HOY' : d === 1 ? 'Mañana' : `En ${d} días`
    return `<tr>
      <td style="padding:10px 12px;font-weight:700;color:#0f2733;">${v.emoji} ${v.nombre}</td>
      <td style="padding:10px 12px;color:#7a9aaa;">${new Date(v.fecha).toLocaleDateString('es-AR',{day:'numeric',month:'long'})}</td>
      <td style="padding:10px 12px;text-align:right;"><span style="background:${color}22;color:${color};border-radius:20px;padding:3px 10px;font-size:12px;font-weight:800;">${label}</span></td>
    </tr>`
  }).join('')

  const html = `<!DOCTYPE html><html lang="es"><body style="font-family:sans-serif;background:#f4f7f9;padding:32px 16px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);">
    <div style="background:linear-gradient(135deg,#0d5c78,#1a7fa8);padding:24px 28px;">
      <div style="font-size:22px;font-weight:900;color:white;">Fácil Fiscal</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7);">Resumen semanal de vencimientos</div>
    </div>
    <div style="padding:28px;">
      <p style="font-size:15px;color:#3d5a6b;margin-bottom:20px;">Hola ${nombre}, tus vencimientos de esta semana:</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8ed;border-radius:10px;overflow:hidden;">
        <thead><tr style="background:#f4f7f9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;color:#7a9aaa;text-transform:uppercase;">Obligación</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;color:#7a9aaa;text-transform:uppercase;">Fecha</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;color:#7a9aaa;text-transform:uppercase;">Cuándo</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <a href="https://facilfiscal.com.ar" style="display:block;background:#1a7fa8;color:white;text-align:center;padding:14px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;margin-top:20px;">
        Ver panel completo →
      </a>
    </div>
    <div style="background:#f4f7f9;padding:16px 28px;text-align:center;">
      <p style="font-size:11px;color:#7a9aaa;margin:0;">
        <a href="https://facilfiscal.com.ar/unsubscribe?email=${encodeURIComponent(to)}" style="color:#7a9aaa;">Cancelar suscripción</a>
      </p>
    </div>
  </div></body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Fácil Fiscal <alertas@facilfiscal.com.ar>',
      to: [to],
      subject: `📅 Tus vencimientos de esta semana`,
      html,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
}
