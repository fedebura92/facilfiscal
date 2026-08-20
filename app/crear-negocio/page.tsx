'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { analizarProyecto } from '@/lib/comparador-negocio'
import type { DatosNegocio, AlternativaKey, Nivel, NegocioProyecto } from '@/lib/types'

const PROVINCIAS = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe',
  'Santiago del Estero','Tierra del Fuego','Tucumán',
]

const ACTIVIDADES = [
  'Comercio', 'Servicios', 'Industria / fábrica', 'Gastronomía', 'Construcción',
  'Transporte', 'Tecnología', 'Actividad profesional', 'Agro', 'Turismo', 'Otra',
]

const FORMA_OPERACION_OPTS = [
  { value: 'local_fisico', label: '🏬 Local físico' },
  { value: 'oficina', label: '🏢 Oficina / consultorio' },
  { value: 'fabrica', label: '🏭 Fábrica / taller' },
  { value: 'domicilio', label: '🚚 A domicilio' },
  { value: 'online', label: '💻 Online' },
  { value: 'mixto', label: '🔀 Mixto' },
]

const TIPO_CLIENTES_OPTS = [
  { value: 'consumidor_final', label: 'Consumidor final' },
  { value: 'monotributistas', label: 'Monotributistas' },
  { value: 'responsables_inscriptos', label: 'Responsables Inscriptos' },
  { value: 'empresas', label: 'Empresas' },
  { value: 'exterior', label: 'Clientes del exterior' },
]

const ALTERNATIVA_LABEL: Record<AlternativaKey, string> = {
  monotributo: '📋 Monotributo',
  regimen_general: '🏢 Régimen General',
  sociedad: '🤝 Sociedad',
}

const NIVEL_ICON: Record<Nivel, string> = { alta: '🟢', media: '🟡', baja: '⚪' }

const V = {
  tealDark: '#0d5c78', teal: '#1a7fa8', tealLight: '#e8f6fb', gold: '#f5a623',
  bg: '#f4f7f9', surface: '#fff', border: '#e2e8ed', border2: '#c8d8e2',
  ink: '#0f2733', ink2: '#3d5a6b', ink3: '#7a9aaa',
  green: '#16a34a', greenBg: '#f0fdf4', amber: '#d97706', amberBg: '#fffbeb',
  red: '#e53535', redBg: '#fff1f1',
}

const inp: React.CSSProperties = {
  padding: '11px 14px', border: `1.5px solid ${V.border}`, borderRadius: 10,
  fontSize: 13, fontFamily: "'Nunito', sans-serif", color: V.ink,
  background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box',
}
const cardStyle: React.CSSProperties = {
  background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16,
  marginBottom: 14, boxShadow: '0 1px 4px rgba(13,92,120,.07)', overflow: 'hidden',
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding: '9px 14px', borderRadius: 20, cursor: 'pointer',
      border: `1.5px solid ${active ? V.teal : V.border}`,
      background: active ? V.tealLight : '#fff',
      color: active ? V.tealDark : V.ink2,
      fontSize: 12.5, fontWeight: 700, fontFamily: "'Nunito',sans-serif",
    }}>{children}</button>
  )
}
function MultiChips({ options, selected, onToggle }: { options: { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(o => <Chip key={o.value} active={selected.includes(o.value)} onClick={() => onToggle(o.value)}>{o.label}</Chip>)}
    </div>
  )
}
function TriState({ value, onChange }: { value: boolean | null | undefined; onChange: (v: boolean | null) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Chip active={value === true} onClick={() => onChange(true)}>✓ Sí</Chip>
      <Chip active={value === false} onClick={() => onChange(false)}>✕ No</Chip>
      <Chip active={value == null} onClick={() => onChange(null)}>❓ No sé</Chip>
    </div>
  )
}
function Section({ title, subtitle, open, onToggle, children }: {
  title: string; subtitle?: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={cardStyle}>
      <button type="button" onClick={onToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: V.ink }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: V.ink3, fontWeight: 600, marginTop: 3 }}>{subtitle}</div>}
        </div>
        <div style={{ fontSize: 18, color: V.ink3, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>⌄</div>
      </button>
      {open && <div style={{ padding: '0 20px 22px' }}>{children}</div>}
    </div>
  )
}
const field = (label: string, node: React.ReactNode, help?: string) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2 }}>{label}</label>
    {node}
    {help && <span style={{ fontSize: 11, color: V.ink3, fontWeight: 600, lineHeight: 1.5 }}>{help}</span>}
  </div>
)

export default function CrearNegocioPage() {
  const router = useRouter()
  const [vista, setVista] = useState<'lista' | 'wizard'>('wizard')
  const [proyectos, setProyectos] = useState<NegocioProyecto[]>([])
  const [loadingLista, setLoadingLista] = useState(true)
  const [datos, setDatos] = useState<DatosNegocio>({ cantidad_socios: 1 })
  const [nombreProyecto, setNombreProyecto] = useState('')
  const [openSection, setOpenSection] = useState('proyecto')
  const [userId, setUserId] = useState<string | null>(null)
  const [proyectoId, setProyectoId] = useState<string | undefined>(undefined)
  const [alternativaElegida, setAlternativaElegida] = useState<AlternativaKey | ''>('')
  const [disclaimerOk, setDisclaimerOk] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // ?ver=proyectos (link "Mis proyectos" del menú del panel): fuerza la
    // pantalla de lista aunque todavía no haya ningún proyecto guardado, en
    // vez de mandar directo al wizard.
    const forzarLista = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ver') === 'proyectos'

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (!user) { setLoadingLista(false); if (forzarLista) setVista('wizard'); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoadingLista(false); return }
      try {
        const res = await fetch('/api/negocio/proyectos', { headers: { Authorization: `Bearer ${session.access_token}` } })
        const json = await res.json()
        const lista: NegocioProyecto[] = json.proyectos || []
        setProyectos(lista)
        setVista(forzarLista || lista.length > 0 ? 'lista' : 'wizard')
      } finally {
        setLoadingLista(false)
      }
    })
  }, [])

  function nuevoProyecto() {
    setDatos({ cantidad_socios: 1 })
    setNombreProyecto('')
    setProyectoId(undefined)
    setAlternativaElegida('')
    setDisclaimerOk(false)
    setOpenSection('proyecto')
    setError(''); setSuccess('')
    setVista('wizard')
  }

  function abrirProyecto(p: NegocioProyecto) {
    setDatos(p.datos || { cantidad_socios: 1 })
    setNombreProyecto(p.nombre || '')
    setProyectoId(p.id)
    setAlternativaElegida((p.alternativa_recomendada as AlternativaKey) || '')
    setDisclaimerOk(p.estado === 'activo') // ya lo aceptó la vez que lo activó
    setOpenSection('proyecto')
    setError(''); setSuccess('')
    setVista('wizard')
  }

  async function borrarProyecto(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch(`/api/negocio/proyectos?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } })
    setProyectos(prev => prev.filter(p => p.id !== id))
  }

  const set = <K extends keyof DatosNegocio>(k: K, v: DatosNegocio[K]) => setDatos(prev => ({ ...prev, [k]: v }))
  const toggleArr = (arr: string[] | undefined, v: string) => (arr || []).includes(v) ? (arr || []).filter(x => x !== v) : [...(arr || []), v]

  const analisis = useMemo(() => analizarProyecto(datos), [datos])

  useEffect(() => {
    const rec = analisis.resultados.find(r => r.es_recomendada)?.alternativa_key
    if (rec && !alternativaElegida) setAlternativaElegida(rec)
  }, [analisis.resultados]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => setOpenSection(prev => prev === id ? '' : id)

  async function guardar(estado: 'proyecto' | 'activo') {
    if (!userId) {
      router.push('/login')
      return
    }
    if (estado === 'activo' && !alternativaElegida) {
      setError('Elegí qué alternativa vas a usar antes de agregarla a Mi Perfil.')
      return
    }
    if (estado === 'activo' && !disclaimerOk) {
      setError('Tenés que marcar que entendiste el aviso antes de agregar el negocio a Mi Perfil.')
      return
    }
    setSaving(true); setError(''); setSuccess('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Tu sesión expiró.'); setSaving(false); return }

    try {
      const res = await fetch('/api/negocio/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id: proyectoId, nombre: nombreProyecto || undefined, datos, estado, alternativa_elegida: alternativaElegida || undefined }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Error al guardar'); setSaving(false); return }
      setProyectoId(json.id)
      setSuccess(estado === 'activo' ? '✅ Negocio agregado a Mi Perfil.' : '✅ Guardado como proyecto.')
    } catch {
      setError('Error de conexión.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: V.bg, fontFamily: "'Nunito',sans-serif", color: V.ink }}>
      <header style={{ background: V.surface, borderBottom: `1px solid ${V.border}`, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(13,92,120,.07)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height: 44, width: 'auto' }} />
        </Link>
        <Link href={userId ? '/mipanel' : '/login'} style={{ fontSize: 13, fontWeight: 700, color: V.ink3, textDecoration: 'none' }}>
          {userId ? '← Volver al panel' : 'Iniciar sesión'}
        </Link>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 100px' }}>
        {loadingLista ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: V.ink3, fontSize: 13, fontWeight: 600 }}>Cargando…</div>
        ) : vista === 'lista' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: V.ink, marginBottom: 4 }}>Tus proyectos 💡</div>
                <div style={{ fontSize: 13, color: V.ink3, fontWeight: 600 }}>Simulaciones y negocios que guardaste antes.</div>
              </div>
            </div>

            <button onClick={nuevoProyecto} style={{
              width: '100%', padding: 14, marginBottom: 16, borderRadius: 12, border: `1.5px dashed ${V.teal}`,
              background: V.tealLight, color: V.tealDark, fontSize: 13, fontWeight: 800,
              fontFamily: "'Nunito',sans-serif", cursor: 'pointer',
            }}>
              + Nuevo proyecto
            </button>

            {proyectos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: V.ink3, fontSize: 12.5, fontWeight: 600, lineHeight: 1.6 }}>
                Todavía no guardaste ningún proyecto. Cuando simules un negocio, vas a poder guardarlo acá para retomarlo después.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {proyectos.map(p => (
                  <div key={p.id} style={{ ...cardStyle, margin: 0, padding: 16, cursor: 'pointer' }} onClick={() => abrirProyecto(p)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: V.ink }}>
                        {p.nombre || p.datos?.actividad || 'Proyecto sin nombre'}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
                        background: p.estado === 'activo' ? V.greenBg : V.amberBg,
                        color: p.estado === 'activo' ? V.green : V.amber,
                      }}>
                        {p.estado === 'activo' ? '🟢 Negocio activo' : '📋 Proyecto'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: V.ink3, fontWeight: 600 }}>
                      {p.datos?.actividad || 'Sin actividad definida'}
                      {p.alternativa_recomendada && ` · Orientación: ${ALTERNATIVA_LABEL[p.alternativa_recomendada as AlternativaKey]}`}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button
                        onClick={e => { e.stopPropagation(); if (confirm('¿Borrar este proyecto?')) borrarProyecto(p.id) }}
                        style={{ fontSize: 11, fontWeight: 700, color: V.red, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
        <>
        {proyectos.length > 0 && (
          <button onClick={() => setVista('lista')} style={{ background: 'none', border: 'none', color: V.ink3, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 14 }}>
            ← Volver a tus proyectos
          </button>
        )}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: V.ink, marginBottom: 6 }}>Crear mi negocio 💡</div>
          <div style={{ fontSize: 13, color: V.ink3, fontWeight: 600 }}>
            Contanos qué querés hacer. Comparamos Monotributo, Régimen General y Sociedad para tu caso — sin dar nada por sentado.
          </div>
        </div>

        {/* Aviso legal — visible siempre, no solo al activar */}
        <div style={{ background: V.amberBg, border: `1px solid #fde4a0`, borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10 }}>
          <div style={{ fontSize: 16 }}>⚠️</div>
          <div style={{ fontSize: 11.5, color: '#8a5a00', fontWeight: 600, lineHeight: 1.6 }}>
            Esto es una <strong>orientación general</strong>, no un asesoramiento profesional ni una determinación legal o impositiva vinculante.
            Las alternativas se basan únicamente en lo que nos contás. La decisión final sobre cómo formalizar tu negocio, y sus consecuencias
            fiscales y legales, es tuya — te recomendamos confirmarla con un contador o asesor antes de inscribirte ante AFIP/ARCA.
          </div>
        </div>

        {field('Nombre del proyecto (opcional)', (
          <input style={inp} value={nombreProyecto} onChange={e => setNombreProyecto(e.target.value)} placeholder='Ej: "Cafetería en Palermo"' />
        ))}

        <Section title="Tu proyecto" open={openSection === 'proyecto'} onToggle={() => toggle('proyecto')}>
          {field('¿A qué actividad se dedica?', (
            <select style={inp} value={datos.actividad || ''} onChange={e => set('actividad', e.target.value)}>
              <option value="">Seleccioná una actividad</option>
              {ACTIVIDADES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          ))}
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2, display: 'block', marginBottom: 8 }}>¿Cómo va a operar?</label>
            <MultiChips options={FORMA_OPERACION_OPTS} selected={datos.forma_operacion || []} onToggle={v => set('forma_operacion', toggleArr(datos.forma_operacion, v))} />
          </div>
        </Section>

        <Section title="Cómo funciona el negocio" open={openSection === 'operacion'} onToggle={() => toggle('operacion')}>
          {field('Facturación mensual estimada', (
            <input type="number" style={inp} value={datos.facturacion_estimada ?? ''} onChange={e => set('facturacion_estimada', e.target.value ? Number(e.target.value) : null)} placeholder="Ej: 800000" />
          ), 'En pesos argentinos. Es el dato más importante para comparar las alternativas.')}
          {field('Inversión inicial estimada (opcional)', (
            <input type="number" style={inp} value={datos.inversion_inicial ?? ''} onChange={e => set('inversion_inicial', e.target.value ? Number(e.target.value) : null)} placeholder="Ej: 3000000" />
          ))}
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2, display: 'block', marginBottom: 8 }}>¿Qué expectativa de crecimiento tenés?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['baja', 'media', 'alta'] as const).map(n => (
                <Chip key={n} active={datos.expectativa_crecimiento === n} onClick={() => set('expectativa_crecimiento', n)}>
                  {n === 'baja' ? 'Estable' : n === 'media' ? 'Moderada' : 'Fuerte'}
                </Chip>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Socios" open={openSection === 'socios'} onToggle={() => toggle('socios')}>
          {field('¿Cuántas personas van a ser titulares del negocio?', (
            <input type="number" min={1} style={inp} value={datos.cantidad_socios ?? 1} onChange={e => set('cantidad_socios', Math.max(1, Number(e.target.value) || 1))} />
          ), '1 = vas a estar solo/a. Si son varios, hay que evaluar una estructura societaria.')}
        </Section>

        <Section title="Empleados" open={openSection === 'empleados'} onToggle={() => toggle('empleados')}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2, display: 'block', marginBottom: 8 }}>¿Vas a tener empleados en relación de dependencia?</label>
            <TriState value={datos.tiene_empleados} onChange={v => set('tiene_empleados', v)} />
          </div>
          {datos.tiene_empleados === true && field('¿Cuántos, aproximadamente?', (
            <input type="number" min={1} style={inp} value={datos.cantidad_empleados ?? ''} onChange={e => set('cantidad_empleados', e.target.value ? Number(e.target.value) : null)} />
          ))}
        </Section>

        <Section title="Clientes y jurisdicción" open={openSection === 'clientes'} onToggle={() => toggle('clientes')}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2, display: 'block', marginBottom: 8 }}>¿Quiénes van a ser tus clientes principalmente?</label>
            <MultiChips options={TIPO_CLIENTES_OPTS} selected={datos.tipo_clientes || []} onToggle={v => set('tipo_clientes', toggleArr(datos.tipo_clientes, v))} />
          </div>
          {field('Provincia principal', (
            <select style={inp} value={datos.provincia || ''} onChange={e => set('provincia', e.target.value)}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ))}
          {field('¿Vas a operar en otras provincias también?', (
            <input style={inp}
              value={(datos.provincias_operacion || []).join(', ')}
              onChange={e => set('provincias_operacion', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Ej: Córdoba, Santa Fe (dejalo vacío si es solo una)" />
          ))}
        </Section>

        <Section title="Comercio exterior" subtitle="Solo si aplica" open={openSection === 'exterior'} onToggle={() => toggle('exterior')}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2, display: 'block', marginBottom: 8 }}>¿Vas a importar?</label>
            <TriState value={datos.importaciones} onChange={v => set('importaciones', v)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: V.ink2, display: 'block', marginBottom: 8 }}>¿Vas a exportar?</label>
            <TriState value={datos.exportaciones} onChange={v => set('exportaciones', v)} />
          </div>
        </Section>

        {/* ── Análisis comparativo en vivo ─────────────────────────────── */}
        <div style={{ ...cardStyle, padding: 20, marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: V.ink }}>🔍 Comparación de alternativas</div>
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
              background: analisis.certeza === 'clara' ? V.greenBg : analisis.certeza === 'requiere_analisis' ? V.amberBg : V.redBg,
              color: analisis.certeza === 'clara' ? V.green : analisis.certeza === 'requiere_analisis' ? V.amber : V.red,
            }}>
              {analisis.certeza === 'clara' ? '🟢 Orientación clara' : analisis.certeza === 'requiere_analisis' ? '🟡 Requiere más análisis' : '🔴 Info insuficiente'}
            </span>
          </div>

          {analisis.certeza === 'insuficiente' ? (
            <p style={{ fontSize: 12.5, color: V.ink3, fontWeight: 600, lineHeight: 1.6, marginTop: 10 }}>
              Necesitamos algunos datos más para poder comparar correctamente las alternativas — completá al menos actividad, facturación estimada y cantidad de socios.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
              {analisis.resultados.map(r => (
                <div key={r.alternativa_key} style={{
                  border: `1.5px solid ${r.es_recomendada ? V.teal : V.border}`, borderRadius: 12, padding: 14,
                  background: r.es_recomendada ? V.tealLight : '#fff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: V.ink }}>{ALTERNATIVA_LABEL[r.alternativa_key]}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {r.es_recomendada && <span style={{ fontSize: 10, fontWeight: 800, color: V.teal, background: '#fff', padding: '2px 8px', borderRadius: 20, border: `1px solid ${V.teal}` }}>Nuestra orientación</span>}
                      <span style={{ fontSize: 12 }}>{r.adecuacion ? NIVEL_ICON[r.adecuacion] : '❓'}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.5, marginBottom: r.desventajas.length ? 8 : 0 }}>{r.explicacion}</div>
                  {r.desventajas.map((d, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: V.ink3, fontWeight: 600, lineHeight: 1.5, marginTop: 4 }}>⚠️ {d}</div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Acciones ──────────────────────────────────────────────────── */}
        {analisis.certeza !== 'insuficiente' && (
          <div style={{ ...cardStyle, padding: 20, marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 10 }}>¿Qué querés hacer con esto?</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: V.ink3, display: 'block', marginBottom: 8 }}>Si vas a avanzar, elegí qué alternativa vas a usar:</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {analisis.resultados.filter(r => r.adecuacion != null).map(r => (
                  <Chip key={r.alternativa_key} active={alternativaElegida === r.alternativa_key} onClick={() => setAlternativaElegida(r.alternativa_key)}>
                    {ALTERNATIVA_LABEL[r.alternativa_key]}
                  </Chip>
                ))}
              </div>
            </div>

            {error && <div style={{ background: V.redBg, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: V.red, fontWeight: 600, marginBottom: 10 }}>⚠️ {error}</div>}
            {success && <div style={{ background: V.greenBg, borderRadius: 8, padding: '9px 12px', fontSize: 12.5, color: V.green, fontWeight: 700, marginBottom: 10 }}>{success}</div>}
            {!userId && <div style={{ background: V.amberBg, borderRadius: 8, padding: '9px 12px', fontSize: 12, color: V.amber, fontWeight: 600, marginBottom: 10 }}>Necesitás iniciar sesión para guardar esto — por ahora es solo una simulación.</div>}

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={disclaimerOk} onChange={e => setDisclaimerOk(e.target.checked)} style={{ marginTop: 2, width: 15, height: 15, accentColor: V.teal, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: V.ink2, fontWeight: 600, lineHeight: 1.5 }}>
                Entiendo que esto es una orientación general, no un asesoramiento profesional, y que la decisión de cómo formalizar mi negocio es mi responsabilidad.
              </span>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => guardar('proyecto')} disabled={saving} style={{
                padding: 12, borderRadius: 10, border: `1.5px solid ${V.teal}`, background: '#fff', color: V.teal,
                fontSize: 13, fontWeight: 800, fontFamily: "'Nunito',sans-serif", cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                💾 Guardar como proyecto
              </button>
              <button onClick={() => guardar('activo')} disabled={saving || !disclaimerOk} style={{
                padding: 12, borderRadius: 10, border: 'none',
                background: !disclaimerOk ? V.border2 : `linear-gradient(135deg, ${V.tealDark}, ${V.teal})`, color: '#fff',
                fontSize: 13, fontWeight: 900, fontFamily: "'Nunito',sans-serif",
                cursor: (saving || !disclaimerOk) ? 'not-allowed' : 'pointer', opacity: saving ? .6 : 1,
              }}>
                {saving ? 'Guardando…' : '➕ Agregar a Mi Perfil'}
              </button>
              <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, textAlign: 'center', marginTop: 2 }}>
                🧪 Seguir simulando: no hace falta hacer nada, esto no se guarda hasta que elijas una opción de arriba.
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  )
}
