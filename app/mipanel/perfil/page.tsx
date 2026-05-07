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
  { value: 'ri',   label: '🏢 Responsable Inscripto', desc: 'Facturás IVA, mayor facturación posible' },
  { value: 'aut',  label: '👤 Autónomo', desc: 'Trabajo independiente, aportes jubilatorios' },
]

// Terminación de CUIT: último dígito del CUIT (0-9)
const TERMINACIONES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const V = {
  tealDark: '#0d5c78', teal: '#1a7fa8', tealLight: '#e8f6fb', tealRing: '#a8ddf0',
  gold: '#f5a623',
  red: '#e53535', redBg: '#fff1f1', redRing: '#ffc8c8',
  green: '#16a34a', greenBg: '#f0fdf4', greenRing: '#bbf7d0',
  bg: '#f4f7f9', surface: '#fff', border: '#e2e8ed', border2: '#c8d8e2',
  ink: '#0f2733', ink2: '#3d5a6b', ink3: '#7a9aaa',
}

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const [nombre, setNombre]         = useState('')
  const [provincia, setProvincia]   = useState('')
  const [actividad, setActividad]   = useState('')
  const [tipo, setTipo]             = useState('')
  const [facturacion, setFacturacion] = useState('')
  const [terminacion, setTerminacion] = useState('') // último dígito del CUIT

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('nombre, provincia, actividad, tipo_contribuyente, facturacion_estimada, terminacion_cuit')
        .eq('id', user.id)
        .single()

      if (data) {
        setNombre(data.nombre || '')
        setProvincia(data.provincia || '')
        setActividad(data.actividad || '')
        setTipo(data.tipo_contribuyente || '')
        setFacturacion(data.facturacion_estimada?.toString() || '')
        setTerminacion(data.terminacion_cuit || '')
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
      .from('users')
      .update({
        nombre,
        provincia,
        actividad,
        tipo_contribuyente: tipo,
        tipo,
        terminacion_cuit: terminacion || null,
        facturacion_estimada: facturacion ? parseFloat(facturacion) : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setSaving(false)

    if (err) {
      setError(`Error al guardar: ${err.message}`)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/mipanel'), 1200)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: V.ink3 }}>
        Cargando tu perfil...
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px',
    border: `1.5px solid ${V.border}`,
    borderRadius: 10,
    fontSize: 13,
    fontFamily: "'Nunito', sans-serif",
    color: V.ink,
    background: V.surface,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: V.ink2,
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, fontFamily: "'Nunito', sans-serif", color: V.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Topbar */}
      <header style={{
        background: V.surface, borderBottom: `1px solid ${V.border}`,
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(13,92,120,.07)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height: 44, width: 'auto' }} />
        </Link>
        <Link href="/mipanel" style={{ fontSize: 13, fontWeight: 700, color: V.ink3, textDecoration: 'none' }}>
          ← Volver al panel
        </Link>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '36px 20px 80px' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: V.ink, marginBottom: 6 }}>Tu perfil fiscal ⚙️</div>
          <div style={{ fontSize: 13, color: V.ink3, fontWeight: 600 }}>
            Con estos datos personalizamos tus vencimientos, tareas y alertas según tu situación.
          </div>
        </div>

        {/* Datos personales */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(13,92,120,.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: V.ink3, marginBottom: 16 }}>
            Datos personales
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Nombre (opcional)</label>
            <input
              type="text"
              placeholder="¿Cómo te llamás?"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Situación fiscal */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(13,92,120,.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: V.ink3, marginBottom: 16 }}>
            Tu situación fiscal *
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TIPOS.map(t => (
              <div
                key={t.value}
                onClick={() => setTipo(t.value)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '14px 16px', cursor: 'pointer',
                  border: `2px solid ${tipo === t.value ? V.teal : V.border}`,
                  borderRadius: 10,
                  background: tipo === t.value ? V.tealLight : V.surface,
                  transition: 'all .15s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: `2px solid ${tipo === t.value ? V.teal : V.border2}`,
                  background: tipo === t.value ? V.teal : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {tipo === t.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: V.ink3, marginTop: 2 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datos CUIT */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(13,92,120,.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: V.ink3, marginBottom: 4 }}>
            Terminación de CUIT
          </div>
          <div style={{ fontSize: 12, color: V.ink3, fontWeight: 600, marginBottom: 16, lineHeight: 1.5 }}>
            Es el último dígito de tu CUIT. Lo usamos para calcular tus fechas exactas de vencimiento (autónomos, IVA, cargas sociales varían según este número).
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TERMINACIONES.map(d => (
              <button
                key={d}
                onClick={() => setTerminacion(d)}
                style={{
                  width: 44, height: 44, borderRadius: 10, border: `2px solid ${terminacion === d ? V.teal : V.border}`,
                  background: terminacion === d ? V.teal : V.surface,
                  color: terminacion === d ? '#fff' : V.ink2,
                  fontSize: 16, fontWeight: 800, cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  transition: 'all .15s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
          {terminacion && (
            <div style={{ marginTop: 12, fontSize: 12, color: V.teal, fontWeight: 700 }}>
              ✓ Terminación seleccionada: {terminacion}
            </div>
          )}
        </div>

        {/* Negocio */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24, marginBottom: 16, boxShadow: '0 1px 4px rgba(13,92,120,.07)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: V.ink3, marginBottom: 16 }}>
            Tu negocio *
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <label style={labelStyle}>Tipo de actividad</label>
            <select value={actividad} onChange={e => setActividad(e.target.value)} style={inputStyle}>
              <option value="">Seleccioná tu actividad</option>
              {ACTIVIDADES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <label style={labelStyle}>Provincia</label>
            <select value={provincia} onChange={e => setProvincia(e.target.value)} style={inputStyle}>
              <option value="">Seleccioná tu provincia</option>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={labelStyle}>Facturación mensual estimada (opcional)</label>
            <input
              type="number"
              placeholder="Ej: 500000"
              value={facturacion}
              onChange={e => setFacturacion(e.target.value)}
              style={inputStyle}
            />
            <span style={{ fontSize: 11, color: V.ink3, fontWeight: 600 }}>
              En pesos argentinos. Sirve para recomendarte la categoría correcta.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {error && (
            <div style={{ background: V.redBg, border: `1px solid ${V.redRing}`, borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600, color: V.red }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ background: V.greenBg, border: `1px solid ${V.greenRing}`, borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 700, color: V.green, textAlign: 'center' }}>
              ✅ Perfil guardado. Volviendo al panel...
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || success}
            style={{
              padding: 14, border: 'none', borderRadius: 10,
              background: `linear-gradient(135deg, ${V.tealDark}, ${V.teal})`,
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
              padding: 12, border: `1.5px solid ${V.border}`, borderRadius: 10,
              fontSize: 13, fontWeight: 700, color: V.ink3,
              textDecoration: 'none', textAlign: 'center', display: 'block',
              background: V.surface,
            }}
          >
            Cancelar
          </Link>
        </div>

      </main>
    </div>
  )
}
