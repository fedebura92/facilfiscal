import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Combinaciones válidas
function validarCombinacion(tipos: string[]): { valido: boolean; mensaje?: string } {
  if (tipos.includes('mono') && tipos.includes('ri')) {
    return { valido: false, mensaje: 'Monotributo y Responsable Inscripto son regímenes excluyentes.' }
  }
  if (tipos.includes('mono') && tipos.includes('ri') && tipos.includes('aut')) {
    return { valido: false, mensaje: 'No podés combinar los tres regímenes.' }
  }
  return { valido: true }
}

const TIPO_LABEL: Record<string, string> = {
  mono: 'Monotributista',
  ri:   'Responsable Inscripto',
  aut:  'Autónomo',
}

export async function POST(req: NextRequest) {
  const { email, tipos } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!tipos || !Array.isArray(tipos) || tipos.length === 0) {
    return NextResponse.json({ error: 'Seleccioná al menos una categoría' }, { status: 400 })
  }

  const validacion = validarCombinacion(tipos)
  if (!validacion.valido) {
    return NextResponse.json({ error: validacion.mensaje }, { status: 400 })
  }

  const supabase = supabaseAdmin()

  // 1. Desactivar todas las suscripciones previas del email
const { error: updateError } = await supabase
  .from('users')
  .update({ activo: false })
  .eq('email', email)

if (updateError) {
  console.error('ERROR UPDATE:', updateError)
}

  // 2. Upsert de los tipos seleccionados
  for (const tipo of tipos) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { email, tipo, activo: true },
      { onConflict: 'email,tipo' }
    )
    .select()

  if (error) {
    console.error('ERROR UPSERT USER:', error)
  } else {
    console.log('USER GUARDADO:', data)
  }
}

  // 3. Enviar email de bienvenida
  try {
    await sendBienvenidaEmail(email, tipos)
  } catch (err) {
    console.error('Error enviando email de bienvenida:', err)
    // No falla si el email no se puede mandar
  }

  return NextResponse.json({ ok: true })
}

async function sendBienvenidaEmail(email: string, tipos: string[]) {
  const tiposLabel = tipos.map(t => TIPO_LABEL[t] || t).join(' y ')
  const esPlurar = tipos.length > 1

  const html = `<!DOCTYPE html>
<html lang="es">
<body style="font-family:sans-serif;background:#f4f7f9;padding:32px 16px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1);">
    
    <div style="background:linear-gradient(135deg,#0d5c78,#1a7fa8);padding:28px;">
      <div style="font-size:24px;font-weight:900;color:white;letter-spacing:-0.3px;">Fácil Fiscal</div>
      <div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:2px;">Tu solución contable y fiscal simplificada</div>
    </div>
    
    <div style="padding:28px;">
      <div style="font-size:28px;margin-bottom:12px;">✅</div>
      <div style="font-size:20px;font-weight:900;color:#0f2733;margin-bottom:8px;">¡Ya estás suscripto!</div>
      <p style="font-size:14px;color:#3d5a6b;line-height:1.7;margin-bottom:20px;">
        A partir de ahora vas a recibir alertas fiscales como <strong>${tiposLabel}</strong> antes de cada vencimiento impositivo.
      </p>

      <div style="background:#e8f6fb;border-radius:10px;padding:16px 18px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:800;color:#0d5c78;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">
          Vas a recibir
        </div>
        <div style="font-size:13px;color:#1a7fa8;margin-bottom:6px;">📅 Alerta 3 días antes de cada vencimiento</div>
        <div style="font-size:13px;color:#1a7fa8;margin-bottom:6px;">🔴 Alerta el mismo día del vencimiento</div>
        <div style="font-size:13px;color:#1a7fa8;">📋 Resumen semanal todos los lunes</div>
      </div>

      <div style="background:#fff8ec;border:1px solid #fde4a0;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
        <div style="font-size:12px;font-weight:800;color:#a06000;margin-bottom:6px;">¿Cambiaste de categoría?</div>
        <div style="font-size:12px;color:#b7760d;line-height:1.6;">
          Si pasaste de Monotributista a Responsable Inscripto, o agregaste la condición de Autónomo, 
          volvé a suscribirte en <a href="https://facilfiscal.com.ar" style="color:#a06000;">facilfiscal.com.ar</a> 
          eligiendo tu nueva situación fiscal. Tu suscripción anterior se actualizará automáticamente.
        </div>
      </div>

      <a href="https://facilfiscal.com.ar" style="display:block;background:#1a7fa8;color:white;text-align:center;padding:14px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">
        Ver mis vencimientos →
      </a>
    </div>
    
    <div style="background:#f4f7f9;padding:14px 28px;text-align:center;">
      <p style="font-size:11px;color:#7a9aaa;margin:0;">
        Recibís este email porque te suscribiste en facilfiscal.com.ar.<br>
        <a href="https://facilfiscal.com.ar/unsubscribe?email=${encodeURIComponent(email)}" style="color:#7a9aaa;">
          Cancelar suscripción
        </a>
      </p>
    </div>
  </div>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Fácil Fiscal <alertas@facilfiscal.com.ar>',
      to: [email],
      subject: '✅ Suscripción activada — Fácil Fiscal',
      html,
    }),
  })

  if (!res.ok) throw new Error(await res.text())
}
