import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Nombres de meses para construir la URL
const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
]

export async function POST(req: Request) {
  // Verificar cron secret para que solo Vercel pueda llamar esta ruta
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Calcular el mes siguiente
  const hoy = new Date()
  const mesIdx = (hoy.getMonth() + 1) % 12  // 0-indexed del mes siguiente
  const anio = hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear()
  const mesNombre = MESES[mesIdx]
  const mesNum = mesIdx + 1

  try {
    // ── 1. Scrapear el calendario fiscal ──────────────────────────────────
    const url = `https://www.calendariofiscal.com.ar/vencimientos/${mesNombre}-${anio}`
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FacilFiscal/1.0)' }
    })

    if (!response.ok) {
      throw new Error(`Error al scrapear: ${response.status}`)
    }

    const html = await response.text()

    // Extraer solo el contenido relevante (tablas de vencimientos)
    // Limitamos el HTML para no exceder el contexto de Claude
    const htmlRecortado = extraerContenidoRelevante(html)

    // ── 2. Llamar a Claude API para parsear ───────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `Sos un asistente que extrae vencimientos fiscales argentinos de HTML.
          
Analizá el siguiente HTML del calendario fiscal de ${mesNombre} ${anio} y extraé ÚNICAMENTE los vencimientos relevantes para estas 4 categorías de contribuyentes:
- monotributo: monotributistas
- responsable: responsables inscriptos (IVA, Ganancias)  
- autonomo: trabajadores autónomos (aportes previsionales)
- empleador: empleadores (F.931, cargas sociales)

Ignorá vencimientos de: construcción, fútbol AFA, limpieza, servicios eventuales, casas particulares, actividad agropecuaria especial, SISA, SIRCAR, Tierra del Fuego, y cualquier régimen muy específico que no aplique al monotributista/RI/autónomo/empleador común.

Devolvé ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional ni backticks:
{
  "vencimientos": [
    {
      "titulo": "Monotributo — cuota mensual",
      "descripcion": "Descripción clara y concisa de máximo 2 oraciones.",
      "categoria": ["monotributo"],
      "tipo": "pago",
      "dia": 20,
      "rango": null,
      "pendiente": false
    }
  ]
}

Reglas:
- "tipo" solo puede ser: pago | declaracion | presentacion | recategorizacion
- "categoria" es array con uno o más de: monotributo | responsable | autonomo | empleador
- Si el vencimiento tiene día exacto, usá "dia" (número) y "rango" null
- Si hay rango de días por CUIT, usá "rango" (string como "5, 6 y 7") y "dia" null
- "pendiente" siempre false (son fechas confirmadas)
- En descripción aclará los días exactos por terminación de CUIT si aplica
- Ignorá duplicados (si IVA aparece 5 veces por CUIT, resumilo en 1 entrada con rango)

HTML a analizar:
${htmlRecortado}`
        }
      ]
    })

    // ── 3. Parsear la respuesta de Claude ─────────────────────────────────
    const respuestaTexto = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')

    let vencimientos: any[]
    try {
      const parsed = JSON.parse(respuestaTexto)
      vencimientos = parsed.vencimientos
    } catch {
      throw new Error(`Claude devolvió JSON inválido: ${respuestaTexto.slice(0, 200)}`)
    }

    if (!Array.isArray(vencimientos) || vencimientos.length === 0) {
      throw new Error('Claude no devolvió vencimientos válidos')
    }

    // ── 4. Guardar en Supabase ────────────────────────────────────────────
    // Primero borrar los del mismo mes/año para evitar duplicados
    await supabase
      .from('vencimientos_fiscales')
      .delete()
      .eq('mes', mesNum)
      .eq('anio', anio)

    // Insertar los nuevos
    const rows = vencimientos.map(v => ({
      mes: mesNum,
      anio,
      titulo: v.titulo,
      descripcion: v.descripcion,
      categoria: v.categoria,
      tipo: v.tipo,
      dia: v.dia ?? null,
      rango: v.rango ?? null,
      pendiente: v.pendiente ?? false,
      verificado: true,
      fuente: url,
    }))

    const { error } = await supabase
      .from('vencimientos_fiscales')
      .insert(rows)

    if (error) throw new Error(`Error Supabase: ${error.message}`)

    // ── 5. Notificar por email (opcional) ─────────────────────────────────
    await notificarActualizacion(mesNombre, anio, rows.length)

    return NextResponse.json({
      ok: true,
      mes: `${mesNombre} ${anio}`,
      vencimientosInsertados: rows.length,
    })

  } catch (error: any) {
    console.error('Error actualizando calendario:', error)

    // Notificar el error
    await notificarError(mesNombre, anio, error.message)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extraerContenidoRelevante(html: string): string {
  // Extraer solo las tablas y headings del HTML para no exceder el contexto
  // Buscamos el contenido principal entre los tags de tabla
  const inicio = html.indexOf('<table')
  const fin = html.lastIndexOf('</table>') + '</table>'.length

  if (inicio === -1) {
    // Si no hay tablas, devolver primeros 30000 chars del body
    const bodyInicio = html.indexOf('<body')
    return html.slice(bodyInicio > -1 ? bodyInicio : 0, 30000)
  }

  // Limitar a 40000 caracteres para no exceder contexto
  const contenido = html.slice(inicio, fin)
  return contenido.length > 40000 ? contenido.slice(0, 40000) : contenido
}

async function notificarActualizacion(mes: string, anio: number, cantidad: number) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'sistema@facilfiscal.com.ar',
        to: process.env.ADMIN_EMAIL || 'admin@facilfiscal.com.ar',
        subject: `✅ Calendario ${mes} ${anio} actualizado — ${cantidad} vencimientos`,
        html: `
          <h2>Calendario fiscal actualizado automáticamente</h2>
          <p><strong>Mes:</strong> ${mes} ${anio}</p>
          <p><strong>Vencimientos insertados:</strong> ${cantidad}</p>
          <p>Revisá el resultado en <a href="https://facilfiscal.com.ar/calendario-fiscal">facilfiscal.com.ar/calendario-fiscal</a></p>
          <p><em>Siempre verificá contra el calendario oficial de ARCA antes de publicar cambios críticos.</em></p>
        `,
      }),
    })
  } catch (e) {
    console.error('Error enviando notificación:', e)
  }
}

async function notificarError(mes: string, anio: number, errorMsg: string) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'sistema@facilfiscal.com.ar',
        to: process.env.ADMIN_EMAIL || 'admin@facilfiscal.com.ar',
        subject: `❌ Error actualizando calendario ${mes} ${anio}`,
        html: `
          <h2>Error en actualización automática del calendario</h2>
          <p><strong>Mes:</strong> ${mes} ${anio}</p>
          <p><strong>Error:</strong> ${errorMsg}</p>
          <p>Actualizá manualmente en <a href="https://facilfiscal.com.ar/calendario-fiscal">facilfiscal.com.ar/calendario-fiscal</a></p>
        `,
      }),
    })
  } catch (e) {
    console.error('Error enviando notificación de error:', e)
  }
}
