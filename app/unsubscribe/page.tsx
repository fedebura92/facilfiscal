'use client'
import { useState, useEffect } from 'react'

export default function Unsubscribe({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [email, setEmail] = useState(searchParams.email || '')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function desuscribir() {
    if (!email || !email.includes('@')) return
    setEstado('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setEstado('ok')
      else setEstado('error')
    } catch {
      setEstado('error')
    }
  }

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f7f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Nunito, sans-serif',
      padding: 24,
    }}>
      <style dangerouslySetInnerHTML={{__html:`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}}/>
      
      <div style={{
        background: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        maxWidth: 480,
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,.08)',
      }}>
        <div style={{ background: 'linear-gradient(135deg,#0d5c78,#1a7fa8)', padding: '24px 28px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>Fácil Fiscal</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>Tu solución contable y fiscal simplificada</div>
          </a>
        </div>

        <div style={{ padding: '28px 28px' }}>
          {estado === 'ok' ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0f2733', marginBottom: 8 }}>Suscripción cancelada</div>
              <p style={{ fontSize: 14, color: '#3d5a6b', lineHeight: 1.7, marginBottom: 20 }}>
                Ya no vas a recibir alertas de vencimientos en <strong>{email}</strong>.
                Si cambiás de opinión, podés volver a suscribirte en cualquier momento.
              </p>
              <a href="/" style={{
                display: 'block', background: '#1a7fa8', color: 'white',
                textAlign: 'center', padding: 14, borderRadius: 10,
                fontWeight: 800, fontSize: 14, textDecoration: 'none',
              }}>
                Volver a facilfiscal.com.ar
              </a>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0f2733', marginBottom: 8 }}>Cancelar suscripción</div>
              <p style={{ fontSize: 14, color: '#3d5a6b', lineHeight: 1.7, marginBottom: 20 }}>
                Si cancelás, dejás de recibir alertas de vencimientos impositivos.
                Podés volver a suscribirte cuando quieras.
              </p>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#7a9aaa', marginBottom: 6 }}>
                  Tu email
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  style={{
                    width: '100%', border: '1.5px solid #e2e8ed', borderRadius: 8,
                    padding: '10px 12px', fontSize: 14, fontWeight: 600,
                    color: '#0f2733', background: '#f4f7f9', outline: 'none',
                  }}
                />
              </div>

              {estado === 'error' && (
                <div style={{ background: '#fff1f1', border: '1px solid #ffc8c8', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#e53535', marginBottom: 14 }}>
                  No encontramos ese email. Verificá que sea el correcto.
                </div>
              )}

              <button
                onClick={desuscribir}
                disabled={estado === 'loading'}
                style={{
                  width: '100%', background: '#e53535', color: 'white',
                  border: 'none', borderRadius: 8, padding: 12,
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  opacity: estado === 'loading' ? 0.6 : 1,
                  marginBottom: 10,
                }}
              >
                {estado === 'loading' ? 'Cancelando…' : 'Cancelar mi suscripción'}
              </button>

              <a href="/" style={{
                display: 'block', textAlign: 'center', fontSize: 13,
                color: '#7a9aaa', textDecoration: 'none', fontWeight: 600,
              }}>
                Volver sin cancelar
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
