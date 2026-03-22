import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// ── Este endpoint lo llama Vercel Cron todos los días a las 8am ──
// Configurar en vercel.json (ver abajo)
// Protegido con CRON_SECRET para que nadie más lo llame.

export async function GET(req: NextRequest) {
  // Verificar que lo llama Vercel Cron (o el admin)
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = supabaseAdmin()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const in3days = new Date(today); in3days.setDate(today.getDate() + 3)
  const in3Str = in3days.toISOString().split('T')[0]

  // 1. Traer todos los usuarios activos
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id, email, tipo, nombre')
    .eq('activo', true)

  if (usersErr || !users?.length) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no users' })
  }

  let sent = 0

  for (const user of users) {
    // 2. Traer vencimientos de hoy y en 3 días para ese tipo
    const { data: vencHoy } = await supabase.rpc('get_vencimientos_proximos', {
      p_tipo: user.tipo, p_dias: 0
    })
    const { data: venc3d } = await supabase.rpc('get_vencimientos_proximos', {
      p_tipo: user.tipo, p_dias: 3
    })

    const toSend = [
      ...(vencHoy || []).map((v: any) => ({ ...v, cuando: 'hoy' })),
      ...(venc3d  || []).map((v: any) => ({ ...v, cuando: 'en 3 días' })),
    ]

    for (const venc of toSend) {
      // 3. Verificar que no enviamos este email hoy
      const { data: existing } = await supabase
        .from('email_logs')
        .select('id')
        .eq('email', user.email)
        .eq('tipo_email', 'alerta_vencimiento')
        .eq('vencimiento_id', venc.id)
        .gte('enviado_at', todayStr)
        .maybeSingle()

      if (existing) continue // ya enviado hoy

      // 4. Enviar email vía Resend
      try {
        await sendAlertEmail({
          to: user.email,
          nombre: user.nombre || 'Contribuyente',
          vencimiento: venc.nombre,
          cuando: venc.cuando,
          fecha: venc.fecha,
          tipo: user.tipo,
        })

        // 5. Registrar el envío
        await supabase.from('email_logs').insert({
          user_id: user.id,
          email: user.email,
          tipo_email: 'alerta_vencimiento',
          vencimiento_id: venc.id,
        })

        sent++
      } catch (err: any) {
        await supabase.from('email_logs').insert({
          user_id: user.id,
          email: user.email,
          tipo_email: 'alerta_vencimiento',
          vencimiento_id: venc.id,
          error: err.message,
        })
      }
    }
  }

  return NextResponse.json({ ok: true, sent })
}


// ── Envío de email via Resend ────────────────────────────────
// Instalar: npm install resend
// Cuenta gratuita: resend.com (3000 emails/mes gratis)
async function sendAlertEmail({
  to, nombre, vencimiento, cuando, fecha, tipo
}: {
  to: string
  nombre: string
  vencimiento: string
  cuando: string
  fecha: string
  tipo: string
}) {
  const tipoLabel: Record<string, string> = {
    mono: 'Monotributista', ri: 'Responsable Inscripto', aut: 'Autónomo'
  }
  const urgencia = cuando === 'hoy' ? '🔴 VENCE HOY' : '🟡 Vence en 3 días'

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="font-family:sans-serif;background:#f4f7f9;padding:32px 16px;margin:0;">
      <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0d5c78,#1a7fa8);padding:24px 28px;">
          <div style="font-size:22px;font-weight:900;color:white;">Fácil Fiscal</div>
          <div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:2px;">Tu solución contable y fiscal simplificada</div>
        </div>
        
        <!-- Body -->
        <div style="padding:28px;">
          <p style="font-size:15px;color:#3d5a6b;margin-bottom:20px;">
            Hola ${nombre},
          </p>
          
          <!-- Alert box -->
          <div style="background:${cuando === 'hoy' ? '#fff1f1' : '#fffbeb'};border:1.5px solid ${cuando === 'hoy' ? '#ffc8c8' : '#fde68a'};border-radius:12px;padding:18px 20px;margin-bottom:24px;">
            <div style="font-size:18px;font-weight:900;color:${cuando === 'hoy' ? '#e53535' : '#d97706'};margin-bottom:4px;">
              ${urgencia}
            </div>
            <div style="font-size:22px;font-weight:900;color:#0f2733;margin-bottom:6px;">
              ${vencimiento}
            </div>
            <div style="font-size:13px;color:#7a9aaa;font-weight:600;">
              Fecha: ${new Date(fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          <!-- CTA -->
          <a href="https://www.afip.gob.ar" style="display:block;background:#1a7fa8;color:white;text-align:center;padding:14px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;margin-bottom:16px;">
            Ir a AFIP a pagar →
          </a>
          <a href="https://facilfiscal.com.ar" style="display:block;background:#f5f7f9;color:#1a7fa8;text-align:center;padding:12px;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">
            Ver todos mis vencimientos
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background:#f4f7f9;padding:16px 28px;text-align:center;">
          <p style="font-size:11px;color:#7a9aaa;margin:0;">
            Recibís este email porque te suscribiste en facilfiscal.com.ar como ${tipoLabel[tipo] || tipo}.<br>
            <a href="https://facilfiscal.com.ar/unsubscribe?email=${encodeURIComponent(to)}" style="color:#7a9aaa;">Cancelar suscripción</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  // Llamada a Resend API
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Fácil Fiscal <alertas@facilfiscal.com.ar>',
      to: [to],
      subject: `${urgencia}: ${vencimiento}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }
}
