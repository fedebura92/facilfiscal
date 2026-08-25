'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CATEGORIAS_MONO } from '@/lib/data'
import { calcularDiagnostico, calcularCompletitud, type Obligacion } from '@/lib/reglas-fiscales'
import type { PerfilFiscal, SituacionFiscal, FormaOperacion } from '@/lib/types'

// Cómo llegamos a cada obligación — ver lib/reglas-fiscales.ts
const CONFIANZA_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  inferido: 'Inferido',
  heredado: 'Heredado',
  por_confirmar: 'Por confirmar',
}

// ── Datos de referencia ───────────────────────────────────────────────────
const PROVINCIAS = [
  'Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes',
  'Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones',
  'Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe',
  'Santiago del Estero','Tierra del Fuego','Tucumán',
]

const ACTIVIDADES = [
  'Comercio / Venta de productos','Servicios profesionales','Gastronomía / Alimentos',
  'Construcción / Obras','Tecnología / Sistemas','Salud / Medicina',
  'Educación / Capacitación','Arte / Diseño / Creatividad','Transporte / Logística',
  'Agropecuaria','Industria / Fábrica','Otra actividad',
]

const SITUACIONES_FISCALES: { value: SituacionFiscal; label: string; desc: string }[] = [
  { value: 'mono',         label: '📋 Monotributo',            desc: 'Régimen simplificado, un solo pago mensual' },
  { value: 'ri',           label: '🏢 Responsable Inscripto',  desc: 'Facturás con IVA discriminado' },
  { value: 'exento',       label: '🔓 Exento',                 desc: 'No pagás IVA por tu actividad' },
  { value: 'no_inscripto', label: '📝 No inscripto todavía',   desc: 'Estoy por darme de alta' },
  { value: 'no_se',        label: '❓ No sé / no estoy seguro', desc: 'Te ayudamos a averiguarlo' },
]

const FORMA_OPERACION_OPTS: { value: FormaOperacion; label: string }[] = [
  { value: 'local_fisico', label: '🏬 Local físico' },
  { value: 'oficina',      label: '🏢 Oficina / consultorio' },
  { value: 'fabrica',      label: '🏭 Fábrica / taller' },
  { value: 'domicilio',    label: '🚚 A domicilio' },
  { value: 'online',       label: '💻 Online' },
  { value: 'mixto',        label: '🔀 Mixto' },
]

const TIPO_CLIENTES_OPTS = [
  { value: 'consumidor_final', label: 'Consumidor final' },
  { value: 'monotributistas',  label: 'Monotributistas' },
  { value: 'responsables_inscriptos', label: 'Responsables Inscriptos' },
  { value: 'empresas',         label: 'Empresas' },
  { value: 'exterior',         label: 'Clientes del exterior' },
]

const CANALES_VENTA_OPTS = [
  { value: 'local',           label: 'Local' },
  { value: 'online',          label: 'Online / web propia' },
  { value: 'mercado_libre',   label: 'Mercado Libre' },
  { value: 'redes_sociales',  label: 'Redes sociales' },
  { value: 'otros',           label: 'Otros' },
]

const MEDIOS_COBRO_OPTS = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'mercadopago',   label: 'Mercado Pago' },
  { value: 'tarjeta',       label: 'Tarjeta' },
  { value: 'otros',         label: 'Otros' },
]

const SITUACIONES_ESPECIALES_OPTS = [
  { value: 'importaciones',       label: '📦 Importaciones' },
  { value: 'exportaciones',       label: '🌎 Exportaciones' },
  { value: 'servicios_exterior',  label: '🌐 Servicios al exterior' },
  { value: 'comercio_electronico',label: '🛒 Comercio electrónico' },
  { value: 'alquiler_local',      label: '🔑 Alquiler de local' },
]

// ── Estilos (mismo sistema de diseño: Nunito, teal/gold, sin Tailwind) ────
const V = {
  tealDark:'#0d5c78', teal:'#1a7fa8', tealLight:'#e8f6fb',
  gold:'#f5a623', red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
  green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  amber:'#d97706', amberBg:'#fffbeb', amberRing:'#fde68a',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed', border2:'#c8d8e2',
  ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
}

const inp: React.CSSProperties = {
  padding:'11px 14px', border:`1.5px solid ${V.border}`, borderRadius:10,
  fontSize:13, fontFamily:"'Nunito', sans-serif", color:V.ink,
  background:'#fff', outline:'none', width:'100%', boxSizing:'border-box',
}

const cardStyle: React.CSSProperties = {
  background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16,
  marginBottom:14, boxShadow:'0 1px 4px rgba(13,92,120,.07)', overflow:'hidden',
}

// ── Sub-componentes reutilizables ──────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} style={{
      padding:'9px 14px', borderRadius:20, cursor:'pointer',
      border:`1.5px solid ${active ? V.teal : V.border}`,
      background:active ? V.tealLight : '#fff',
      color:active ? V.tealDark : V.ink2,
      fontSize:12.5, fontWeight:700, fontFamily:"'Nunito',sans-serif",
      transition:'all .15s',
    }}>
      {children}
    </button>
  )
}

function MultiChips({ options, selected, onToggle }: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {options.map(o => (
        <Chip key={o.value} active={selected.includes(o.value)} onClick={() => onToggle(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  )
}

// Tri-estado: Sí / No / No sé → true | false | null. "No sé" es una
// respuesta válida, no la ausencia de respuesta (spec Mi Perfil, punto 6).
function TriState({ value, onChange, labelSi = 'Sí', labelNo = 'No' }: {
  value: boolean | null | undefined
  onChange: (v: boolean | null) => void
  labelSi?: string
  labelNo?: string
}) {
  return (
    <div style={{ display:'flex', gap:8 }}>
      <Chip active={value === true} onClick={() => onChange(true)}>✓ {labelSi}</Chip>
      <Chip active={value === false} onClick={() => onChange(false)}>✕ {labelNo}</Chip>
      <Chip active={value === null || value === undefined} onClick={() => onChange(null)}>❓ No sé</Chip>
    </div>
  )
}

function Section({ id, title, badge, subtitle, open, onToggle, children }: {
  id: string
  title: string
  badge?: string
  subtitle?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div style={cardStyle}>
      <button type="button" onClick={onToggle} style={{
        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'18px 20px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left',
      }}>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:V.ink, display:'flex', alignItems:'center', gap:8 }}>
            {title}
            {badge && (
              <span style={{
                fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20,
                background: badge === 'Completo' ? V.greenBg : V.amberBg,
                color: badge === 'Completo' ? V.green : V.amber,
              }}>{badge}</span>
            )}
          </div>
          {subtitle && <div style={{ fontSize:12, color:V.ink3, fontWeight:600, marginTop:3 }}>{subtitle}</div>}
        </div>
        <div style={{ fontSize:18, color:V.ink3, transform: open ? 'rotate(180deg)' : 'none', transition:'transform .15s' }}>⌄</div>
      </button>
      {open && <div style={{ padding:'0 20px 22px' }}>{children}</div>}
    </div>
  )
}

const field = (label: string, node: React.ReactNode, help?: string) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
    <label style={{ fontSize:12, fontWeight:700, color:V.ink2 }}>{label}</label>
    {node}
    {help && <span style={{ fontSize:11, color:V.ink3, fontWeight:600, lineHeight:1.5 }}>{help}</span>}
  </div>
)

// ── Página ──────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [perfil, setPerfil] = useState<PerfilFiscal | null>(null)
  const [diagnostico, setDiagnostico] = useState<Obligacion[] | null>(null)
  const [openSection, setOpenSection] = useState<string>('personal')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchErr || !data) {
        await supabase.from('profiles').insert({ id: user.id, email: user.email })
        setPerfil({ id: user.id, email: user.email ?? undefined })
      } else {
        setPerfil(data as PerfilFiscal)
        // Diagnóstico local instantáneo (sin esperar al servidor) para que
        // el usuario vea algo apenas entra, aunque no haya guardado todavía.
        setDiagnostico(calcularDiagnostico(data as PerfilFiscal))
      }
      setLoading(false)
    })()
  }, [router])

  const set = useCallback(<K extends keyof PerfilFiscal>(key: K, value: PerfilFiscal[K]) => {
    setPerfil(prev => prev ? { ...prev, [key]: value } : prev)
  }, [])

  const setExtra = useCallback((key: string, value: any) => {
    setPerfil(prev => prev ? { ...prev, perfil_data: { ...(prev.perfil_data || {}), [key]: value } } : prev)
  }, [])

  const toggleInArray = (arr: string[] | undefined, value: string) => {
    const cur = arr || []
    return cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
  }

  // Recalcula el diagnóstico en vivo cada vez que cambia el perfil localmente,
  // para que la sección de diagnóstico se sienta "viva" incluso antes de guardar.
  useEffect(() => {
    if (perfil) setDiagnostico(calcularDiagnostico(perfil))
  }, [perfil])

  const completitud = perfil ? calcularCompletitud(perfil) : 0

  // Mapeo a las columnas legadas (tipo_contribuyente/actividad) para no
  // romper el resto de la app (checklist, vencimientos, panel financiero)
  // mientras esas partes siguen sin migrarse al nuevo modelo.
  function tipoContribuyenteLegado(p: PerfilFiscal): string {
    if (p.situacion_fiscal === 'mono') return 'mono'
    if (p.situacion_fiscal === 'ri') return 'ri'
    if (p.inscripto_autonomos) return 'aut'
    return p.situacion_fiscal === 'exento' || p.situacion_fiscal === 'no_inscripto' ? 'ri' : 'mono'
  }

  async function handleSave() {
    if (!perfil) return
    setSaving(true)
    setError('')
    setSuccess(false)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Tu sesión expiró. Volvé a iniciar sesión.'); setSaving(false); return }

    const payload = {
      nombre: perfil.nombre ?? null,
      dni: perfil.dni ?? null,
      cuit: perfil.cuit ?? null,
      telefono: perfil.telefono ?? null,
      domicilio_fiscal: perfil.domicilio_fiscal ?? null,
      nombre_fantasia: perfil.nombre_fantasia ?? null,
      actividad_principal: perfil.actividad_principal ?? null,
      actividad: perfil.actividad_principal ?? null, // compat legado
      actividades_secundarias: perfil.actividades_secundarias ?? [],
      fecha_inicio_actividad: perfil.fecha_inicio_actividad || null,
      forma_operacion: perfil.forma_operacion ?? [],
      situacion_fiscal: perfil.situacion_fiscal ?? null,
      categoria_monotributo: perfil.categoria_monotributo ?? null,
      fecha_alta_fiscal: perfil.fecha_alta_fiscal || null,
      inscripto_autonomos: perfil.inscripto_autonomos ?? null,
      provincia: perfil.provincia ?? null,
      localidad: perfil.localidad ?? null,
      inscripto_iibb: perfil.inscripto_iibb ?? null,
      otras_jurisdicciones: perfil.otras_jurisdicciones ?? [],
      tiene_empleados: perfil.tiene_empleados ?? null,
      cantidad_empleados: perfil.cantidad_empleados ?? null,
      facturacion_estimada: perfil.facturacion_estimada ?? null,
      terminacion_cuit: perfil.terminacion_cuit ?? null,
      perfil_data: perfil.perfil_data ?? {},
      tipo_contribuyente: tipoContribuyenteLegado(perfil), // compat legado
    }

    const { error: saveErr } = await supabase.from('profiles').update(payload).eq('id', perfil.id)

    if (saveErr) {
      setError(`Error al guardar: ${saveErr.message}`)
      setSaving(false)
      return
    }

    // Recalcula el diagnóstico server-side y lo persiste en profile_diagnostico
    try {
      const res = await fetch('/api/perfil/recalcular', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (res.ok) {
        setDiagnostico(json.diagnostico)
      }
    } catch {
      // El guardado ya se hizo; si falla el recálculo remoto seguimos con el local.
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  if (loading || !perfil) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", color:V.ink3 }}>
      Cargando tu perfil...
    </div>
  )

  const toggle = (id: string) => setOpenSection(prev => prev === id ? '' : id)

  return (
    <div style={{ minHeight:'100vh', background:V.bg, fontFamily:"'Nunito',sans-serif", color:V.ink }}>
      <header style={{ background:V.surface, borderBottom:`1px solid ${V.border}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 4px rgba(13,92,120,.07)' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height:44, width:'auto' }} />
        </Link>
        <Link href="/mipanel" style={{ fontSize:13, fontWeight:700, color:V.ink3, textDecoration:'none' }}>← Volver al panel</Link>
      </header>

      <main style={{ maxWidth:640, margin:'0 auto', padding:'32px 20px 100px' }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:22, fontWeight:900, color:V.ink, marginBottom:6 }}>Tu perfil fiscal ⚙️</div>
          <div style={{ fontSize:13, color:V.ink3, fontWeight:600 }}>
            Contanos cómo es tu negocio. Con eso calculamos qué obligaciones tenés, qué vence y qué falta.
          </div>
        </div>

        {/* Completitud */}
        <div style={{ ...cardStyle, padding:'16px 20px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
            <span style={{ fontSize:12.5, fontWeight:800, color:V.ink2 }}>Perfil fiscal</span>
            <span style={{ fontSize:13, fontWeight:900, color: completitud === 100 ? V.green : V.teal }}>{completitud}% completo</span>
          </div>
          <div style={{ height:8, borderRadius:20, background:V.border, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${completitud}%`, background:`linear-gradient(90deg, ${V.teal}, ${V.gold})`, transition:'width .3s' }} />
          </div>
        </div>

        {/* ── Sección: Datos personales ─────────────────────────────── */}
        <Section id="personal" title="Datos personales" open={openSection==='personal'} onToggle={() => toggle('personal')}>
          {field('Nombre', <input style={inp} value={perfil.nombre || ''} onChange={e => set('nombre', e.target.value)} placeholder="¿Cómo te llamás?" />)}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {field('DNI', <input style={inp} value={perfil.dni || ''} onChange={e => set('dni', e.target.value)} placeholder="Sin puntos" />)}
            {field('CUIT', <input style={inp} value={perfil.cuit || ''} onChange={e => set('cuit', e.target.value)} placeholder="Sin guiones" />)}
          </div>
          {field('Teléfono', <input style={inp} value={perfil.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="Opcional" />)}
          {field('Domicilio fiscal', <input style={inp} value={perfil.domicilio_fiscal || ''} onChange={e => set('domicilio_fiscal', e.target.value)} placeholder="Opcional" />)}

          <div style={{ marginTop:4 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>Terminación de CUIT *</label>
            <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginBottom:10 }}>El último dígito. Lo usamos para calcular tus fechas exactas de vencimiento.</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['0','1','2','3','4','5','6','7','8','9'].map(d => (
                <button key={d} type="button" onClick={() => set('terminacion_cuit', d)} style={{
                  width:42, height:42, borderRadius:10,
                  border:`2px solid ${perfil.terminacion_cuit === d ? V.teal : V.border}`,
                  background:perfil.terminacion_cuit === d ? V.teal : '#fff',
                  color:perfil.terminacion_cuit === d ? '#fff' : V.ink2,
                  fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif",
                }}>{d}</button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Sección: Tu negocio ───────────────────────────────────── */}
        <Section id="negocio" title="Tu negocio" open={openSection==='negocio'} onToggle={() => toggle('negocio')}>
          {field('Nombre de fantasía', <input style={inp} value={perfil.nombre_fantasia || ''} onChange={e => set('nombre_fantasia', e.target.value)} placeholder="Opcional" />)}
          {field('Actividad principal', (
            <select style={inp} value={perfil.actividad_principal || ''} onChange={e => set('actividad_principal', e.target.value)}>
              <option value="">Seleccioná tu actividad</option>
              {ACTIVIDADES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          ))}
          {field('Fecha de inicio de actividad', <input type="date" style={inp} value={perfil.fecha_inicio_actividad || ''} onChange={e => set('fecha_inicio_actividad', e.target.value)} />)}
          <div style={{ marginBottom:4 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>¿Cómo operás? (elegí todas las que apliquen)</label>
            <MultiChips
              options={FORMA_OPERACION_OPTS}
              selected={perfil.forma_operacion || []}
              onToggle={v => set('forma_operacion', toggleInArray(perfil.forma_operacion, v) as FormaOperacion[])}
            />
          </div>
        </Section>

        {/* ── Sección: Situación fiscal ─────────────────────────────── */}
        <Section id="fiscal" title="Situación fiscal" open={openSection==='fiscal'} onToggle={() => toggle('fiscal')}>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }}>
            {SITUACIONES_FISCALES.map(t => (
              <div key={t.value} onClick={() => set('situacion_fiscal', t.value)} style={{
                display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px', cursor:'pointer',
                border:`2px solid ${perfil.situacion_fiscal === t.value ? V.teal : V.border}`, borderRadius:10,
                background:perfil.situacion_fiscal === t.value ? V.tealLight : '#fff',
              }}>
                <div style={{
                  width:18, height:18, borderRadius:'50%', flexShrink:0, marginTop:2,
                  border:`2px solid ${perfil.situacion_fiscal === t.value ? V.teal : V.border2}`,
                  background:perfil.situacion_fiscal === t.value ? V.teal : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  {perfil.situacion_fiscal === t.value && <div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:V.ink }}>{t.label}</div>
                  <div style={{ fontSize:12, color:V.ink3, marginTop:2 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {perfil.situacion_fiscal === 'mono' && field('Categoría de Monotributo', (
            <select style={inp} value={perfil.categoria_monotributo || ''} onChange={e => set('categoria_monotributo', e.target.value)}>
              <option value="">No sé / todavía no la tengo</option>
              {CATEGORIAS_MONO.map(c => <option key={c.letra} value={c.letra}>Categoría {c.letra}</option>)}
            </select>
          ))}

          {field('Fecha de alta fiscal', <input type="date" style={inp} value={perfil.fecha_alta_fiscal || ''} onChange={e => set('fecha_alta_fiscal', e.target.value)} />)}

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>¿Hacés aportes como Autónomo?</label>
            <TriState value={perfil.inscripto_autonomos} onChange={v => set('inscripto_autonomos', v)} />
          </div>

          {field('Facturación mensual estimada', (
            <input type="number" style={inp} value={perfil.facturacion_estimada ?? ''} onChange={e => set('facturacion_estimada', e.target.value ? Number(e.target.value) : null)} placeholder="Ej: 500000" />
          ), 'En pesos argentinos. Sirve para recomendarte la categoría correcta.')}
        </Section>

        {/* ── Sección: Jurisdicción ─────────────────────────────────── */}
        <Section id="jurisdiccion" title="Jurisdicción" open={openSection==='jurisdiccion'} onToggle={() => toggle('jurisdiccion')}>
          {field('Provincia', (
            <select style={inp} value={perfil.provincia || ''} onChange={e => set('provincia', e.target.value)}>
              <option value="">Seleccioná tu provincia</option>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ))}
          {field('Localidad', <input style={inp} value={perfil.localidad || ''} onChange={e => set('localidad', e.target.value)} placeholder="Opcional" />)}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>¿Estás inscripto en Ingresos Brutos?</label>
            <TriState value={perfil.inscripto_iibb} onChange={v => set('inscripto_iibb', v)} />
          </div>
          {field('¿Operás en otras provincias?', (
            <input style={inp}
              value={(perfil.otras_jurisdicciones || []).join(', ')}
              onChange={e => set('otras_jurisdicciones', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Ej: Córdoba, Santa Fe" />
          ), 'Si operás en más de una provincia puede corresponderte Convenio Multilateral.')}
        </Section>

        {/* ── Sección: Empleados (condicional) ──────────────────────── */}
        <Section id="empleados" title="Empleados" open={openSection==='empleados'} onToggle={() => toggle('empleados')}>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>¿Tenés empleados en relación de dependencia?</label>
            <TriState value={perfil.tiene_empleados} onChange={v => set('tiene_empleados', v)} />
          </div>

          {perfil.tiene_empleados === true && (
            <>
              {field('Cantidad de empleados', (
                <input type="number" style={inp} min={1} value={perfil.cantidad_empleados ?? ''} onChange={e => set('cantidad_empleados', e.target.value ? Number(e.target.value) : null)} />
              ))}
              <div style={{ marginBottom:4 }}>
                <Chip
                  active={!!perfil.perfil_data?.empleados_detalle?.art}
                  onClick={() => setExtra('empleados_detalle', { ...(perfil.perfil_data?.empleados_detalle || {}), art: !perfil.perfil_data?.empleados_detalle?.art })}
                >
                  {perfil.perfil_data?.empleados_detalle?.art ? '✓' : ''} Tengo ART contratada
                </Chip>
              </div>
            </>
          )}
        </Section>

        {/* ── Sección: Facturación y operaciones ────────────────────── */}
        <Section id="operaciones" title="Facturación y operaciones" open={openSection==='operaciones'} onToggle={() => toggle('operaciones')}>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>Tipo de clientes</label>
            <MultiChips options={TIPO_CLIENTES_OPTS} selected={perfil.perfil_data?.tipo_clientes || []} onToggle={v => setExtra('tipo_clientes', toggleInArray(perfil.perfil_data?.tipo_clientes, v))} />
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>Canales de venta</label>
            <MultiChips options={CANALES_VENTA_OPTS} selected={perfil.perfil_data?.canales_venta || []} onToggle={v => setExtra('canales_venta', toggleInArray(perfil.perfil_data?.canales_venta, v))} />
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:V.ink2, display:'block', marginBottom:8 }}>Medios de cobro</label>
            <MultiChips options={MEDIOS_COBRO_OPTS} selected={perfil.perfil_data?.medios_cobro || []} onToggle={v => setExtra('medios_cobro', toggleInArray(perfil.perfil_data?.medios_cobro, v))} />
          </div>
        </Section>

        {/* ── Sección: Situaciones especiales ───────────────────────── */}
        <Section id="especiales" title="Situaciones especiales" subtitle="Solo marcá lo que te aplique" open={openSection==='especiales'} onToggle={() => toggle('especiales')}>
          <MultiChips
            options={SITUACIONES_ESPECIALES_OPTS}
            selected={perfil.perfil_data?.situaciones_especiales || []}
            onToggle={v => setExtra('situaciones_especiales', toggleInArray(perfil.perfil_data?.situaciones_especiales, v))}
          />
        </Section>

        {/* ── Diagnóstico (Nivel 2) ──────────────────────────────────── */}
        {diagnostico && (
          <div style={{ ...cardStyle, padding:20, marginTop:6 }}>
            <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:4 }}>Diagnóstico fiscal</div>
            <div style={{ fontSize:11.5, color:V.ink3, fontWeight:600, marginBottom:16, lineHeight:1.5, fontStyle:'italic' }}>
              Esto se basa en lo que nos contaste hasta ahora. Cuando falte información te lo indicamos — nunca damos por hecho algo que no confirmaste.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {diagnostico.map(o => {
                const color = o.aplica === true ? V.green : o.aplica === false ? V.ink3 : V.amber
                const bg = o.aplica === true ? V.greenBg : o.aplica === false ? V.bg : V.amberBg
                const icon = o.confianza === 'confirmado' ? '🟢' : o.confianza === 'inferido' ? '🟡' : o.confianza === 'heredado' ? '🔵' : '🟠'
                return (
                  <div key={o.key} style={{ display:'flex', gap:10, padding:'10px 12px', borderRadius:10, background:bg }}>
                    <div style={{ fontSize:15 }}>{icon}</div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ fontSize:12.5, fontWeight:800, color }}>{o.label}</div><span style={{ fontSize:9, fontWeight:800, color:V.ink3, textTransform:'uppercase' as const, letterSpacing:'.03em' }}>{CONFIANZA_LABEL[o.confianza]}</span></div>
                      <div style={{ fontSize:11.5, color:V.ink2, fontWeight:600, marginTop:2, lineHeight:1.4 }}>{o.motivo}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Acciones ───────────────────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:20 }}>
          {error && <div style={{ background:V.redBg, border:`1px solid ${V.redRing}`, borderRadius:10, padding:'11px 14px', fontSize:13, fontWeight:600, color:V.red }}>⚠️ {error}</div>}
          {success && <div style={{ background:V.greenBg, border:`1px solid ${V.greenRing}`, borderRadius:10, padding:'11px 14px', fontSize:13, fontWeight:700, color:V.green, textAlign:'center' }}>✅ Perfil guardado y diagnóstico actualizado.</div>}
          <button onClick={handleSave} disabled={saving} style={{
            padding:14, border:'none', borderRadius:10,
            background:`linear-gradient(135deg, ${V.tealDark}, ${V.teal})`,
            color:'#fff', fontSize:14, fontWeight:900,
            fontFamily:"'Nunito',sans-serif",
            cursor:saving ? 'not-allowed' : 'pointer',
            opacity:saving ? .6 : 1,
          }}>
            {saving ? 'Guardando...' : 'Guardar y actualizar diagnóstico →'}
          </button>
          <Link href="/mipanel" style={{ padding:12, border:`1.5px solid ${V.border}`, borderRadius:10, fontSize:13, fontWeight:700, color:V.ink3, textDecoration:'none', textAlign:'center', display:'block', background:V.surface }}>
            Volver al panel
          </Link>
        </div>
      </main>
    </div>
  )
}
