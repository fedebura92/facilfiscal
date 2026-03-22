'use client'
import { useState, useRef } from 'react'
import { TipoContribuyente } from '@/lib/types'

export default function CapturaEmail({ tipo }: { tipo: TipoContribuyente }) {
  const [email,    setEmail]    = useState('')
  const [ok,       setOk]       = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function submit() {
    if (!email || !email.includes('@')) { setError('Ingresá un email válido'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tipo_contribuyente: tipo }),
      })
      if (res.ok) { setOk(true) }
      else { setError('Hubo un error. Intentá de nuevo.') }
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)',
      borderRadius: 'var(--r-xl)', padding: '36px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 28, position: 'relative', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(13,92,120,.25)',
    }}>
      {/* Decoración */}
      <div style={{ position: 'absolute', right: -50, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
      <div style={{ position: 'absolute', right: 80, bottom: -70, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

      {/* Texto */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>
          Recordatorios gratis
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 5 }}>
          Recibí alertas antes<br />de cada vencimiento
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>
          Sin spam. Solo cuando importa.
        </div>
      </div>

      {/* Form / Confirmación */}
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        {ok ? (
          <div style={{ color: 'var(--gold)', fontSize: 16, fontWeight: 800 }}>
            ✓ ¡Listo! Te vamos a avisar antes de cada vencimiento.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={inputRef}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{
                  background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)',
                  borderRadius: 'var(--r-sm)', padding: '11px 16px',
                  fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600,
                  color: 'white', outline: 'none', width: 220,
                }}
              />
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  background: 'var(--gold)', color: 'var(--ink)',
                  border: 'none', borderRadius: 'var(--r-sm)', padding: '11px 20px',
                  fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 2px 10px rgba(245,166,35,.4)',
                }}
              >
                {loading ? 'Guardando…' : 'Activar alertas →'}
              </button>
            </div>
            {error && <p style={{ color: '#fca5a5', fontSize: 12, fontWeight: 600, marginTop: 6 }}>{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}
