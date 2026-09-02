import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generarTokenUnsub } from '@/lib/unsubscribe'
import { CATEGORIA_POR_TIPO, diferenciaDias, escaparHtml, etiquetaAnticipacion, fechaArgentina, preferenciaDesdeTareas, resolverFechaVencimiento, sumarDias, type VencimientoNotificable } from '@/lib/notificaciones'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1'
  const db = supabaseAdmin(), hoy = fechaArgentina(), limite = sumarDias(fechaArgentina(), 7)
  const periodos = [...new Set([hoy.slice(0, 7), limite.slice(0, 7)])]
  const filtro = periodos.map(p => `and(anio.eq.${p.slice(0, 4)},mes.eq.${Number(p.slice(5, 7))})`).join(',')
  const [usuariosQ, vencimientosQ] = await Promise.all([
    db.from('users').select('id,email,tipo,nombre,terminacion_cuit,dias_anticipacion').eq('activo', true),
    db.from('vencimientos_fiscales').select('id,anio,mes,titulo,descripcion,categoria,dia,fechas_por_terminacion,fuente').eq('estado', 'validado').eq('verificado', true).or(filtro),
  ])
  if (usuariosQ.error || vencimientosQ.error) return NextResponse.json({ ok: false, error: usuariosQ.error?.message || vencimientosQ.error?.message }, { status: 500 })
  const users = usuariosQ.data || []
  if (!users.length) return NextResponse.json({ ok: true, dryRun, sent: 0, planned: 0 })

  const emails = [...new Set(users.map(u => u.email.toLowerCase()))]
  const perfilesQ = await db.from('profiles').select('id,email,nombre,terminacion_cuit').in('email', emails)
  if (perfilesQ.error) return NextResponse.json({ ok: false, error: perfilesQ.error.message }, { status: 500 })
  const perfiles = perfilesQ.data || [], profileIds = perfiles.map(p => p.id)
  const tareasQ = profileIds.length ? await db.from('user_checklist').select('user_id,task_id,done,updated_at').in('user_id', profileIds).like('task_id', 'recordatorio_anticipacion_%').eq('done', true) : { data: [], error: null }
  if (tareasQ.error) return NextResponse.json({ ok: false, error: tareasQ.error.message }, { status: 500 })
  const perfilPorEmail = new Map(perfiles.map(p => [p.email.toLowerCase(), p]))
  let sent = 0, planned = 0, failed = 0, skippedMissingCuit = 0, skippedNotDue = 0, skippedDuplicate = 0

  for (const user of users) {
    const perfil = perfilPorEmail.get(user.email.toLowerCase())
    const anticipacion = preferenciaDesdeTareas((tareasQ.data || []).filter(t => t.user_id === perfil?.id), user.dias_anticipacion || 3)
    const candidatos = (vencimientosQ.data || []).filter(v => v.categoria.includes(CATEGORIA_POR_TIPO[user.tipo])) as VencimientoNotificable[]
    for (const vencimiento of candidatos) {
      const fecha = resolverFechaVencimiento(vencimiento, user.terminacion_cuit || perfil?.terminacion_cuit)
      if (!fecha) { skippedMissingCuit++; continue }
      const dias = diferenciaDias(hoy, fecha)
      if (dias !== 0 && dias !== anticipacion) { skippedNotDue++; continue }
      planned++
      if (dryRun) continue
      const existente = await db.from('email_logs').select('id').eq('email', user.email).eq('tipo_email', 'alerta_vencimiento').eq('vencimiento_fiscal_id', vencimiento.id).eq('dias_antes', dias).is('error', null).maybeSingle()
      if (existente.error) { failed++; continue }
      if (existente.data) { skippedDuplicate++; continue }
      try {
        const providerId = await enviarAlerta({ to: user.email, nombre: user.nombre || perfil?.nombre || 'Contribuyente', titulo: vencimiento.titulo, fecha, dias, fuente: vencimiento.fuente, idempotencyKey: `alerta/${user.id}/${vencimiento.id}/${dias}` })
        const registro = await db.from('email_logs').insert({ user_id: user.id, email: user.email, tipo_email: 'alerta_vencimiento', vencimiento_fiscal_id: vencimiento.id, dias_antes: dias, provider_id: providerId })
        if (registro.error) throw registro.error
        sent++
      } catch (error) {
        failed++
        await db.from('email_logs').insert({ user_id: user.id, email: user.email, tipo_email: 'alerta_vencimiento', vencimiento_fiscal_id: vencimiento.id, dias_antes: dias, error: error instanceof Error ? error.message : String(error) })
      }
    }
  }
  const result = { ok: failed === 0, dryRun, date: hoy, planned, sent, failed, skippedMissingCuit, skippedNotDue, skippedDuplicate }
  return NextResponse.json(result, { status: failed ? 500 : 200 })
}

type Alerta = { to:string; nombre:string; titulo:string; fecha:string; dias:number; fuente?:string|null; idempotencyKey:string }
async function enviarAlerta(a: Alerta): Promise<string|null> {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY no configurada')
  const urgencia = a.dias === 0 ? '🔴 VENCE HOY' : `🟡 Vence ${etiquetaAnticipacion(a.dias)}`
  const fecha = new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${a.fecha}T12:00:00Z`))
  const fuente = a.fuente ? `<p><a href="${escaparHtml(a.fuente)}">Ver fuente oficial</a></p>` : ''
  const html = `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;background:#f4f7f9;padding:32px 16px"><main style="max-width:520px;margin:auto;background:white;border-radius:16px;overflow:hidden"><header style="background:#0d5c78;padding:24px 28px;color:white"><b style="font-size:22px">Fácil Fiscal</b><br><small>Recordatorio de vencimiento</small></header><section style="padding:28px"><p>Hola ${escaparHtml(a.nombre)},</p><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px"><b style="color:#d97706;font-size:18px">${urgencia}</b><h2>${escaparHtml(a.titulo)}</h2><p>Fecha: ${fecha}</p></div>${fuente}<a href="https://facilfiscal.com.ar/mipanel" style="display:block;background:#1a7fa8;color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none">Ver mis vencimientos →</a></section><footer style="background:#f4f7f9;padding:16px;text-align:center;font-size:11px"><a href="https://facilfiscal.com.ar/unsubscribe?email=${encodeURIComponent(a.to)}&token=${generarTokenUnsub(a.to)}">Cancelar suscripción</a></footer></main></body></html>`
  const response = await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':a.idempotencyKey},body:JSON.stringify({from:'Fácil Fiscal <alertas@facilfiscal.com.ar>',to:[a.to],subject:`${urgencia}: ${a.titulo}`,html})})
  const body = await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(`Resend: ${body.message||response.statusText}`)
  return body.id||null
}
