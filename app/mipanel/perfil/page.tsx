'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

const ACTIVIDADES = [
  'Comercio / Venta de productos',
  'Servicios profesionales',
  'Gastronomía / Alimentos',
  'Construcción / Obras',
  'Tecnología / Sistemas',
  'Salud / Medicina',
  'Educación / Capacitación',
  'Arte / Diseño / Creatividad',
  'Transporte / Logística',
  'Otra actividad',
]

const TIPOS = [
  { value: 'mono', label: '📋 Monotributista', desc: 'Régimen simplificado, un solo pago mensual' },
  { value: 'ri', label: '🏢 Responsable Inscripto', desc: 'Facturás IVA, mayor facturación posible' },
  { value: 'aut', label: '👤 Autónomo', desc: 'Trabajo independiente, aportes jubilatorios' },
]

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [nombre, setNombre] = useState('')
  const [provincia, setProvincia] = useState('')
  const [actividad, setActividad] = useState('')
  const [tipo, setTipo] = useState('')
  const [facturacion, setFacturacion] = useState('')

  // Cargar perfil existente
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setNombre(data.nombre || '')
        setProvincia(data.provincia || '')
        setActividad(data.actividad || '')
        setTipo(data.tipo_contribuyente || '')
        setFacturacion(data.facturacion_estimada?.toString() || '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSave = async () => {
    if (!provincia || !actividad || !tipo) {
      setError('Completá todos los campos obligatorios.')
      return
    }

    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: err } = await supabase
      .from('profiles')
      .update({
        nombre,
        provincia,
        actividad,
        tipo_contribuyente: tipo,
        facturacion_estimada: facturacion ? parseFloat(facturacion) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (err) {
      setError('Error al guardar. Intentá de nuevo.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/mipanel'), 1500)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: '#64748b' }}>
        Cargando tu perfil...
      </div>
    )
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .perfil-root {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Nunito', sans-serif;
          color: #1e293b;
        }

        .perfil-topbar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .perfil-topbar a {
          font-weight: 800;
          font-size: 1rem;
          background: linear-gradient(135deg, #0d9488, #d97706);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
        }

        .back-link {
          font-size: .85rem;
          color: #64748b;
          font-weight: 600;
          text-decoration: none;
        }

        .back-link:hover { color: #0d9488; }

        .perfil-main {
          max-width: 600px;
          margin: 0 auto;
          padding: 36px 20px 64px;
        }

        .perfil-head {
          margin-bottom: 28px;
        }

        .perfil-title {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .perfil-sub {
          font-size: .9rem;
          color: #64748b;
        }

        .section {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,.05);
        }

        .section-title {
          font-size: .8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .field:last-child { margin-bottom: 0; }

        .field label {
          font-size: .82rem;
          font-weight: 700;
          color: #475569;
        }

        .field input,
        .field select {
          padding: 11px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: .9rem;
          font-family: 'Nunito', sans-serif;
          color: #1e293b;
          background: #fff;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }

        .field input:focus,
        .field select:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,.1);
        }

        .field .hint {
          font-size: .78rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* Tipo cards */
        .tipo-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tipo-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: border-color .15s, background .15s;
        }

        .tipo-card:hover { border-color: #99f6e4; background: #f0fdf4; }

        .tipo-card.selected {
          border-color: #0d9488;
          background: #f0fdfa;
        }

        .tipo-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color .15s;
        }

        .tipo-card.selected .tipo-radio {
          border-color: #0d9488;
          background: #0d9488;
        }

        .tipo-radio-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fff;
          display: none;
        }

        .tipo-card.selected .tipo-radio-dot { display: block; }

        .tipo-label {
          font-size: .9rem;
          font-weight: 700;
          color: #1e293b;
        }

        .tipo-desc {
          font-size: .8rem;
          color: #64748b;
          margin-top: 2px;
        }

        /* Actions */
        .actions {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: .85rem;
          color: #dc2626;
          font-weight: 600;
        }

        .success-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: .9rem;
          color: #166534;
          font-weight: 700;
          text-align: center;
        }

        .btn-save {
          padding: 14px;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: .95rem;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: opacity .2s, transform .15s;
        }

        .btn-save:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-save:disabled { opacity: .6; cursor: not-allowed; }

        .btn-cancel {
          padding: 12px;
          background: none;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: .875rem;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          color: #64748b;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          display: block;
          transition: background .15s;
        }

        .btn-cancel:hover { background: #f1f5f9; }
      `}</style>

      <div className="perfil-root">
        <header className="perfil-topbar">
          <Link href="/">Fácil Fiscal</Link>
          <Link href="/mipanel" className="back-link">← Volver al panel</Link>
        </header>

        <main className="perfil-main">
          <div className="perfil-head">
            <div className="perfil-title">Tu perfil fiscal ⚙️</div>
            <div className="perfil-sub">
              Con estos datos personalizamos tus vencimientos, tareas y alertas.
            </div>
          </div>

          {/* Datos básicos */}
          <div className="section">
            <div className="section-title">Datos personales</div>
            <div className="field">
              <label>Nombre (opcional)</label>
              <input
                type="text"
                placeholder="¿Cómo te llamás?"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>

          {/* Situación fiscal */}
          <div className="section">
            <div className="section-title">Tu situación fiscal *</div>
            <div className="tipo-grid">
              {TIPOS.map((t) => (
                <div
                  key={t.value}
                  className={`tipo-card ${tipo === t.value ? 'selected' : ''}`}
                  onClick={() => setTipo(t.value)}
                >
                  <div className="tipo-radio">
                    <div className="tipo-radio-dot" />
                  </div>
                  <div>
                    <div className="tipo-label">{t.label}</div>
                    <div className="tipo-desc">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad y provincia */}
          <div className="section">
            <div className="section-title">Tu negocio *</div>
            <div className="field">
              <label>Tipo de actividad</label>
              <select value={actividad} onChange={(e) => setActividad(e.target.value)}>
                <option value="">Seleccioná tu actividad</option>
                {ACTIVIDADES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Provincia</label>
              <select value={provincia} onChange={(e) => setProvincia(e.target.value)}>
                <option value="">Seleccioná tu provincia</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Facturación mensual estimada (opcional)</label>
              <input
                type="number"
                placeholder="Ej: 500000"
                value={facturacion}
                onChange={(e) => setFacturacion(e.target.value)}
              />
              <span className="hint">En pesos argentinos. Sirve para recomendarte la categoría correcta.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="actions">
            {error && <div className="error-box">⚠️ {error}</div>}
            {success && <div className="success-box">✅ Perfil guardado. Volviendo al panel...</div>}
            <button className="btn-save" onClick={handleSave} disabled={saving || success}>
              {saving ? 'Guardando...' : 'Guardar perfil →'}
            </button>
            <Link href="/mipanel" className="btn-cancel">Cancelar</Link>
          </div>
        </main>
      </div>
    </>
  )
}
