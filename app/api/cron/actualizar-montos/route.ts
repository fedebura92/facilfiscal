import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { CATEGORIAS_MONO } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const LETRAS_ESPERADAS = ['A','B','C','D','E','F','G','H','I','J','K']

async function enviarEmail(subject: string, html: string) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'sistema@facilfiscal.com.ar',
      to: process.env.ADMIN_EMAIL || 'admin@facilfiscal.com.ar',
      subject,
      html,
    }),
  })
}

// ¿Los valores nuevos coinciden con lo que ya está vigente en lib/data.ts?
function detectarCambios(nuevas: any[]): boolean {
  for (const c of nuevas) {
    const actual = CATEGORIAS_MONO.find(a => a.letra === c.letra)
    if (!actual) return true
    if (
      Math.round(actual.limite_anual) !== Math.round(c.limite_anual) ||
      Math.round(actual.imp)          !== Math.round(c.imp_servicios) ||
      Math.round(actual.prev)         !== Math.round(c.prev_sipa)
    ) return true
  }
  return false
}

// Chequeo de sensatez: los montos de monotributo se actualizan por inflación
// y SIEMPRE suben. Si algo bajó, falta una categoría, o algo se disparó de
// forma irrazonable, no confiamos en el commit automático — mejor una alerta
// para revisión manual que romper producción solos.
function chequearSensatez(nuevas: any[]): { ok: boolean; motivo?: string } {
  const letras = nuevas.map(c => c.letra)
  if (letras.length !== 11 || !LETRAS_ESPERADAS.every(l => letras.includes(l))) {
    return { ok: false, motivo: `Se esperaban las 11 categorías A-K y llegaron: ${letras.join(', ') || '(ninguna)'}.` }
  }
  for (const c of nuevas) {
    const actual = CATEGORIAS_MONO.find(a => a.letra === c.letra)
    if (!actual) continue
    if (c.limite_anual < actual.limite_anual || c.imp_servicios < actual.imp || c.prev_sipa < actual.prev) {
      return { ok: false, motivo: `La categoría ${c.letra} bajó de valor respecto a lo vigente (esto no pasa con ajustes por inflación normales).` }
    }
    if (c.limite_anual > actual.limite_anual * 2) {
      return { ok: false, motivo: `La categoría ${c.letra} más que duplicó su límite anual — puede ser un error de scraping/parseo.` }
    }
  }
  return { ok: true }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // ── 1. Scrapear la página de categorías de ARCA ──────────────────────
    const response = await fetch('https://www.arca.gob.ar/monotributo/categorias.asp', {
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
      model: 'claude-sonnet-4-6',
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
Los números deben ser JSON numéricos con hasta dos decimales, sin separadores de miles. Incluí las 11 categorías (A a K).
HTML: ${tablaHtml}`
      }]
    })

    const texto = message.content.filter(b => b.type === 'text').map(b => b.text).join('')
    const textoLimpio = texto
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/, '')
      .trim()
    const datos = JSON.parse(textoLimpio)

    if (!datos.categorias || datos.categorias.length < 11) {
      throw new Error('Claude no devolvió todas las categorías')
    }

    // ── 3. ¿Cambió algo respecto al fallback verificado vigente? ─────────
    const cambios = detectarCambios(datos.categorias)

    if (!cambios) {
      await enviarEmail(
        `ℹ️ Montos de monotributo: sin cambios (vigencia ${datos.vigencia})`,
        `<h2>Sin cambios</h2><p>ARCA sigue publicando los mismos valores que ya están en producción. No se tocó ningún archivo.</p>`
      )
      return NextResponse.json({ ok: true, cambios: false })
    }

    // ── 4. Hay cambios: ¿son sensatos? ────────────────────────────────────
    const sensatez = chequearSensatez(datos.categorias)

    if (!sensatez.ok) {
      await enviarEmail(
        `⚠️ Montos de monotributo cambiaron pero requieren revisión manual`,
        `<h2>ARCA publicó valores nuevos, pero no se auto-aplicaron</h2>
         <p><strong>Motivo:</strong> ${sensatez.motivo}</p>
         <p>Los valores no se publicaron. El registro queda disponible para revisión manual.</p>
         <p>Vigencia detectada: ${datos.vigencia}</p>`
      )
      return NextResponse.json({ ok: true, cambios: true, autoAplicado: false, motivo: sensatez.motivo })
    }

    // ── 5. Guardar como borrador versionado. Nunca publicar sin aprobación. ─
    const [dia, mes, anio] = String(datos.vigencia).split('/').map(Number)
    if (!dia || !mes || !anio) throw new Error(`Vigencia inválida: ${datos.vigencia}`)
    const version = anio * 10000 + mes * 100 + dia
    const contenido = datos.categorias
      .sort((a: any, b: any) => LETRAS_ESPERADAS.indexOf(a.letra) - LETRAS_ESPERADAS.indexOf(b.letra))
      .map((c: any) => ({
        letra:c.letra,
        limite_anual:Number(c.limite_anual),
        imp_servicios:Number(c.imp_servicios),
        imp_productos:Number(c.imp_productos),
        prev_sipa:Number(c.prev_sipa),
        obra_social:Number(c.os),
        total_servicios:Number(c.total_servicios),
        total_productos:Number(c.total_productos),
      }))

    const payload = {
      dominio:'monotributo', clave:'categorias', version, contenido,
      vigente_desde:`${anio}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`,
      estado:'borrador' as const, fuente_nombre:'ARCA',
      fuente_url:'https://www.arca.gob.ar/monotributo/categorias.asp',
    }
    const { data: existente } = await supabase.from('datos_fiscales_versiones')
      .select('id, estado').eq('dominio','monotributo').eq('clave','categorias').eq('version',version).maybeSingle()
    if (existente?.estado === 'validado') {
      throw new Error(`La versión ${version} ya está validada; el cron no puede reemplazarla.`)
    }
    const operacion = existente
      ? supabase.from('datos_fiscales_versiones').update(payload).eq('id', existente.id)
      : supabase.from('datos_fiscales_versiones').insert(payload)
    const { error } = await operacion
    if (error) throw new Error(`Error Supabase: ${error.message}`)

    await enviarEmail(
      `🟡 Montos de monotributo pendientes de aprobación — vigencia ${datos.vigencia}`,
      `<h2>Nueva versión guardada como borrador</h2>
       <p><strong>Vigencia:</strong> ${datos.vigencia}</p>
       <p>No se publicó ni se modificó GitHub. Revisá la fuente oficial y aprobá la versión antes de usarla.</p>`
    )

    return NextResponse.json({ ok: true, cambios: true, estado: 'borrador', version, vigencia: datos.vigencia })

  } catch (error: any) {
    console.error('Error actualizando montos:', error)
    await enviarEmail(
      `❌ Error actualizando montos monotributo`,
      `<h2>Error en actualización automática</h2><p>${error.message}</p>`
    )
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
