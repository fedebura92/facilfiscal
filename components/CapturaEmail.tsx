'use client'
import { useState, forwardRef } from 'react'

const OPCIONES = [
  { key: 'mono', label: 'Monotributista' },
  { key: 'ri',   label: 'Resp. Inscripto' },
  { key: 'aut',  label: 'Autónomo' },
]

const CapturaEmail = forwardRef<HTMLInputElement, { tipoDefault: 'mono' | 'ri' | 'aut' }>(
  function CapturaEmail({ tipoDefault }, ref) {
  const [email, setEmail]       = useState('')
  const [emailOk, setEmailOk]   = useState(false)
  const [tiposSel, setTiposSel] = useState<string[]>([tipoDefault])
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Monotributo y Responsable Inscripto son regímenes excluyentes entre sí;
  // Autónomo puede combinarse con cualquiera de los dos.
  function tipoDisabled(t: string) {
    if (t === 'mono') return tiposSel.includes('ri')
    if (t === 'ri')   return tiposSel.includes('mono')
    return false
  }

  function toggleTipo(t: string) {
    setError('')
    setTiposSel(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function submit() {
    if (!email || !email.includes('@')) { setError('Ingresá un email válido'); return }
    if (tiposSel.length === 0) { setError('Seleccioná al menos una categoría'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tipos: tiposSel }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar'); return }
      setEmailOk(true)
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ff-captura" style={{
      background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 100%)',
      position: 'relative', overflow: 'hidden', boxShadow: 'var(--sh-lg)',
    }}>
      <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 5 }}>
          Recordatorios gratis
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 5 }}>
          Recibí alertas antes<br />de cada vencimiento
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', fontWeight: 600 }}>
          Sin spam. Solo cuando importa.
        </div>
      </div>

      <div className="ff-cap-form" style={{ position: 'relative', zIndex: 1 }}>
        {emailOk ? (
          <div style={{ color: 'var(--gold)', fontSize: 15, fontWeight: 800 }}>
            ✓ ¡Listo! Revisá tu email.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {OPCIONES.map(op => (
                <label key={op.key} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  cursor: tipoDisabled(op.key) ? 'not-allowed' : 'pointer',
                  opacity: tipoDisabled(op.key) ? .4 : 1,
                }}>
                  <input
                    type="checkbox"
                    checked={tiposSel.includes(op.key)}
                    disabled={tipoDisabled(op.key)}
                    onChange={() => toggleTipo(op.key)}
                    style={{ width: 15, height: 15, accentColor: 'var(--gold)' }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{op.label}</span>
                </label>
              ))}
            </div>

            {error && <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 600 }}>{error}</div>}

            <div className="ff-cap-input-row">
              <input
                ref={ref}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{
                  background: 'rgba(255,255,255,.25)', border: '1.5px solid rgba(255,255,255,.6)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600,
                  color: 'white', outline: 'none', flex: 1, minWidth: 0,
                }}
              />
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  background: 'var(--gold)', color: 'var(--ink)', border: 'none', borderRadius: 8,
                  padding: '10px 16px', fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(245,166,35,.4)', flexShrink: 0,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
                }}
              >
                {loading ? 'Guardando…' : 'Activar →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
})

export default CapturaEmail
