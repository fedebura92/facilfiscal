import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // ── 1. Scrapear la página de categorías de ARCA ──────────────────────
    const response = await fetch('https://www.afip.gob.ar/monotributo/categorias.asp', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FacilFiscal/1.0)' }
    })
    if (!response.ok) throw new Error(`Error al scrapear ARCA: ${response.status}`)
    const html = await response.text()

    // Extraer solo la tabla principal
    const tablaInicio = html.indexOf('<table')
    const tablaFin    = html.lastIndexOf('</table>') + '</table>'.length
    const tablaHtml   = html.slice(tablaInicio, tablaFin).slice(0, 30000)

    // ── 2. Llamar a Claude para parsear los valores ──────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Extraé los valores de la tabla de categorías de monotributo de ARCA del siguiente HTML.
Devolvé ÚNICAMENTE un JSON válido sin backticks ni texto adicional, con este formato exacto:
{
  "vigencia": "01/02/2026",
  "categorias": [
    {
      "letra": "A",
      "limite_anual": 10277988,
      "imp_servicios": 4780,
      "imp_productos": 4780,
      "prev_sipa": 15616,
      "os": 21990,
      "total_servicios": 42387,
      "total_productos": 42387
    }
  ]
}
Los números deben ser enteros sin puntos ni comas. Incluí las 11 categorías (A a K).
HTML: ${tablaHtml}`
      }]
    })

    const texto = message.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const datos = JSON.parse(texto)

    if (!datos.categorias || datos.categorias.length < 11) {
      throw new Error('Claude no devolvió todas las categorías')
    }

    // ── 3. Guardar en Supabase ───────────────────────────────────────────
    // Borrar los anteriores
    await supabase.from('montos_monotributo').delete().neq('id', 0)

    // Insertar los nuevos
    const rows = datos.categorias.map((c: any, i: number) => ({
      letra:          c.letra,
      orden:          i + 1,
      limite_anual:   c.limite_anual,
      imp_servicios:  c.imp_servicios,
      imp_productos:  c.imp_productos,
      prev_sipa:      c.prev_sipa,
      os:             c.os,
      total_servicios:c.total_servicios,
      total_productos:c.total_productos,
      vigencia:       datos.vigencia,
      fuente:         'https://www.afip.gob.ar/monotributo/categorias.asp',
      updated_at:     new Date().toISOString(),
    }))

    const { error } = await supabase.from('montos_monotributo').insert(rows)
    if (error) throw new Error(`Error Supabase: ${error.message}`)

    // ── 4. Notificar ─────────────────────────────────────────────────────
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'sistema@facilfiscal.com.ar',
        to: process.env.ADMIN_EMAIL || 'admin@facilfiscal.com.ar',
        subject: `✅ Montos monotributo actualizados — vigencia ${datos.vigencia}`,
        html: `<h2>Montos de monotributo actualizados</h2><p><strong>Vigencia:</strong> ${datos.vigencia}</p><p><strong>Categorías:</strong> ${datos.categorias.length}</p><p>Revisá en <a href="https://facilfiscal.com.ar/mi-categoria">facilfiscal.com.ar/mi-categoria</a></p>`,
      }),
    })

    return NextResponse.json({ ok: true, vigencia: datos.vigencia, categorias: datos.categorias.length })

  } catch (error: any) {
    console.error('Error actualizando montos:', error)

    // Notificar el error
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'sistema@facilfiscal.com.ar',
        to: process.env.ADMIN_EMAIL || 'admin@facilfiscal.com.ar',
        subject: `❌ Error actualizando montos monotributo`,
        html: `<h2>Error en actualización automática</h2><p>${error.message}</p>`,
      }),
    })

    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
