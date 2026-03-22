import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'query requerido' }, { status: 400 })
  }

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
        max_tokens: 800,
        system: `Sos un asistente fiscal experto en impuestos argentinos (ARCA/AFIP).
Usá búsqueda web para traer datos actualizados del calendario fiscal, montos y normativas.
Respondé siempre en español rioplatense, claro y sin jerga legal innecesaria.
Texto plano, sin markdown. Máximo 200 palabras.
Al final de cada respuesta sobre fechas o montos, agregá: "Verificá en afip.gob.ar para datos oficiales."`,
        messages: [{ role: 'user', content: query }],
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
