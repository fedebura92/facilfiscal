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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: 'var(--ink3)' }}>
        Cargando tu perfil...
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r)',
    fontSize: 13,
    fontFamily: "'Nunito', sans-serif",
    color: 'var(--ink)',
    background: 'var(--surface)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Nunito', sans-serif", color: 'var(--ink)' }}>

      {/* Topbar */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--sh-sm)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo.png" alt="Fácil Fiscal" style={{ height: 100, width: 'auto' }} />
        </Link>
        <Link href="/mipanel" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink3)', textDecoration: 'none' }}>
          ← Volver al panel
        </Link>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '36px 20px 80px' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', marginBottom: 6 }}>Tu perfil fiscal ⚙️</div>
          <div style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 600 }}>
            Con estos datos personalizamos tus vencimientos, tareas y alertas serán según tu situación fiscal.
          </div>
        </div>

        {/* Datos personales */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16, boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink3)', marginBottom: 16 }}>
            Datos personales
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Nombre (opcional)</label>
            <input
              type="text"
              placeholder="¿Cómo te llamás?"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Situación fiscal */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16, boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink3)', marginBottom: 16 }}>
            Tu situación fiscal *
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIPOS.map((t) => (
              <div
                key={t.value}
                onClick={() => setTipo(t.value)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px', cursor: 'pointer',
                  border: `2px solid ${tipo === t.value ? 'var(--teal)' : 'var(--border)'}`,
                  borderRadius: 'var(--r)',
                  background: tipo === t.value ? 'var(--teal-light)' : 'var(--surface)',
                  transition: 'all .15s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: `2px solid ${tipo === t.value ? 'var(--teal)' : 'var(--border2)'}`,
                  background: tipo === t.value ? 'var(--teal)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tipo === t.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 2 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Negocio */}
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16, boxShadow: 'var(--sh-sm)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink3)', marginBottom: 16 }}>
            Tu negocio *
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Tipo de actividad</label>
            <select value={actividad} onChange={(e) => setActividad(e.target.value)} style={inputStyle}>
              <option value="">Seleccioná tu actividad</option>
              {ACTIVIDADES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Provincia</label>
            <select value={provincia} onChange={(e) => setProvincia(e.target.value)} style={inputStyle}>
              <option value="">Seleccioná tu provincia</option>
              {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Facturación mensual estimada (opcional)</label>
            <input
              type="number"
              placeholder="Ej: 500000"
              value={facturacion}
              onChange={(e) => setFacturacion(e.target.value)}
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 600 }}>
              En pesos argentinos. Sirve para recomendarte la categoría correcta.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-ring)', borderRadius: 'var(--r)', padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--red)' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-ring)', borderRadius: 'var(--r)', padding: '11px 14px', fontSize: 13, fontWeight: 700, color: 'var(--green)', textAlign: 'center' }}>
              ✅ Perfil guardado. Volviendo al panel...
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || success}
            style={{
              padding: 14, border: 'none', borderRadius: 'var(--r)',
              background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))',
              color: '#fff', fontSize: 14, fontWeight: 900,
              fontFamily: "'Nunito', sans-serif",
              cursor: saving || success ? 'not-allowed' : 'pointer',
              opacity: saving || success ? .6 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar perfil →'}
          </button>
          <Link
            href="/mipanel"
            style={{
              padding: 12, border: '1.5px solid var(--border)', borderRadius: 'var(--r)',
              fontSize: 13, fontWeight: 700, color: 'var(--ink3)',
              textDecoration: 'none', textAlign: 'center', display: 'block',
              background: 'var(--surface)',
            }}
          >
            Cancelar
          </Link>
        </div>

      </main>
    </div>
  )
}
