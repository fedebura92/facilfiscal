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

function construirNuevoDataTs(contenidoActual: string, datos: any): string {
  const vigenciaLine = `export const VIGENCIA_MONTOS = 'Vigente desde el ${datos.vigencia} — Fuente: ARCA'`

  const catsBlock = [
    'export const CATEGORIAS_MONO: CategoriaMonotributo[] = [',
    '  // imp = impuesto integrado (servicios), prev = aportes SIPA, os se suma aparte',
    ...datos.categorias
      .sort((a: any, b: any) => LETRAS_ESPERADAS.indexOf(a.letra) - LETRAS_ESPERADAS.indexOf(b.letra))
      .map((c: any) => `  { letra: '${c.letra}', limite_anual: ${c.limite_anual}, imp: ${c.imp_servicios}, prev: ${c.prev_sipa} },`),
    ']',
  ].join('\n')

  const osValor = datos.categorias[0]?.os ?? 0
  const osLine = `export const OS_EXTRA = ${osValor} // Aportes obra social vigentes ${datos.vigencia}`

  return contenidoActual
    .replace(/export const VIGENCIA_MONTOS = '[^']*'/, vigenciaLine)
    .replace(/export const CATEGORIAS_MONO: CategoriaMonotributo\[\] = \[[\s\S]*?\n\]/, catsBlock)
    .replace(/export const OS_EXTRA = [\d.]+ \/\/[^\n]*/, osLine)
    .replace(/\/\/ Última actualización: [^\n]*/, `// Última actualización: automática — ${new Date().toLocaleDateString('es-AR', { month:'long', year:'numeric' })}`)
}

async function commitearDataTs(nuevoContenido: string, mensaje: string) {
  const owner  = process.env.GITHUB_REPO_OWNER || 'fedebura92'
  const repo   = process.env.GITHUB_REPO_NAME  || 'facilfiscal'
  const branch = process.env.GITHUB_BRANCH     || 'main'
  const path   = 'lib/data.ts'
  const token  = process.env.GITHUB_TOKEN

  if (!token) throw new Error('Falta la variable de entorno GITHUB_TOKEN: no se puede commitear lib/data.ts automáticamente.')

  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  })
  if (!getRes.ok) throw new Error(`No pude leer lib/data.ts de GitHub (${getRes.status}).`)
  const { sha } = await getRes.json()

  const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: mensaje,
      content: Buffer.from(nuevoContenido, 'utf-8').toString('base64'),
      sha,
      branch,
    }),
  })
  if (!putRes.ok) {
    const detalle = await putRes.text()
    throw new Error(`No pude commitear lib/data.ts (${putRes.status}): ${detalle}`)
  }
}

export async function GET(req: NextRequest) {
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
Los números deben ser enteros sin puntos ni comas. Incluí las 11 categorías (A a K).
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

    // ── 3. Guardar en Supabase (queda como registro histórico/auditoría) ──
    await supabase.from('montos_monotributo').delete().neq('id', 0)

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

    // ── 4. ¿Cambió algo respecto a lo que ya está en lib/data.ts? ────────
    const cambios = detectarCambios(datos.categorias)

    if (!cambios) {
      await enviarEmail(
        `ℹ️ Montos de monotributo: sin cambios (vigencia ${datos.vigencia})`,
        `<h2>Sin cambios</h2><p>ARCA sigue publicando los mismos valores que ya están en producción. No se tocó ningún archivo.</p>`
      )
      return NextResponse.json({ ok: true, cambios: false })
    }

    // ── 5. Hay cambios: ¿son sensatos? ────────────────────────────────────
    const sensatez = chequearSensatez(datos.categorias)

    if (!sensatez.ok) {
      await enviarEmail(
        `⚠️ Montos de monotributo cambiaron pero requieren revisión manual`,
        `<h2>ARCA publicó valores nuevos, pero no se auto-aplicaron</h2>
         <p><strong>Motivo:</strong> ${sensatez.motivo}</p>
         <p>Los valores quedaron guardados en la tabla <code>montos_monotributo</code> de Supabase para que los revises, pero <strong>no se tocó <code>lib/data.ts</code></strong> por seguridad.</p>
         <p>Vigencia detectada: ${datos.vigencia}</p>`
      )
      return NextResponse.json({ ok: true, cambios: true, autoAplicado: false, motivo: sensatez.motivo })
    }

    // ── 6. Todo sensato: commitear lib/data.ts a GitHub (dispara deploy) ──
    const getContenido = await fetch(`https://raw.githubusercontent.com/${process.env.GITHUB_REPO_OWNER || 'fedebura92'}/${process.env.GITHUB_REPO_NAME || 'facilfiscal'}/${process.env.GITHUB_BRANCH || 'main'}/lib/data.ts`)
    if (!getContenido.ok) throw new Error('No pude leer lib/data.ts actual desde GitHub (raw).')
    const contenidoActual = await getContenido.text()

    const nuevoContenido = construirNuevoDataTs(contenidoActual, datos)
    await commitearDataTs(nuevoContenido, `chore: actualizar montos de monotributo — vigencia ${datos.vigencia} (auto, ARCA)`)

    await enviarEmail(
      `✅ Montos de monotributo actualizados automáticamente — vigencia ${datos.vigencia}`,
      `<h2>lib/data.ts actualizado y commiteado</h2>
       <p><strong>Vigencia:</strong> ${datos.vigencia}</p>
       <p>Vercel va a redeployar el sitio con los nuevos valores en los próximos minutos.</p>
       <p>Revisá en <a href="https://facilfiscal.com.ar/mi-categoria">facilfiscal.com.ar/mi-categoria</a> una vez que termine el deploy.</p>`
    )

    return NextResponse.json({ ok: true, cambios: true, autoAplicado: true, vigencia: datos.vigencia })

  } catch (error: any) {
    console.error('Error actualizando montos:', error)
    await enviarEmail(
      `❌ Error actualizando montos monotributo`,
      `<h2>Error en actualización automática</h2><p>${error.message}</p>`
    )
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
