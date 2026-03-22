'use client'
import { useState } from 'react'

const CHIPS = [
  { label: 'Vencimientos esta semana', q: '¿Cuáles son los vencimientos impositivos en Argentina esta semana?' },
  { label: 'Cuánto pago',             q: '¿Cuánto pago de monotributo en 2026 por categoría?' },
  { label: 'Pagar por home banking',  q: '¿Cómo pagar el monotributo desde home banking paso a paso?' },
  { label: 'Novedades ARCA',          q: '¿Hubo cambios o novedades recientes en ARCA o AFIP Argentina?' },
  { label: 'Ver deuda AFIP',          q: '¿Cómo saber si debo en AFIP paso a paso?' },
]

export default function AIConsulta({ placeholder = '¿Cuándo vence el monotributo este mes?' }: { placeholder?: string }) {
  const [query,    setQuery]    = useState('')
  const [response, setResponse] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function ask(q?: string) {
    const text = q || query
    if (!text.trim()) return
    if (q) setQuery(q)
    setLoading(true)
    setResponse('')
    try {
      const res = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      })
      const data = await res.json()
      setResponse(data.response || 'Sin respuesta. Reformulá la pregunta.')
    } catch {
      setResponse('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--sh-sm)',
      marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{
        background: '#0a0a1a', color: 'white',
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 0 3px rgba(76,175,80,.2)' }} />
        Asistente Fiscal IA · Datos de ARCA/AFIP en tiempo real
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()}
            placeholder={placeholder}
            style={{
              flex: 1, border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
              padding: '10px 12px', fontFamily: 'Nunito, sans-serif',
              fontSize: 13, fontWeight: 600, color: 'var(--ink)',
              background: 'var(--bg)', outline: 'none',
            }}
          />
          <button
            onClick={() => ask()}
            disabled={loading}
            style={{
              background: 'var(--teal)', color: 'white', border: 'none',
              borderRadius: 'var(--r-sm)', padding: '10px 18px',
              fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, whiteSpace: 'nowrap',
            }}
          >
            {loading ? '…' : 'Consultar →'}
          </button>
        </div>

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CHIPS.map(c => (
            <button
              key={c.label}
              onClick={() => ask(c.q)}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 20, padding: '4px 12px',
                fontSize: 11, fontWeight: 700, color: 'var(--ink3)',
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Respuesta */}
        {(loading || response) && (
          <div style={{
            marginTop: 12, padding: '12px 14px',
            background: 'var(--bg)', borderRadius: 'var(--r-sm)',
            borderLeft: '3px solid var(--teal)',
            fontSize: 13, color: 'var(--ink2)', fontWeight: 600,
            lineHeight: 1.75, whiteSpace: 'pre-wrap',
          }}>
            {loading ? (
              <span style={{ color: 'var(--ink3)' }}>Consultando ARCA/AFIP…</span>
            ) : response}
          </div>
        )}
      </div>
    </div>
  )
}
