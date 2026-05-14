import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { query, contexto, historial } = body

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'query requerido' }, { status: 400 })
  }

  // Si viene contexto del perfil, lo agregamos al system prompt
  const systemBase = `Sos un asistente fiscal experto en impuestos argentinos (ARCA/AFIP).
Usá búsqueda web para traer datos actualizados del calendario fiscal, montos y normativas.
Respondé siempre en español rioplatense, claro y sin jerga legal innecesaria.
Texto plano, sin markdown ni asteriscos. Usá saltos de línea para separar secciones.`

  const systemContexto = contexto
    ? `\n\n${contexto}\n\nUsá este contexto para personalizar tu respuesta.`
    : ''

  const systemCierre = `\n\nAl final de cada respuesta sobre fechas o montos, agregá: "Verificá en afip.gob.ar para datos oficiales."`

  const system = systemBase + systemContexto + systemCierre

  // Construir mensajes — si hay historial, lo incluimos
  const messages: { role: string; content: string }[] = []

  if (historial && Array.isArray(historial)) {
    for (const h of historial) {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content })
      }
    }
  }

  messages.push({ role: 'user', content: query })

  // Consultas de recupero necesitan más tokens para explicar pasos
  const esRecupero = query.toLowerCase().includes('reclamar') ||
    query.toLowerCase().includes('recupero') ||
    query.toLowerCase().includes('percep') ||
    query.toLowerCase().includes('saldo a favor') ||
    query.toLowerCase().includes('devolución')

  const maxTokens = esRecupero ? 1500 : 800

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system,
        messages,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('\n')
      .trim()

    return NextResponse.json({ response: text })

  } catch (err) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
