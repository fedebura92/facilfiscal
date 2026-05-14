'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Perfil {
  nombre: string
  provincia: string
  actividad: string
  tipo_contribuyente: string
  facturacion_estimada: number | null
  terminacion_cuit: string
}

interface Task {
  id: string
  label: string
  descripcion: string
  done: boolean
  done_at?: string | null
  bloqueada: boolean
  accion_href?: string
  accion_label?: string
}

const V = {
  tealDark:'#0d5c78', teal:'#1a7fa8', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
  gold:'#f5a623', goldLight:'#fff8ec',
  red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
  amber:'#d97706', amberBg:'#fffbeb', amberRing:'#fde68a',
  green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed', border2:'#c8d8e2',
  ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
}

const IVA_DIA: Record<string,number>  = { '0':18,'1':18,'2':19,'3':19,'4':20,'5':20,'6':21,'7':21,'8':22,'9':22 }
const AUT_DIA: Record<string,number>  = { '0':5,'1':5,'2':5,'3':5,'4':6,'5':6,'6':6,'7':7,'8':7,'9':7 }
const F931_DIA: Record<string,number> = { '0':9,'1':9,'2':9,'3':9,'4':10,'5':10,'6':10,'7':11,'8':11,'9':11 }

function getDias(dia: number) {
  const hoy = new Date()
  const v = new Date(hoy.getFullYear(), hoy.getMonth(), dia)
  if (v < hoy) v.setMonth(v.getMonth() + 1)
  return Math.ceil((v.getTime() - hoy.getTime()) / 86400000)
}

function fmtFecha(dia: number) {
  const hoy = new Date()
  const v = new Date(hoy.getFullYear(), hoy.getMonth(), dia)
  if (v < hoy) v.setMonth(v.getMonth() + 1)
  return v.toLocaleDateString('es-AR', { day:'numeric', month:'long' })
}

function buildTasks(p: Perfil | null, db: Record<string,{done:boolean;done_at:string|null}>): Task[] {
  const tasks: Task[] = [
    { id:'tipo',       label:'Elegir tu situación fiscal',         descripcion:'Monotributo, Responsable Inscripto o Autónomo.',                             done:!!p?.tipo_contribuyente,  bloqueada:true,  accion_href:'/mipanel/perfil', accion_label:'Completar perfil' },
    { id:'actividad',  label:'Indicar tu tipo de actividad',       descripcion:'Comercio, servicios, tecnología...',                                         done:!!p?.actividad,           bloqueada:true,  accion_href:'/mipanel/perfil', accion_label:'Completar perfil' },
    { id:'provincia',  label:'Indicar tu provincia',               descripcion:'Para calcular Ingresos Brutos y vencimientos provinciales.',                  done:!!p?.provincia,           bloqueada:true,  accion_href:'/mipanel/perfil', accion_label:'Completar perfil' },
    { id:'cuit',       label:'Cargar terminación de CUIT',         descripcion:'El último dígito de tu CUIT determina tus fechas exactas de vencimiento.',   done:!!p?.terminacion_cuit,    bloqueada:true,  accion_href:'/mipanel/perfil', accion_label:'Completar perfil' },
    { id:'facturacion',label:'Cargar facturación mensual estimada',descripcion:'Para verificar que tu categoría sea correcta.',                              done:!!p?.facturacion_estimada,bloqueada:true,  accion_href:'/mipanel/perfil', accion_label:'Completar perfil' },
    { id:'alertas',    label:'Activar alertas de vencimientos',    descripcion:'Recibí un email antes de cada vencimiento.',                                  done:db['alertas']?.done??false, done_at:db['alertas']?.done_at, bloqueada:false, accion_href:'/', accion_label:'Activar alertas' },
  ]
  if (p?.tipo_contribuyente === 'mono') {
    tasks.push({ id:'categoria', label:'Verificar tu categoría de monotributo', descripcion:'Revisá si la categoría actual es correcta.', done:db['categoria']?.done??false, done_at:db['categoria']?.done_at, bloqueada:false, accion_href:'/mi-categoria', accion_label:'Ir a la calculadora' })
  }
  return tasks
}

export default function MiPanel() {
  const [perfil, setPerfil]           = useState<Perfil|null>(null)
  const [userId, setUserId]           = useState<string|null>(null)
  const [tasks, setTasks]             = useState<Task[]>(buildTasks(null,{}))
  const [authChecked, setAuthChecked] = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [aiQuery, setAiQuery]         = useState('')
  const [aiLoading, setAiLoading]     = useState(false)
  const [aiHistory, setAiHistory]     = useState<{role:'user'|'assistant';text:string}[]>([])
  const aiEndRef = useRef<HTMLDivElement>(null)

  // Alertas inline
  const [alertasEmail, setAlertasEmail]       = useState('')
  const [alertasOk, setAlertasOk]             = useState(false)
  const [alertasError, setAlertasError]       = useState('')
  const [alertasLoading, setAlertasLoading]   = useState(false)
  const [showAlertasForm, setShowAlertasForm] = useState(false)

  // Noticias fiscales
  const [noticias, setNoticias]         = useState<{titulo:string;resumen:string;urgente:boolean}[]>([])
  const [noticiasLoading, setNoticiasLoading] = useState(false)
  const [noticiasLoaded, setNoticiasLoaded]   = useState(false)

  // Recordatorios
  const [recordatorioAnticipacion, setRecordatorioAnticipacion] = useState('3')
  const [recordatorioGuardado, setRecordatorioGuardado]         = useState(false)
  const [recordatorioLoading, setRecordatorioLoading]           = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { window.location.href='/login'; return }
      setUserId(user.id)

      // ── Lee de profiles (tabla correcta) ──────────────────────────────
      const { data: profileData } = await supabase
        .from('profiles')
        .select('nombre, provincia, actividad, tipo_contribuyente, facturacion_estimada, terminacion_cuit')
        .eq('id', user.id)
        .single()

      const p: Perfil = {
        nombre:               profileData?.nombre               || '',
        provincia:            profileData?.provincia            || '',
        actividad:            profileData?.actividad            || '',
        tipo_contribuyente:   profileData?.tipo_contribuyente   || '',
        facturacion_estimada: profileData?.facturacion_estimada || null,
        terminacion_cuit:     profileData?.terminacion_cuit     || '',
      }
      setPerfil(p)

      // ── Checklist ─────────────────────────────────────────────────────
      const { data: checklistData } = await supabase
        .from('user_checklist')
        .select('task_id, done, done_at')
        .eq('user_id', user.id)

      const db: Record<string,{done:boolean;done_at:string|null}> = {}
      for (const row of checklistData || []) db[row.task_id] = { done:row.done, done_at:row.done_at }

      setTasks(buildTasks(p, db))
      setAuthChecked(true)
    }
    load()
  }, [])

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [aiHistory, aiLoading])

  const toggleTask = async (taskId: string) => {
    if (!userId) return
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.bloqueada) return
    // Para alertas, abrir el form en vez de tildar directamente
    if (taskId === 'alertas' && !task.done) { setShowAlertasForm(true); return }
    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === taskId ? {...t, done:newDone} : t))
    await supabase.from('user_checklist').upsert({
      user_id: userId, task_id: taskId, done: newDone,
      done_at: newDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict:'user_id,task_id' })
  }

  const suscribirAlertas = async () => {
    if (!alertasEmail || !alertasEmail.includes('@')) { setAlertasError('Ingresá un email válido.'); return }
    setAlertasLoading(true); setAlertasError('')
    try {
      const tipo = perfil?.tipo_contribuyente || 'mono'
      const res = await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: alertasEmail, tipos: [tipo] }),
      })
      const data = await res.json()
      if (!res.ok) { setAlertasError(data.error || 'Error al suscribir.'); setAlertasLoading(false); return }

      // Marcar tarea como hecha
      setAlertasOk(true)
      setShowAlertasForm(false)
      setTasks(prev => prev.map(t => t.id === 'alertas' ? {...t, done:true} : t))
      if (userId) {
        await supabase.from('user_checklist').upsert({
          user_id: userId, task_id: 'alertas', done: true,
          done_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }, { onConflict:'user_id,task_id' })
      }
    } catch { setAlertasError('Error de conexión.') }
    finally { setAlertasLoading(false) }
  }

  const cargarNoticias = async () => {
    if (noticiasLoaded) return
    setNoticiasLoading(true)
    try {
      const tipo = perfil?.tipo_contribuyente || 'mono'
      const prov = perfil?.provincia || ''
      const r = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Dame 4 novedades fiscales recientes y relevantes para un ${tipo === 'mono' ? 'monotributista' : tipo === 'ri' ? 'responsable inscripto' : 'autónomo'} en Argentina${prov ? ` de la provincia de ${prov}` : ''}. Incluí cambios de ARCA/AFIP, nuevos topes, inflación, y alertas importantes del mes. Respondé SOLO con JSON sin backticks, formato: {"noticias":[{"titulo":"...","resumen":"...","urgente":true/false}]}`,
        }),
      })
      const d = await r.json()
      const texto = d.response || ''
      const parsed = JSON.parse(texto)
      setNoticias(parsed.noticias || [])
    } catch {
      setNoticias([
        { titulo: 'Revisión de topes de monotributo 2026', resumen: 'ARCA actualizó los límites de facturación para cada categoría. Verificá que tu categoría actual siga siendo correcta.', urgente: true },
        { titulo: 'Vencimientos de mayo confirmados', resumen: 'El calendario oficial de mayo 2026 ya está disponible en ARCA. IVA vence entre el 18 y 22 según terminación de CUIT.', urgente: false },
        { titulo: 'Percepciones de IIBB en CABA', resumen: 'AGIP actualizó las alícuotas de percepción para actividades de servicios. Revisá si tenés saldo a favor acumulado.', urgente: false },
      ])
    } finally {
      setNoticiasLoading(false)
      setNoticiasLoaded(true)
    }
  }

  const guardarRecordatorio = async () => {
    if (!userId) return
    setRecordatorioLoading(true)
    await supabase.from('user_checklist').upsert({
      user_id: userId,
      task_id: `recordatorio_anticipacion_${recordatorioAnticipacion}`,
      done: true,
      done_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,task_id' })
    setRecordatorioLoading(false)
    setRecordatorioGuardado(true)
    setTimeout(() => setRecordatorioGuardado(false), 2500)
  }

  const askAI = async (q?: string) => {
    const query = q || aiQuery
    if (!query.trim()) return
    setAiQuery('')
    setAiLoading(true)
    const newHistory = [...aiHistory, { role:'user' as const, text:query }]
    setAiHistory(newHistory)

    const tipoLabel = perfil?.tipo_contribuyente==='mono' ? 'Monotributista' : perfil?.tipo_contribuyente==='ri' ? 'Responsable Inscripto' : perfil?.tipo_contribuyente==='aut' ? 'Autónomo' : null
    const t = perfil?.terminacion_cuit || ''
    const perfilCtx = perfil?.tipo_contribuyente ? `
Perfil:
- Régimen: ${tipoLabel}
- Actividad: ${perfil.actividad || 'No definida'}
- Provincia: ${perfil.provincia || 'No definida'}
- Terminación CUIT: ${t || 'No definida'}
- Facturación estimada: ${perfil.facturacion_estimada ? `$${perfil.facturacion_estimada.toLocaleString('es-AR')}` : 'No definida'}
${t && perfil.tipo_contribuyente==='ri'  ? `- Vencimiento IVA: día ${IVA_DIA[t]}` : ''}
${t && perfil.tipo_contribuyente==='aut' ? `- Vencimiento autónomos: día ${AUT_DIA[t]}` : ''}
` : 'Sin perfil completado.'

    try {
      const r = await fetch('/api/fiscal', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ query, contexto:perfilCtx, historial:aiHistory.map(h=>({role:h.role,content:h.text})) }) })
      const d = await r.json()
      setAiHistory([...newHistory, { role:'assistant', text:d.response||'Sin respuesta.' }])
    } catch {
      setAiHistory([...newHistory, { role:'assistant', text:'Error de conexión.' }])
    } finally { setAiLoading(false) }
  }

  const perfilCompleto = !!(perfil?.tipo_contribuyente && perfil?.actividad && perfil?.provincia && perfil?.terminacion_cuit)
  const completedCount = tasks.filter(t=>t.done).length
  const totalCount     = tasks.length
  const progressPct    = Math.round((completedCount/totalCount)*100)
  const allDone        = completedCount === totalCount
  const tipoLabel      = perfil?.tipo_contribuyente==='mono' ? 'Monotributista' : perfil?.tipo_contribuyente==='ri' ? 'Responsable Inscripto' : perfil?.tipo_contribuyente==='aut' ? 'Autónomo' : null

  const vencimientos = useMemo(() => {
    if (!perfil?.terminacion_cuit) return []
    const t = perfil.terminacion_cuit
    const tipo = perfil.tipo_contribuyente
    const items: {titulo:string;dia:number}[] = []
    if (tipo==='mono') items.push({ titulo:'Monotributo — cuota mensual', dia:20 })
    if (tipo==='ri'||tipo==='aut') { const d=IVA_DIA[t]; if(d) items.push({ titulo:`IVA — DJ mensual (CUIT …${t})`, dia:d }) }
    if (tipo==='aut') { const d=AUT_DIA[t]; if(d) items.push({ titulo:`Autónomos — cuota mensual (CUIT …${t})`, dia:d }) }
    return items.sort((a,b)=>getDias(a.dia)-getDias(b.dia))
  }, [perfil])

  // ── Score fiscal ────────────────────────────────────────────────────────
  const scoreItems = useMemo(() => {
    if (!perfil) return []
    const items: { texto: string; nivel: 'ok' | 'warn' | 'danger'; detalle?: string }[] = []
    const tipo = perfil.tipo_contribuyente
    const t    = perfil.terminacion_cuit

    // Perfil completo
    if (perfilCompleto) items.push({ texto: 'Perfil completo', nivel: 'ok' })
    else items.push({ texto: 'Perfil incompleto', nivel: 'warn', detalle: 'Completá tu perfil para ver alertas personalizadas.' })

    // Facturación vs límite de categoría
    if (perfil.facturacion_estimada && tipo === 'mono') {
      const anual = perfil.facturacion_estimada * 12
      // Límites 2026 aproximados por categoría (A=2.700.000 ... K=68.000.000)
      const LIMITES = [2700000,4050000,5400000,6750000,9450000,13500000,19600000,24500000,29500000,35000000,68000000]
      const limiteH = LIMITES[LIMITES.length - 1]
      const pct = Math.round((anual / limiteH) * 100)
      // Buscar qué categoría le toca
      const catIdx = LIMITES.findIndex(l => anual <= l)
      const limiteActual = catIdx >= 0 ? LIMITES[catIdx] : limiteH
      const pctCat = Math.round((anual / limiteActual) * 100)
      if (pctCat >= 90) items.push({ texto: `Facturación al ${pctCat}% del límite de tu categoría`, nivel: 'danger', detalle: 'Estás muy cerca del tope. Si lo superás, debés recategorizarte o pasarte a RI.' })
      else if (pctCat >= 75) items.push({ texto: `Facturación al ${pctCat}% del límite de tu categoría`, nivel: 'warn', detalle: 'Empezá a planificar si es necesario recategorizarte.' })
      else items.push({ texto: 'Facturación dentro del límite de categoría', nivel: 'ok' })
    }

    // Vencimientos próximos
    if (t) {
      const vencCheck = []
      if (tipo === 'mono') vencCheck.push({ nombre: 'Monotributo', dia: 20 })
      if (tipo === 'ri' || tipo === 'aut') vencCheck.push({ nombre: 'IVA', dia: IVA_DIA[t] })
      if (tipo === 'aut') vencCheck.push({ nombre: 'Autónomos', dia: AUT_DIA[t] })
      for (const v of vencCheck) {
        const dias = getDias(v.dia)
        if (dias === 0) items.push({ texto: `${v.nombre} vence HOY`, nivel: 'danger', detalle: '¡Pagá ahora para evitar recargos!' })
        else if (dias <= 3) items.push({ texto: `${v.nombre} vence en ${dias} día${dias !== 1 ? 's' : ''}`, nivel: 'danger', detalle: 'Muy próximo. Generá el VEP y pagá.' })
        else if (dias <= 7) items.push({ texto: `${v.nombre} vence en ${dias} días`, nivel: 'warn', detalle: 'Tenés tiempo, pero no lo dejes para último momento.' })
        else items.push({ texto: `${v.nombre} al día`, nivel: 'ok' })
      }
    }

    // Recategorización
    const mes = new Date().getMonth() + 1
    if (tipo === 'mono') {
      if ([3, 7, 11].includes(mes)) items.push({ texto: 'Mes de recategorización', nivel: 'warn', detalle: 'Este mes debés revisar si tu categoría sigue siendo correcta.' })
      else items.push({ texto: 'Recategorización al día', nivel: 'ok' })
    }

    // Alertas faltantes
    const alertaTask = tasks.find(t => t.id === 'alertas')
    if (!alertaTask?.done) items.push({ texto: 'Alertas de vencimiento no activadas', nivel: 'warn', detalle: 'Activá las alertas para recibir avisos antes de cada vencimiento.' })
    else items.push({ texto: 'Alertas de vencimiento activas', nivel: 'ok' })

    return items
  }, [perfil, perfilCompleto, tasks, vencimientos])

  const score = useMemo(() => {
    if (scoreItems.length === 0) return 0
    const puntos = scoreItems.reduce((acc, item) => {
      if (item.nivel === 'ok')     return acc + 10
      if (item.nivel === 'warn')   return acc + 5
      if (item.nivel === 'danger') return acc + 0
      return acc
    }, 0)
    return Math.round((puntos / (scoreItems.length * 10)) * 100)
  }, [scoreItems])

  const scoreColor = score >= 80 ? V.green : score >= 50 ? V.amber : V.red
  const scoreLabel = score >= 80 ? 'Bueno' : score >= 50 ? 'Regular' : 'Atención'

  // ── Timeline / Qué hacer hoy ─────────────────────────────────────────────
  type TimelineItem = {
  texto: string
  dias: number
}

type TimelineItems = {
  hoy: string[]
  pronto: TimelineItem[]
  semana: TimelineItem[]
}

const timelineItems = useMemo<TimelineItems>(() => {
  if (!perfil?.terminacion_cuit) {
    return {
      hoy: [],
      pronto: [],
      semana: [],
    }
  }
    const t    = perfil.terminacion_cuit
    const tipo = perfil.tipo_contribuyente
    const hoy: string[]   = []
    const pronto: { texto: string; dias: number }[] = []
    const semana: { texto: string; dias: number }[] = []

    const checks = []
    if (tipo === 'mono') checks.push({ nombre: 'Pagar monotributo', dia: 20 })
    if (tipo === 'ri' || tipo === 'aut') checks.push({ nombre: 'Presentar y pagar IVA', dia: IVA_DIA[t] })
    if (tipo === 'aut') checks.push({ nombre: 'Pagar aportes autónomos', dia: AUT_DIA[t] })

    for (const c of checks) {
      const dias = getDias(c.dia)
      if (dias === 0) hoy.push(c.nombre)
      else if (dias <= 2) pronto.push({ texto: c.nombre, dias })
      else if (dias <= 7) semana.push({ texto: c.nombre, dias })
    }

    const mes = new Date().getMonth() + 1
    if ([3, 7, 11].includes(mes) && tipo === 'mono') {
      hoy.push('Revisar recategorización de monotributo')
    }

    return { hoy, pronto, semana }
  }, [perfil])

  const sugerencias = perfilCompleto ? [
    `¿Cuánto pago de ${tipoLabel?.toLowerCase()} este mes?`,
    `¿Cuándo vencen mis obligaciones con CUIT terminado en ${perfil?.terminacion_cuit}?`,
    `¿Qué impuestos pago en ${perfil?.provincia}?`,
    `¿Cuándo me tengo que recategorizar?`,
  ] : [
    '¿Qué es el monotributo?',
    '¿Cuándo vence el monotributo?',
    '¿Diferencia entre monotributo y responsable inscripto?',
  ]

  if (!authChecked) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", color:V.ink3 }}>Cargando...</div>
  )

  return (
    <div style={{ minHeight:'100vh', background:V.bg, fontFamily:"'Nunito',sans-serif", color:V.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Topbar */}
      <header style={{ position:'sticky', top:0, zIndex:100, background:V.surface, borderBottom:`1px solid ${V.border}`, boxShadow:'0 1px 4px rgba(13,92,120,.07)', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height:44, width:'auto' }} />
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {perfil?.nombre && <span style={{ fontSize:13, color:V.ink3, fontWeight:600 }}>Hola, {perfil.nombre} 👋</span>}
          <div style={{ position:'relative' }}>
            <button onClick={() => setMenuOpen(v=>!v)} style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${V.teal},${V.gold})`, border:'none', cursor:'pointer', color:'#fff', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {perfil?.nombre?.[0]?.toUpperCase()||'?'}
            </button>
            {menuOpen && (
              <div style={{ position:'absolute', top:44, right:0, background:V.surface, border:`1px solid ${V.border}`, borderRadius:12, boxShadow:'0 8px 24px rgba(13,92,120,.12)', minWidth:160, overflow:'hidden', zIndex:200 }}>
                <Link href="/mipanel/perfil" onClick={()=>setMenuOpen(false)} style={{ display:'block', padding:'11px 16px', fontSize:13, fontWeight:700, color:V.ink, textDecoration:'none' }}>⚙️ Mi perfil</Link>
                <button onClick={async()=>{ setMenuOpen(false); await supabase.auth.signOut(); window.location.href='/login' }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 16px', fontSize:13, fontWeight:700, color:V.red, background:'none', border:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>→ Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'28px 20px 80px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* ── Banner perfil ── */}
        <div style={{ background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, borderRadius:20, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', color:'#fff' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.18)', borderRadius:999, padding:'4px 12px', fontSize:11, fontWeight:800, letterSpacing:'.05em', textTransform:'uppercase', marginBottom:10 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:perfilCompleto?'#4ade80':V.gold, display:'inline-block' }} />
              {perfilCompleto ? 'Perfil completo' : 'En preparación'}
            </div>
            <div style={{ fontSize:20, fontWeight:900, marginBottom:6 }}>
              {perfilCompleto ? `Tu panel fiscal · ${tipoLabel}` : 'Completá tu perfil para personalizar tu panel'}
            </div>
            <div style={{ fontSize:13, opacity:.8, maxWidth:380, lineHeight:1.6 }}>
              {perfilCompleto
                ? `${perfil?.actividad} · ${perfil?.provincia} · CUIT …${perfil?.terminacion_cuit}${perfil?.facturacion_estimada ? ` · $${(perfil.facturacion_estimada/1000).toFixed(0)}K/mes` : ''}`
                : 'Vencimientos exactos, checklist y alertas personalizadas.'}
            </div>
          </div>
          <Link href="/mipanel/perfil" style={{ background:'#fff', color:V.tealDark, borderRadius:10, padding:'11px 20px', fontSize:13, fontWeight:900, textDecoration:'none', whiteSpace:'nowrap', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}>
            {perfilCompleto ? 'Editar perfil' : 'Completar perfil →'}
          </Link>
        </div>

        {/* ── QUÉ HACER HOY ── */}
        {perfilCompleto && (timelineItems.hoy.length > 0 || timelineItems.pronto.length > 0 || timelineItems.semana.length > 0) && (
          <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
            <div style={{ background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, padding:'12px 18px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>📌</span>
              <span style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Qué tenés que hacer</span>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
              {timelineItems.hoy.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:V.red, marginBottom:8 }}>🔴 Hoy</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {timelineItems.hoy.map((t,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:V.redBg, border:`1px solid ${V.redRing}`, borderRadius:10 }}>
                        <span style={{ fontSize:16 }}>⚠️</span>
                        <span style={{ fontSize:13, fontWeight:700, color:V.red }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {timelineItems.pronto.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:V.amber, marginBottom:8 }}>🟡 En los próximos días</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {timelineItems.pronto.map((t,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:V.amberBg, border:`1px solid ${V.amberRing}`, borderRadius:10 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:V.amber }}>{t.texto}</span>
                        <span style={{ fontSize:11, fontWeight:800, color:V.amber }}>en {t.dias} día{t.dias!==1?'s':''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {timelineItems.semana.length > 0 && (
                <div>
                  <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.1em', color:V.teal, marginBottom:8 }}>🟢 Esta semana</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {timelineItems.semana.map((t,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:V.tealLight, border:`1px solid ${V.tealRing}`, borderRadius:10 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:V.tealDark }}>{t.texto}</span>
                        <span style={{ fontSize:11, fontWeight:800, color:V.teal }}>en {t.dias} días</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SCORE FISCAL ── */}
        {perfilCompleto && (
          <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:4 }}>🎯 Score fiscal</div>
                <div style={{ fontSize:12, color:V.ink3, fontWeight:600 }}>Resumen de tu situación impositiva</div>
              </div>
              {/* Número grande */}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:48, fontWeight:900, color:scoreColor, lineHeight:1 }}>{score}</div>
                <div style={{ fontSize:11, fontWeight:700, color:scoreColor, textTransform:'uppercase', letterSpacing:'.05em' }}>{scoreLabel}</div>
              </div>
            </div>

            {/* Barra de score */}
            <div style={{ height:10, background:V.border, borderRadius:999, marginBottom:20, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:999, width:`${score}%`, transition:'width .6s ease',
                background: score >= 80
                  ? `linear-gradient(90deg, ${V.green}, #4ade80)`
                  : score >= 50
                  ? `linear-gradient(90deg, ${V.amber}, #fbbf24)`
                  : `linear-gradient(90deg, ${V.red}, #f87171)`,
              }} />
            </div>

            {/* Items */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {scoreItems.map((item, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:10,
                  padding:'10px 14px', borderRadius:10,
                  background: item.nivel==='ok' ? V.greenBg : item.nivel==='warn' ? V.amberBg : V.redBg,
                  border: `1px solid ${item.nivel==='ok' ? V.greenRing : item.nivel==='warn' ? V.amberRing : V.redRing}`,
                }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>
                    {item.nivel==='ok' ? '✅' : item.nivel==='warn' ? '⚠️' : '🔴'}
                  </span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color: item.nivel==='ok' ? V.green : item.nivel==='warn' ? V.amber : V.red }}>
                      {item.texto}
                    </div>
                    {item.detalle && (
                      <div style={{ fontSize:11, fontWeight:600, color:V.ink3, marginTop:2, lineHeight:1.5 }}>{item.detalle}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHECKLIST ── */}
        <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>✅ Lo que tenés que hacer</div>
            <span style={{ fontSize:12, fontWeight:600, color:V.ink3 }}>{completedCount}/{totalCount} completadas</span>
          </div>
          <div style={{ height:6, background:V.border, borderRadius:999, marginBottom:18, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:999, background:`linear-gradient(90deg,${V.teal},${V.gold})`, width:`${progressPct}%`, transition:'width .4s ease' }} />
          </div>
          {allDone ? (
            <div style={{ background:V.greenBg, border:`1px solid ${V.greenRing}`, borderRadius:10, padding:'13px 16px', fontSize:13, fontWeight:700, color:V.green }}>🎉 ¡Todo listo! Tu panel está completamente configurado.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {tasks.map(task => (
                <div key={task.id} style={{ border:`1.5px solid ${task.done ? V.tealRing : V.border}`, borderRadius:12, overflow:'hidden', background:task.done ? V.tealLight : V.surface }}>
                  <div onClick={() => !task.bloqueada && toggleTask(task.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', cursor:task.bloqueada&&!task.done?'default':'pointer' }}>
                    <div style={{ width:22, height:22, borderRadius:7, flexShrink:0, border:`2px solid ${task.done?V.teal:task.bloqueada?V.border:V.border2}`, background:task.done?V.teal:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {task.done && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {!task.done && task.bloqueada && <span style={{ fontSize:10 }}>🔒</span>}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:task.done?V.tealDark:V.ink, textDecoration:task.done?'line-through':'none' }}>{task.label}</div>
                      {!task.done && <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>{task.descripcion}</div>}
                    </div>
                    {task.done && <span style={{ fontSize:11, color:V.teal, fontWeight:700, flexShrink:0 }}>✓ Listo</span>}
                  </div>
                  {!task.done && (
                    <>
                      {/* Form inline para alertas */}
                      {task.id === 'alertas' && showAlertasForm && (
                        <div style={{ borderTop:`1px solid ${V.border}`, padding:'14px 16px', background:V.bg, display:'flex', flexDirection:'column', gap:10 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:V.ink2 }}>📧 Tu email para recibir alertas</div>
                          <div style={{ display:'flex', gap:8 }}>
                            <input
                              type="email"
                              placeholder="tu@email.com"
                              value={alertasEmail}
                              onChange={e => { setAlertasEmail(e.target.value); setAlertasError('') }}
                              onKeyDown={e => e.key==='Enter' && suscribirAlertas()}
                              style={{ flex:1, border:`1.5px solid ${V.border}`, borderRadius:8, padding:'8px 12px', fontSize:13, fontWeight:600, color:V.ink, background:V.surface, outline:'none', fontFamily:"'Nunito',sans-serif" }}
                            />
                            <button onClick={suscribirAlertas} disabled={alertasLoading} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:13, fontWeight:800, cursor:alertasLoading?'not-allowed':'pointer', opacity:alertasLoading?.6:1, fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' }}>
                              {alertasLoading ? '...' : 'Activar →'}
                            </button>
                          </div>
                          {alertasError && <div style={{ fontSize:12, color:V.red, fontWeight:600 }}>⚠️ {alertasError}</div>}
                          <button onClick={() => setShowAlertasForm(false)} style={{ fontSize:11, color:V.ink3, background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:"'Nunito',sans-serif" }}>Cancelar</button>
                        </div>
                      )}
                      {/* Acción normal para otras tareas o alertas sin form abierto */}
                      {!(task.id === 'alertas' && showAlertasForm) && task.accion_href && (
                        <div style={{ borderTop:`1px solid ${V.border}`, padding:'9px 16px', background:V.bg, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span style={{ fontSize:11, color:V.ink3, fontWeight:600 }}>{task.bloqueada ? '🔒 Completá esta info en tu perfil' : 'Pendiente'}</span>
                          {task.id === 'alertas' ? (
                            <button onClick={() => setShowAlertasForm(true)} style={{ fontSize:12, fontWeight:800, color:V.teal, background:'none', border:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
                              Activar alertas →
                            </button>
                          ) : (
                            <Link href={task.accion_href} style={{ fontSize:12, fontWeight:800, color:V.teal, textDecoration:'none', whiteSpace:'nowrap' }}>{task.accion_label} →</Link>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Vencimientos personalizados ── */}
        <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:16 }}>📅 Tus próximos vencimientos</div>
          {!perfilCompleto ? (
            <div style={{ textAlign:'center', padding:'16px 0 8px' }}>
              <span style={{ fontSize:32, opacity:.25 }}>🔒</span>
              <p style={{ fontSize:13, fontWeight:600, color:V.ink3, maxWidth:280, lineHeight:1.6, margin:'8px auto 12px' }}>Completá tu perfil con la terminación de CUIT para ver tus fechas exactas.</p>
              <Link href="/mipanel/perfil" style={{ fontSize:13, fontWeight:800, color:V.teal, textDecoration:'none' }}>Completar perfil →</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {vencimientos.map((v,i) => {
                const dias = getDias(v.dia)
                const urgente = dias <= 5
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', border:`1.5px solid ${urgente?'#fca5a5':V.border}`, borderRadius:10, background:urgente?V.redBg:V.surface }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:V.ink }}>{v.titulo}</div>
                      <div style={{ fontSize:12, color:V.ink3, fontWeight:600, marginTop:2 }}>{fmtFecha(v.dia)}</div>
                    </div>
                    <div style={{ fontSize:12, fontWeight:800, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap', background:urgente?V.redBg:V.tealLight, color:urgente?V.red:V.teal, border:`1px solid ${urgente?'#fca5a5':V.tealRing}` }}>
                      {dias===0?'¡Hoy!':dias===1?'Mañana':`En ${dias} días`}
                    </div>
                  </div>
                )
              })}
              <Link href="/calendario-fiscal" style={{ fontSize:13, fontWeight:800, color:V.teal, textDecoration:'none', marginTop:4, display:'block' }}>Ver calendario completo 2026 →</Link>
            </div>
          )}
        </div>

        {/* ── Asistente IA ── */}
        <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ background:'#0a0a1a', padding:'12px 18px', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#4caf50', boxShadow:'0 0 0 3px rgba(76,175,80,.2)' }} />
            <span style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:'1.2px', textTransform:'uppercase' }}>Asistente fiscal IA</span>
            {perfilCompleto && tipoLabel && <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,.4)', fontWeight:600 }}>{tipoLabel} · CUIT …{perfil?.terminacion_cuit}</span>}
          </div>

          <div style={{ padding:'16px 18px', maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
            {aiHistory.length===0 && (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🤖</div>
                <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0, lineHeight:1.6 }}>
                  {perfilCompleto
                    ? `Hola${perfil?.nombre ? ` ${perfil.nombre}` : ''}! Ya tengo tu perfil. Preguntame sobre tu situación fiscal.`
                    : 'Hola! Soy tu asistente fiscal. Preguntame sobre impuestos y trámites en Argentina.'}
                </p>
              </div>
            )}
            {aiHistory.map((msg,i) => (
              <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start' }}>
                <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:msg.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background:msg.role==='user'?V.teal:V.bg, color:msg.role==='user'?'#fff':V.ink2, fontSize:13, fontWeight:600, lineHeight:1.7, whiteSpace:'pre-wrap', border:msg.role==='assistant'?`1px solid ${V.border}`:'none' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && <div style={{ display:'flex', justifyContent:'flex-start' }}><div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background:V.bg, border:`1px solid ${V.border}`, fontSize:13, color:V.ink3, fontWeight:600 }}>Consultando...</div></div>}
            <div ref={aiEndRef} />
          </div>

          {aiHistory.length===0 && (
            <div style={{ padding:'0 18px 12px', display:'flex', flexWrap:'wrap', gap:6 }}>
              {sugerencias.map(s => (
                <button key={s} onClick={()=>askAI(s)} style={{ background:V.bg, border:`1px solid ${V.border}`, borderRadius:20, padding:'5px 12px', fontSize:11, fontWeight:700, color:V.ink3, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>{s}</button>
              ))}
            </div>
          )}

          <div style={{ padding:'12px 18px', borderTop:`1px solid ${V.border}`, display:'flex', gap:8 }}>
            <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&askAI()} placeholder="Preguntame sobre tu situación fiscal..." style={{ flex:1, border:`1.5px solid ${V.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, fontWeight:600, color:V.ink, background:V.bg, outline:'none', fontFamily:"'Nunito',sans-serif" }} />
            <button onClick={()=>askAI()} disabled={aiLoading||!aiQuery.trim()} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:800, cursor:aiLoading||!aiQuery.trim()?'not-allowed':'pointer', opacity:aiLoading||!aiQuery.trim()?.5:1, fontFamily:"'Nunito',sans-serif" }}>Enviar →</button>
          </div>
        </div>

        {/* ── NOTICIAS FISCALES ── */}
        <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${V.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>📰 Novedades fiscales</div>
              <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>
                {perfilCompleto ? `Actualizadas para ${tipoLabel}${perfil?.provincia ? ` · ${perfil.provincia}` : ''}` : 'Noticias generales de ARCA/AFIP'}
              </div>
            </div>
            {!noticiasLoaded && (
              <button
                onClick={cargarNoticias}
                disabled={noticiasLoading}
                style={{ background:V.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:800, cursor:noticiasLoading?'not-allowed':'pointer', opacity:noticiasLoading?.6:1, fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' }}
              >
                {noticiasLoading ? 'Cargando...' : 'Ver novedades →'}
              </button>
            )}
          </div>

          {!noticiasLoaded && !noticiasLoading && (
            <div style={{ padding:'24px 20px', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📡</div>
              <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0 }}>
                Hacé clic en "Ver novedades" para cargar las últimas noticias fiscales personalizadas para tu perfil.
              </p>
            </div>
          )}

          {noticiasLoading && (
            <div style={{ padding:'24px 20px', textAlign:'center', color:V.ink3, fontSize:13, fontWeight:600 }}>
              Consultando novedades de ARCA...
            </div>
          )}

          {noticiasLoaded && noticias.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column' }}>
              {noticias.map((n, i) => (
                <div key={i} style={{
                  padding:'14px 20px',
                  borderBottom: i < noticias.length - 1 ? `1px solid ${V.border}` : 'none',
                  display:'flex', gap:12, alignItems:'flex-start',
                }}>
                  <div style={{
                    width:32, height:32, borderRadius:8, flexShrink:0,
                    background: n.urgente ? V.redBg : V.tealLight,
                    border: `1px solid ${n.urgente ? V.redRing : V.tealRing}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:14,
                  }}>
                    {n.urgente ? '🚨' : '📋'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color: n.urgente ? V.red : V.ink, marginBottom:3 }}>{n.titulo}</div>
                    <div style={{ fontSize:12, color:V.ink3, fontWeight:600, lineHeight:1.6 }}>{n.resumen}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding:'12px 20px', borderTop:`1px solid ${V.border}`, background:V.bg }}>
                <button
                  onClick={() => { setNoticiasLoaded(false); setNoticias([]); cargarNoticias() }}
                  style={{ fontSize:12, fontWeight:700, color:V.teal, background:'none', border:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}
                >
                  ↻ Actualizar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RECORDATORIOS AUTOMÁTICOS ── */}
        <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:4 }}>⏰ Recordatorios automáticos</div>
          <div style={{ fontSize:12, color:V.ink3, fontWeight:600, marginBottom:20, lineHeight:1.6 }}>
            Configurá con cuántos días de anticipación querés recibir el aviso de cada vencimiento por email.
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Anticipación */}
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:V.ink2, marginBottom:10 }}>Avisame con cuántos días de anticipación</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {[
                  { value:'1', label:'1 día antes' },
                  { value:'3', label:'3 días antes' },
                  { value:'5', label:'5 días antes' },
                  { value:'7', label:'1 semana antes' },
                ].map(op => (
                  <button
                    key={op.value}
                    onClick={() => setRecordatorioAnticipacion(op.value)}
                    style={{
                      padding:'9px 16px', borderRadius:10, border:`2px solid ${recordatorioAnticipacion === op.value ? V.teal : V.border}`,
                      background: recordatorioAnticipacion === op.value ? V.tealLight : V.surface,
                      color: recordatorioAnticipacion === op.value ? V.tealDark : V.ink3,
                      fontSize:13, fontWeight:700, cursor:'pointer',
                      fontFamily:"'Nunito',sans-serif",
                    }}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Qué vencimientos recibir */}
            <div style={{ background:V.bg, borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:V.ink2, marginBottom:8 }}>Vas a recibir alertas de:</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {perfil?.tipo_contribuyente === 'mono' && (
                  <div style={{ fontSize:12, fontWeight:600, color:V.ink3, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ color:V.green }}>✓</span> Monotributo (día 20 de cada mes)
                  </div>
                )}
                {(perfil?.tipo_contribuyente === 'ri' || perfil?.tipo_contribuyente === 'aut') && perfil?.terminacion_cuit && (
                  <div style={{ fontSize:12, fontWeight:600, color:V.ink3, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ color:V.green }}>✓</span> IVA (día {IVA_DIA[perfil.terminacion_cuit]} · CUIT …{perfil.terminacion_cuit})
                  </div>
                )}
                {perfil?.tipo_contribuyente === 'aut' && perfil?.terminacion_cuit && (
                  <div style={{ fontSize:12, fontWeight:600, color:V.ink3, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ color:V.green }}>✓</span> Autónomos (día {AUT_DIA[perfil.terminacion_cuit]} · CUIT …{perfil.terminacion_cuit})
                  </div>
                )}
                {perfil?.tipo_contribuyente === 'mono' && (
                  <div style={{ fontSize:12, fontWeight:600, color:V.ink3, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ color:V.green }}>✓</span> Recategorización (enero, mayo y septiembre)
                  </div>
                )}
                {!perfilCompleto && (
                  <div style={{ fontSize:12, fontWeight:600, color:V.amber }}>
                    ⚠️ Completá tu perfil para personalizar los recordatorios.
                  </div>
                )}
              </div>
            </div>

            {/* Botón guardar */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button
                onClick={guardarRecordatorio}
                disabled={recordatorioLoading || !tasks.find(t=>t.id==='alertas')?.done}
                style={{
                  background: tasks.find(t=>t.id==='alertas')?.done ? `linear-gradient(135deg,${V.tealDark},${V.teal})` : V.border,
                  color: tasks.find(t=>t.id==='alertas')?.done ? '#fff' : V.ink3,
                  border:'none', borderRadius:10, padding:'11px 20px',
                  fontSize:13, fontWeight:800,
                  cursor: tasks.find(t=>t.id==='alertas')?.done && !recordatorioLoading ? 'pointer' : 'not-allowed',
                  fontFamily:"'Nunito',sans-serif",
                  opacity: recordatorioLoading ? .6 : 1,
                }}
              >
                {recordatorioLoading ? 'Guardando...' : 'Guardar preferencia'}
              </button>
              {!tasks.find(t=>t.id==='alertas')?.done && (
                <span style={{ fontSize:12, color:V.ink3, fontWeight:600 }}>
                  🔒 Primero activá las alertas en el checklist
                </span>
              )}
              {recordatorioGuardado && (
                <span style={{ fontSize:12, color:V.green, fontWeight:700 }}>✓ Guardado</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Accesos rápidos ── */}
        <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:24 }}>
          <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:16 }}>💡 Accesos rápidos</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { icon:'📊', label:'Mi categoría',      href:'/mi-categoria' },
              { icon:'📄', label:'Cómo facturar',     href:'/como-facturar' },
              { icon:'📅', label:'Calendario fiscal',  href:'/calendario-fiscal' },
              { icon:'🗺️', label:'Por provincia',      href:'/impuestos-por-provincia' },
            ].map(c => (
              <Link key={c.label} href={c.href} style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 16px', border:`1.5px solid ${V.border}`, borderRadius:10, textDecoration:'none', color:V.ink, fontSize:13, fontWeight:700 }}>
                <span style={{ fontSize:18 }}>{c.icon}</span>{c.label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
