'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CATEGORIAS_MONO } from '@/lib/data'
import { calcularDiagnostico, calcularCompletitud, type Obligacion } from '@/lib/reglas-fiscales'
import type { PerfilFiscal, NegocioProyecto } from '@/lib/types'

// Cómo llegamos a cada obligación — ver lib/reglas-fiscales.ts
const CONFIANZA_LABEL: Record<string, string> = {
  confirmado: 'Confirmado',
  inferido: 'Inferido',
  heredado: 'Heredado',
  por_confirmar: 'Por confirmar',
}

// Fuente única de límites de categoría (lib/data.ts) — antes había 4 copias
// hardcodeadas y desactualizadas de este mismo array en este archivo.
const LIMITES_MONO = CATEGORIAS_MONO.map(c => c.limite_anual)
const CATS_MONO    = CATEGORIAS_MONO.map(c => c.letra)

// Perfil = alias de PerfilFiscal (Mi Perfil v2). Se mantiene el nombre local
// para no tocar cada referencia de "Perfil" en este archivo.
type Perfil = PerfilFiscal

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

// ── Widget resumen del panel financiero ──────────────────────────────────────
function WidgetFinanciero({ userId, perfil, negocios }: { userId: string|null; perfil: any; negocios: NegocioProyecto[] }) {
  const [data, setData] = useState<{ totalAnio:number; disponible:number; porCobrar:number; pct:number; cat:string } | null>(null)
  const [porEntidad, setPorEntidad] = useState<{ etiqueta:string; totalAnio:number; cat:string; pct:number }[]>([])
  const anio = new Date().getFullYear()

  // Fuente única (lib/data.ts) — antes había otra copia hardcodeada y
  // desactualizada de este mismo array acá adentro.
  const LIMITES = LIMITES_MONO
  const CATS    = CATS_MONO

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      // Entidades a considerar: "Personal" (siempre) + cada negocio propio
      // (no los que marcaste como empleado — esa facturación no es tuya).
      const entidades: { etiqueta:string; negocioId: string|null; tipo: string|undefined }[] = [
        { etiqueta:'Personal', negocioId:null, tipo: perfil?.tipo_contribuyente },
        ...negocios.filter(n => n.datos?.relacion !== 'empleado').map(n => ({
          etiqueta: n.nombre || n.datos?.actividad || 'Negocio',
          negocioId: n.id,
          tipo: n.datos?.situacion_fiscal === 'mono' ? 'mono' : n.datos?.situacion_fiscal === 'ri' ? 'ri' : undefined,
        })),
      ]

      const resultados = await Promise.all(entidades.map(async (e) => {
        let qIngresos = supabase.from('ingresos_mensuales').select('monto').eq('user_id', userId).eq('anio', anio)
        qIngresos = e.negocioId ? qIngresos.eq('negocio_id', e.negocioId) : qIngresos.is('negocio_id', null)
        let qFacturas = supabase.from('facturas').select('monto, estado').eq('user_id', userId).eq('estado', 'pendiente')
        qFacturas = e.negocioId ? qFacturas.eq('negocio_id', e.negocioId) : qFacturas.is('negocio_id', null)

        const [{ data: ingresos }, { data: facturas }] = await Promise.all([qIngresos, qFacturas])
        const totalAnio = (ingresos || []).reduce((a: number, r: any) => a + r.monto, 0)
        const porCobrar = (facturas || []).reduce((a: number, r: any) => a + r.monto, 0)
        const catIdx = LIMITES.findIndex(l => (totalAnio * (12 / Math.max(new Date().getMonth()+1,1))) <= l)
        const limite = catIdx >= 0 ? LIMITES[catIdx] : LIMITES[LIMITES.length-1]
        const pct = Math.min(Math.round((totalAnio / limite) * 100), 100)
        const disponible = Math.max(0, limite - totalAnio)
        const cat = catIdx >= 0 ? CATS[catIdx] : 'K'
        return { etiqueta: e.etiqueta, tipo: e.tipo, totalAnio, disponible, porCobrar, pct, cat }
      }))

      // KPIs de arriba: total combinado entre todas las entidades
      const totalAnio  = resultados.reduce((a, r) => a + r.totalAnio, 0)
      const porCobrar   = resultados.reduce((a, r) => a + r.porCobrar, 0)
      // "Disponible" y "%" solo tienen sentido para Monotributo — se muestra
      // el de la primera entidad monotributista que tenga datos, si hay.
      const monoConDatos = resultados.find(r => r.tipo === 'mono' && r.totalAnio > 0) || resultados.find(r => r.tipo === 'mono')
      setData({
        totalAnio, porCobrar,
        disponible: monoConDatos?.disponible ?? 0,
        pct: monoConDatos?.pct ?? 0,
        cat: monoConDatos?.cat ?? 'A',
      })
      // Desglose: solo entidades con algo cargado, para no mostrar filas vacías
      setPorEntidad(resultados.filter(r => r.totalAnio > 0 || r.porCobrar > 0).map(r => ({ etiqueta:r.etiqueta, totalAnio:r.totalAnio, cat:r.cat, pct:r.pct })))
    }
    load()
  }, [userId, anio, negocios])

  const pctColor = data ? (data.pct >= 90 ? V.red : data.pct >= 75 ? V.amber : V.green) : V.teal

  return (
    <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${V.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>💼 Panel financiero</div>
        <Link href="/mipanel/financiero" style={{ fontSize:12, fontWeight:700, color:V.teal, textDecoration:'none' }}>Ver completo →</Link>
      </div>
      {!data ? (
        <div style={{ padding:'20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {[0,1,2].map(i => <div key={i} style={{ height:64, background:V.bg, borderRadius:10, animation:'pulse 1.5s infinite' }} />)}
        </div>
      ) : (
        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Facturado en el año (combinado)', valor: data.totalAnio >= 1000000 ? `$${(data.totalAnio/1000000).toFixed(1)}M` : `$${Math.round(data.totalAnio/1000)}K`, color:V.tealDark },
              { label:'Disponible cat. '+data.cat, valor: data.disponible >= 1000000 ? `$${(data.disponible/1000000).toFixed(1)}M` : `$${Math.round(data.disponible/1000)}K`, color:pctColor },
              { label:'Por cobrar', valor: data.porCobrar > 0 ? (data.porCobrar >= 1000000 ? `$${(data.porCobrar/1000000).toFixed(1)}M` : `$${Math.round(data.porCobrar/1000)}K`) : '—', color: data.porCobrar > 0 ? V.amber : V.ink3 },
            ].map((k,i) => (
              <div key={i} style={{ background:V.bg, borderRadius:10, padding:'12px 14px', border:`1px solid ${V.border}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:V.ink3, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:5, lineHeight:1.3 }}>{k.label}</div>
                <div style={{ fontSize:18, fontWeight:900, color:k.color }}>{k.valor}</div>
              </div>
            ))}
          </div>

          {porEntidad.length > 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontSize:10, fontWeight:700, color:V.ink3, textTransform:'uppercase', letterSpacing:'.04em' }}>Por negocio</div>
              {porEntidad.map((e,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:V.bg, borderRadius:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:V.ink }}>{e.etiqueta}</span>
                  <span style={{ fontSize:12, fontWeight:800, color:V.ink2 }}>{e.totalAnio >= 1000000 ? `$${(e.totalAnio/1000000).toFixed(1)}M` : `$${Math.round(e.totalAnio/1000)}K`}</span>
                </div>
              ))}
            </div>
          )}

          {/* Barra de progreso */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:600, color:V.ink3, marginBottom:5 }}>
              <span>Progreso en categoría {data.cat}</span>
              <span style={{ color:pctColor, fontWeight:800 }}>{data.pct}%</span>
            </div>
            <div style={{ height:8, background:V.border, borderRadius:999, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:999, width:`${data.pct}%`, background: data.pct>=90?`linear-gradient(90deg,${V.red},#f87171)`:data.pct>=75?`linear-gradient(90deg,${V.amber},#fbbf24)`:`linear-gradient(90deg,${V.teal},#34d399)`, transition:'width .5s ease' }} />
            </div>
          </div>
          {data.pct >= 75 && (
            <div style={{ padding:'9px 12px', background:data.pct>=90?V.redBg:V.amberBg, border:`1px solid ${data.pct>=90?V.redRing:V.amberRing}`, borderRadius:8, fontSize:12, fontWeight:700, color:data.pct>=90?V.red:V.amber }}>
              {data.pct>=90 ? '🔴 Estás muy cerca del límite. Evaluá recategorizarte.' : '⚠️ Vas al 75%+ del límite. Revisá tu categoría.'}
            </div>
          )}
          {data.totalAnio === 0 && (
            <Link href="/mipanel/financiero" style={{ fontSize:12, fontWeight:700, color:V.ink3, textDecoration:'none', textAlign:'center', display:'block' }}>
              Cargá tus ingresos mensuales para ver proyecciones →
            </Link>
          )}
        </div>
      )}
    </div>
  )
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
  const [aiOpen, setAiOpen]           = useState(false)
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

  // Simulador
  const [simFacturacion, setSimFacturacion] = useState('')
  const [simTipo, setSimTipo]               = useState<'mono'|'ri'|'aut'>('mono')
  const [simResultado, setSimResultado]     = useState<any>(null)
  const [simLoading, setSimLoading]         = useState(false)
  const [simTab, setSimTab]                 = useState<'mas'|'ri'|'cuanto'>('mas')

  // Proyección de categoría
  const [proyFacturadoMes, setProyFacturadoMes]   = useState('')
  const [proyMesActual, setProyMesActual]           = useState(String(new Date().getMonth() + 1))
  const [proyResultado, setProyResultado]           = useState<any>(null)

  // Recupero saldo a favor
  const [recuperoTipo, setRecuperoTipo]             = useState<'percepciones'|'iva'|'arba'|null>(null)
  const [recuperoMonto, setRecuperoMonto]           = useState('')
  const [recuperoRespuesta, setRecuperoRespuesta]   = useState('')
  const [recuperoLoading, setRecuperoLoading]       = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { window.location.href='/login'; return }
      setUserId(user.id)

      // ── Lee de profiles (tabla correcta) ──────────────────────────────
      // select('*') trae también los campos de Mi Perfil v2 (situacion_fiscal,
      // tiene_empleados, inscripto_iibb, perfil_data, perfil_completitud, etc.)
      // que alimentan el diagnóstico de abajo.
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const p: Perfil = { id: user.id, ...(profileData || {}) }
      setPerfil(p)

      // ── Checklist ─────────────────────────────────────────────────────
      const { data: checklistData } = await supabase
        .from('user_checklist')
        .select('task_id, done, done_at')
        .eq('user_id', user.id)

      const db: Record<string,{done:boolean;done_at:string|null}> = {}
      for (const row of checklistData || []) db[row.task_id] = { done:row.done, done_at:row.done_at }

      setTasks(buildTasks(p, db))

      // ── Negocios activos (Crear Mi Negocio) ────────────────────────────
      // Cada uno puede tener su propia situación fiscal (ej: RI para un
      // local y Monotributo para otra actividad, al mismo tiempo) — por eso
      // el diagnóstico se calcula por negocio, no solo con el perfil.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        try {
          const res = await fetch('/api/negocio/proyectos', { headers: { Authorization: `Bearer ${session.access_token}` } })
          const json = await res.json()
          const activos = (json.proyectos || []).filter((pr: NegocioProyecto) => pr.estado === 'activo')
          setNegociosActivos(activos)
        } catch {
          // Si falla, el panel sigue funcionando con la situación general.
        }
      }

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

  // ── Simulador (usa LIMITES_MONO / CATS_MONO de lib/data.ts, fuente única) ─
  const simular = () => {
    const facAnual = parseFloat(simFacturacion) * 12
    if (!simFacturacion || isNaN(facAnual)) return

    if (simTab === 'mas') {
      // ¿Qué pasa si facturo más?
      const catActualIdx = LIMITES_MONO.findIndex(l => facAnual <= l)
      const limiteActual = catActualIdx >= 0 ? LIMITES_MONO[catActualIdx] : LIMITES_MONO[LIMITES_MONO.length-1]
      const catSiguienteIdx = catActualIdx + 1
      const disponible = limiteActual - facAnual
      const pct = Math.round((facAnual / limiteActual) * 100)
      setSimResultado({
        tipo: 'mas',
        catActual: catActualIdx >= 0 ? CATS_MONO[catActualIdx] : 'K (máximo)',
        limiteActual,
        disponible: disponible > 0 ? disponible : 0,
        pct,
        proxCat: catSiguienteIdx < CATS_MONO.length ? CATS_MONO[catSiguienteIdx] : null,
        superaLimite: facAnual > LIMITES_MONO[LIMITES_MONO.length-1],
      })
    } else if (simTab === 'ri') {
      // Mono vs RI
      const catIdx = LIMITES_MONO.findIndex(l => facAnual <= l)
      const ivaVenta = facAnual * 0.21
      const ivaCompras = facAnual * 0.10  // estimado 10% de crédito fiscal
      const ivaAPagar = Math.max(0, ivaVenta - ivaCompras)
      const ganancias = Math.max(0, (facAnual - 2000000) * 0.15) // simplificado
      const totalRI = ivaAPagar + ganancias
      const montoMono = catIdx >= 0 ? LIMITES_MONO[catIdx] * 0.04 : 0 // aprox 4% del límite
      setSimResultado({
        tipo: 'ri',
        facAnual,
        mono: { cat: catIdx >= 0 ? CATS_MONO[catIdx] : 'Superás el límite', pagoEstimado: montoMono / 12 },
        ri: { ivaAPagar: ivaAPagar / 12, ganancias: ganancias / 12, total: totalRI / 12 },
        conviene: totalRI < montoMono ? 'ri' : 'mono',
      })
    } else {
      // ¿Cuánto pago?
      const catIdx = LIMITES_MONO.findIndex(l => facAnual <= l)
      // Cuotas 2026 estimadas
      const CUOTAS = [5000,7500,10000,13000,18000,25000,35000,45000,55000,67000,130000]
      const cuota = catIdx >= 0 ? CUOTAS[catIdx] : CUOTAS[CUOTAS.length-1]
      setSimResultado({
        tipo: 'cuanto',
        cat: catIdx >= 0 ? CATS_MONO[catIdx] : 'K',
        cuota,
        anual: cuota * 12,
        pctIngresos: Math.round((cuota / (parseFloat(simFacturacion) || 1)) * 100),
      })
    }
  }

  // ── Proyección de categoría ──────────────────────────────────────────────
  const calcularProyeccion = () => {
    const facMes = parseFloat(proyFacturadoMes)
    const mes = parseInt(proyMesActual)
    if (!facMes || !mes) return
    const facAnualProyectada = facMes * 12
    const facHastaHoy = facMes * mes
    const catIdx = LIMITES_MONO.findIndex(l => facAnualProyectada <= l)
    const limiteActual = catIdx >= 0 ? LIMITES_MONO[catIdx] : LIMITES_MONO[LIMITES_MONO.length-1]
    const disponibleAnual = Math.max(0, limiteActual - facHastaHoy)
    const mesesRestantes = 12 - mes
    const podeFacMensual = mesesRestantes > 0 ? disponibleAnual / mesesRestantes : 0
    const pct = Math.round((facHastaHoy / limiteActual) * 100)
    const riesgo = pct >= 90 ? 'danger' : pct >= 75 ? 'warn' : 'ok'
    setProyResultado({
      facHastaHoy,
      facAnualProyectada,
      limiteActual,
      disponibleAnual,
      podeFacMensual,
      pct,
      riesgo,
      cat: catIdx >= 0 ? CATS_MONO[catIdx] : 'K',
      mesesRestantes,
    })
  }

  // ── Recupero saldo a favor ───────────────────────────────────────────────
  const consultarRecupero = async () => {
    if (!recuperoTipo) return
    setRecuperoLoading(true)
    setRecuperoRespuesta('')
    const monto = parseFloat(recuperoMonto)
    const tipoLabel2 = perfil?.tipo_contribuyente==='mono'?'monotributista':perfil?.tipo_contribuyente==='ri'?'responsable inscripto':'autónomo'
    const provincia = perfil?.provincia || 'Argentina'
    const queryMap = {
      percepciones: `Soy ${tipoLabel2} en ${provincia}${monto ? ` y tengo $${monto.toLocaleString('es-AR')} de percepciones acumuladas` : ''}. ¿Cómo puedo reclamar la devolución o compensación de percepciones de Ingresos Brutos? Dame los pasos exactos, formularios y plazos.`,
      iva: `Soy ${tipoLabel2} en ${provincia} y tengo saldo técnico a favor en IVA. ¿Cómo puedo recuperarlo o compensarlo? Dame los pasos con ARCA/AFIP, formularios (F.799 u otros) y condiciones.`,
      arba: `Soy ${tipoLabel2} en Buenos Aires. ¿Cómo reclamo devolución de percepciones de ARBA (Ingresos Brutos provincia de Buenos Aires)? Dame el procedimiento completo, plazos y documentación necesaria.`,
    }
    try {
      const r = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryMap[recuperoTipo], contexto: `Perfil: ${tipoLabel2}, provincia: ${provincia}` }),
      })
      const d = await r.json()
      setRecuperoRespuesta(d.response || 'Sin respuesta.')
    } catch {
      setRecuperoRespuesta('Error de conexión. Intentá de nuevo.')
    } finally {
      setRecuperoLoading(false)
    }
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

  // ── Diagnóstico fiscal (Nivel 2, calculado en base a Mi Perfil) ──────────
  // Mismo motor de reglas que /mipanel/perfil — un usuario que llenó
  // situación fiscal, jurisdicción y empleados ve acá qué le corresponde.
  const diagnostico: Obligacion[] = useMemo(() => perfil ? calcularDiagnostico(perfil) : [], [perfil])
  const completitudPerfil = useMemo(() => perfil?.perfil_completitud ?? (perfil ? calcularCompletitud(perfil) : 0), [perfil])
  const obligacionesPendientes = diagnostico.filter(o => o.aplica === true).length
  const obligacionesPorConfirmar = diagnostico.filter(o => o.aplica === null).length

  const [negociosActivos, setNegociosActivos] = useState<NegocioProyecto[]>([])

  // Obligaciones estrictamente personales. Si existen negocios activos,
  // Ganancias se explica dentro de la actividad que la origina para evitar
  // que un Mi Perfil incompleto contradiga un negocio ya configurado.
  const obligacionesPersona = useMemo(
    () => diagnostico.filter(o => o.nivel === 'persona' && (negociosActivos.length === 0 || o.key !== 'ganancias')),
    [diagnostico, negociosActivos.length]
  )

  // Facturación combinada de tus negocios — la que en definitiva importa
  // para evaluar Ganancias como persona (no cada negocio por separado).
  // Solo suma los negocios donde sos titular/socio/administrador: si sos
  // empleado/a de uno, esa facturación no es un ingreso tuyo.
  const negociosPropios = useMemo(() => negociosActivos.filter(n => n.datos?.relacion !== 'empleado'), [negociosActivos])
  const ingresoMensualCombinado = useMemo(
    () => negociosPropios.reduce((sum, n) => sum + (n.datos?.facturacion_estimada || 0), 0),
    [negociosPropios]
  )

  // Cada negocio muestra sus obligaciones operativas, incluida Ganancias
  // cuando corresponda. Autónomos permanece en la situación personal.
  const diagnosticosPorNegocio = useMemo(
    () => negociosActivos.map(n => ({ negocio: n, diagnostico: calcularDiagnostico(n.datos, 'negocio').filter(o => o.nivel === 'negocio') })),
    [negociosActivos]
  )
  const completedCount = tasks.filter(t=>t.done).length
  const totalCount     = tasks.length
  const progressPct    = Math.round((completedCount/totalCount)*100)
  const allDone        = completedCount === totalCount
  const tipoLabel      = perfil?.tipo_contribuyente==='mono' ? 'Monotributista' : perfil?.tipo_contribuyente==='ri' ? 'Responsable Inscripto' : perfil?.tipo_contribuyente==='aut' ? 'Autónomo' : null

  // Arma los ítems de vencimiento para un tipo/terminación de CUIT puntual
  // — se usa una vez para Mi Perfil (si tiene datos propios cargados) y una
  // vez por cada negocio activo, para no perder ningún vencimiento cuando
  // hay más de una situación fiscal en juego.
  function itemsVencimientoDe(tipo: string | undefined, t: string | undefined, etiqueta: string): {titulo:string;dia:number;negocio:string}[] {
    if (!t || !tipo) return []
    const items: {titulo:string;dia:number;negocio:string}[] = []
    if (tipo==='mono') items.push({ titulo:'Monotributo — cuota mensual', dia:20, negocio:etiqueta })
    if (tipo==='ri'||tipo==='aut') { const d=IVA_DIA[t]; if(d) items.push({ titulo:`IVA — DJ mensual (CUIT …${t})`, dia:d, negocio:etiqueta }) }
    if (tipo==='aut') { const d=AUT_DIA[t]; if(d) items.push({ titulo:`Autónomos — cuota mensual (CUIT …${t})`, dia:d, negocio:etiqueta }) }
    return items
  }

  // Negocios activos que aportan vencimientos propios: no los que marcaste
  // como "empleado" (esas fechas no son tuyas) y que ya tengan situación
  // fiscal + terminación de CUIT cargadas.
  const negociosConVencimiento = useMemo(
    () => negociosPropios.filter(n => n.datos?.situacion_fiscal && n.datos?.terminacion_cuit),
    [negociosPropios]
  )

  const vencimientos = useMemo(() => {
    const items: {titulo:string;dia:number;negocio:string}[] = []

    // Mi Perfil directo (para quien todavía no usa Crear Mi Negocio, o
    // tiene una situación personal propia además de sus negocios)
    items.push(...itemsVencimientoDe(perfil?.tipo_contribuyente, perfil?.terminacion_cuit, 'Personal'))

    // Cada negocio activo, con su propia situación fiscal y CUIT
    for (const n of negociosConVencimiento) {
      const tipoNegocio = n.datos.situacion_fiscal === 'mono' ? 'mono' : 'ri'
      const nombreNegocio = n.nombre || n.datos.actividad || 'Negocio'
      items.push(...itemsVencimientoDe(tipoNegocio, n.datos.terminacion_cuit, nombreNegocio))
    }

    return items.sort((a,b)=>getDias(a.dia)-getDias(b.dia))
  }, [perfil, negociosConVencimiento])

  // El candado de "completá tu perfil" solo tiene sentido si NO hay ninguna
  // fuente de vencimientos — ni Mi Perfil propio, ni ningún negocio con
  // terminación de CUIT cargada.
  const hayFuenteVencimientos = perfilCompleto || negociosConVencimiento.length > 0

  // ── Score fiscal ────────────────────────────────────────────────────────
  // Arma los ítems de "salud fiscal" de UNA entidad puntual (Mi Perfil o un
  // negocio), en base a SU propio tipo/terminación/facturación — antes esto
  // se calculaba una sola vez para toda la cuenta, mezclando cosas de
  // negocios distintos bajo un solo puntaje.
  function construirScoreItems(tipo: string | undefined, t: string | undefined, facturacionEstimada: number | null | undefined) {
    const items: { texto: string; nivel: 'ok' | 'warn' | 'danger'; detalle?: string }[] = []

    // Facturación vs límite de categoría (solo aplica a Monotributo)
    if (facturacionEstimada && tipo === 'mono') {
      const anual = facturacionEstimada * 12
      const limiteH = LIMITES_MONO[LIMITES_MONO.length - 1]
      const catIdx = LIMITES_MONO.findIndex(l => anual <= l)
      const limiteActual = catIdx >= 0 ? LIMITES_MONO[catIdx] : limiteH
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

    return items
  }

  function calcularScore(items: { nivel: 'ok'|'warn'|'danger' }[]) {
    if (items.length === 0) return null
    const puntos = items.reduce((acc, item) => acc + (item.nivel === 'ok' ? 10 : item.nivel === 'warn' ? 5 : 0), 0)
    return Math.round((puntos / (items.length * 10)) * 100)
  }

  // Un score por CUIT/entidad: "Personal" (si cargaste tipo+terminación
  // directo en Mi Perfil) + uno por cada negocio activo con datos propios.
  const scoresPorEntidad = useMemo(() => {
    const entidades: { etiqueta: string; items: ReturnType<typeof construirScoreItems> }[] = []

    if (perfil?.tipo_contribuyente && perfil?.terminacion_cuit) {
      entidades.push({ etiqueta: 'Personal', items: construirScoreItems(perfil.tipo_contribuyente, perfil.terminacion_cuit, perfil.facturacion_estimada) })
    }
    for (const n of negociosConVencimiento) {
      const tipoNegocio = n.datos.situacion_fiscal === 'mono' ? 'mono' : 'ri'
      const nombreNegocio = n.nombre || n.datos.actividad || 'Negocio'
      entidades.push({ etiqueta: nombreNegocio, items: construirScoreItems(tipoNegocio, n.datos.terminacion_cuit, n.datos.facturacion_estimada) })
    }
    return entidades
  }, [perfil, negociosConVencimiento])

  // Estado general (no es por CUIT): perfil completo + alertas activadas.
  const alertaTask = tasks.find(t => t.id === 'alertas')
  const estadoGeneralItems = useMemo(() => {
    const items: { texto: string; nivel: 'ok'|'warn'|'danger'; detalle?: string }[] = []
    if (perfilCompleto) items.push({ texto: 'Perfil completo', nivel: 'ok' })
    else items.push({ texto: 'Perfil incompleto', nivel: 'warn', detalle: 'Completá tu perfil para ver alertas personalizadas.' })
    if (alertaTask?.done) items.push({ texto: 'Alertas de vencimiento activas', nivel: 'ok' })
    else items.push({ texto: 'Alertas de vencimiento no activadas', nivel: 'warn', detalle: 'Activá las alertas para recibir avisos antes de cada vencimiento.' })
    return items
  }, [perfilCompleto, alertaTask])

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
                <Link href="/crear-negocio?ver=proyectos" onClick={()=>setMenuOpen(false)} style={{ display:'block', padding:'11px 16px', fontSize:13, fontWeight:700, color:V.ink, textDecoration:'none' }}>🗂️ Mis proyectos</Link>
                <button onClick={async()=>{ setMenuOpen(false); await supabase.auth.signOut(); window.location.href='/login' }} style={{ display:'block', width:'100%', textAlign:'left', padding:'11px 16px', fontSize:13, fontWeight:700, color:V.red, background:'none', border:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>→ Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1200, margin:'0 auto', padding:'28px 20px 80px' }}>
        <style>{`
          .panel-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .panel-sidebar { display: flex; flex-direction: column; gap: 20px; }
          .panel-main    { display: flex; flex-direction: column; gap: 20px; }
          @media (min-width: 1024px) {
            .panel-grid {
              grid-template-columns: 300px 1fr;
              align-items: start;
            }
          }
        `}</style>

        {/* ── Banner perfil — ancho completo ── */}
        <div style={{ background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, borderRadius:20, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', color:'#fff', marginBottom:20 }}>
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

        {/* ── GRID DOS COLUMNAS ── */}
        <div className="panel-grid">

          {/* ══ COLUMNA PRINCIPAL (izquierda/centro) ══ */}
          {/* ══ SIDEBAR izquierda ══ */}
          <div className="panel-sidebar">
            {/* Score fiscal — uno por CUIT/entidad, porque cada negocio
                tiene sus propias obligaciones y no tiene sentido mezclarlas
                bajo un solo puntaje. */}
            {scoresPorEntidad.length > 0 && (
              <>
                {/* Estado general: no es por CUIT (perfil completo + alertas) */}
                <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:16 }}>
                  <div style={{ fontSize:12.5, fontWeight:800, color:V.ink, marginBottom:10 }}>⚙️ Estado general</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {estadoGeneralItems.map((item, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'7px 10px', borderRadius:8, background: item.nivel==='ok'?V.greenBg:V.amberBg }}>
                        <span style={{ fontSize:11, flexShrink:0 }}>{item.nivel==='ok'?'✅':'⚠️'}</span>
                        <div>
                          <div style={{ fontSize:11.5, fontWeight:700, color: item.nivel==='ok'?V.green:V.amber }}>{item.texto}</div>
                          {item.detalle && <div style={{ fontSize:10, fontWeight:600, color:V.ink3, marginTop:1, lineHeight:1.4 }}>{item.detalle}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {scoresPorEntidad.map(({ etiqueta, items }) => {
                  const s = calcularScore(items) ?? 0
                  const sColor = s >= 80 ? V.green : s >= 50 ? V.amber : V.red
                  const sLabel = s >= 80 ? 'Bueno' : s >= 50 ? 'Regular' : 'Atención'
                  return (
                    <div key={etiqueta} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>🎯 Score fiscal</div>
                          <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>{etiqueta}</div>
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:40, fontWeight:900, color:sColor, lineHeight:1 }}>{s}</div>
                          <div style={{ fontSize:10, fontWeight:700, color:sColor, textTransform:'uppercase' as const, letterSpacing:'.05em' }}>{sLabel}</div>
                        </div>
                      </div>
                      <div style={{ height:8, background:V.border, borderRadius:999, marginBottom:14, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:999, width:`${s}%`, transition:'width .6s ease', background: s>=80?`linear-gradient(90deg,${V.green},#4ade80)`:s>=50?`linear-gradient(90deg,${V.amber},#fbbf24)`:`linear-gradient(90deg,${V.red},#f87171)` }} />
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                        {items.map((item, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 12px', borderRadius:8, background: item.nivel==='ok'?V.greenBg:item.nivel==='warn'?V.amberBg:V.redBg, border:`1px solid ${item.nivel==='ok'?V.greenRing:item.nivel==='warn'?V.amberRing:V.redRing}` }}>
                            <span style={{ fontSize:12, flexShrink:0 }}>{item.nivel==='ok'?'✅':item.nivel==='warn'?'⚠️':'🔴'}</span>
                            <div>
                              <div style={{ fontSize:12, fontWeight:700, color: item.nivel==='ok'?V.green:item.nivel==='warn'?V.amber:V.red }}>{item.texto}</div>
                              {item.detalle && <div style={{ fontSize:10, fontWeight:600, color:V.ink3, marginTop:2, lineHeight:1.4 }}>{item.detalle}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Widget financiero */}
            <WidgetFinanciero userId={userId} perfil={perfil} negocios={negociosActivos} />

            {/* Recordatorios */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:4 }}>⏰ Recordatorios</div>
              <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginBottom:14, lineHeight:1.5 }}>¿Con cuántos días de anticipación querés recibir el aviso?</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                {[{value:'1',label:'1 día'},{value:'3',label:'3 días'},{value:'5',label:'5 días'},{value:'7',label:'1 semana'}].map(op => (
                  <button key={op.value} onClick={() => setRecordatorioAnticipacion(op.value)} style={{ padding:'7px 12px', borderRadius:8, border:`2px solid ${recordatorioAnticipacion===op.value?V.teal:V.border}`, background:recordatorioAnticipacion===op.value?V.tealLight:V.surface, color:recordatorioAnticipacion===op.value?V.tealDark:V.ink3, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>{op.label}</button>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <button onClick={guardarRecordatorio} disabled={recordatorioLoading||!tasks.find(t=>t.id==='alertas')?.done} style={{ background:tasks.find(t=>t.id==='alertas')?.done?`linear-gradient(135deg,${V.tealDark},${V.teal})`:V.border, color:tasks.find(t=>t.id==='alertas')?.done?'#fff':V.ink3, border:'none', borderRadius:8, padding:'9px 16px', fontSize:12, fontWeight:800, cursor:tasks.find(t=>t.id==='alertas')?.done&&!recordatorioLoading?'pointer':'not-allowed', fontFamily:"'Nunito',sans-serif", opacity:recordatorioLoading ? .6 : 1 }}>
                  {recordatorioLoading?'Guardando...':'Guardar'}
                </button>
                {!tasks.find(t=>t.id==='alertas')?.done && <span style={{ fontSize:11, color:V.ink3, fontWeight:600 }}>🔒 Activá las alertas primero</span>}
                {recordatorioGuardado && <span style={{ fontSize:12, color:V.green, fontWeight:700 }}>✓ Guardado</span>}
              </div>
            </div>

            {/* Accesos rápidos */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:14 }}>💡 Accesos rápidos</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { icon:'💼', label:'Panel financiero',  href:'/mipanel/financiero',  destacado:true },
                  { icon:'🧾', label:'Facturación',       href:'/mipanel/facturacion', destacado:true },
                  { icon:'📊', label:'Mi categoría',      href:'/mi-categoria' },
                  { icon:'📄', label:'Cómo facturar',     href:'/como-facturar' },
                  { icon:'📅', label:'Calendario fiscal',  href:'/calendario-fiscal' },
                  { icon:'🗺️', label:'Por provincia',      href:'/impuestos-por-provincia' },
                ].map(c => (
                  <Link key={c.label} href={c.href} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:`1.5px solid ${c.destacado?V.tealRing:V.border}`, borderRadius:10, textDecoration:'none', color:c.destacado?V.tealDark:V.ink, fontSize:13, fontWeight:700, background:c.destacado?V.tealLight:V.surface }}>
                    <span style={{ fontSize:16 }}>{c.icon}</span>{c.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Checklist — solo si NO está completo */}
            {!allDone && (
              <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>✅ Lo que tenés que hacer</div>
                  <span style={{ fontSize:11, fontWeight:600, color:V.ink3 }}>{completedCount}/{totalCount}</span>
                </div>
                <div style={{ height:5, background:V.border, borderRadius:999, marginBottom:14, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:999, background:`linear-gradient(90deg,${V.teal},${V.gold})`, width:`${progressPct}%`, transition:'width .4s ease' }} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {tasks.filter(t=>!t.done).map(task => (
                    <div key={task.id} style={{ border:`1.5px solid ${V.border}`, borderRadius:10, overflow:'hidden' }}>
                      <div onClick={() => !task.bloqueada && toggleTask(task.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:task.bloqueada?'default':'pointer' }}>
                        <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, border:`2px solid ${task.bloqueada?V.border:V.border2}`, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {task.bloqueada && <span style={{ fontSize:9 }}>🔒</span>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:V.ink }}>{task.label}</div>
                          <div style={{ fontSize:10, color:V.ink3, fontWeight:600, marginTop:1 }}>{task.descripcion}</div>
                        </div>
                      </div>
                      {task.accion_href && (
                        <div style={{ borderTop:`1px solid ${V.border}`, padding:'7px 14px', background:V.bg, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <span style={{ fontSize:10, color:V.ink3, fontWeight:600 }}>{task.bloqueada?'🔒 Completá en tu perfil':'Pendiente'}</span>
                          {task.id==='alertas' ? (
                            <button onClick={()=>setShowAlertasForm(true)} style={{ fontSize:11, fontWeight:800, color:V.teal, background:'none', border:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>Activar →</button>
                          ) : (
                            <Link href={task.accion_href} style={{ fontSize:11, fontWeight:800, color:V.teal, textDecoration:'none' }}>{task.accion_label} →</Link>
                          )}
                        </div>
                      )}
                      {task.id==='alertas' && showAlertasForm && !task.done && (
                        <div style={{ borderTop:`1px solid ${V.border}`, padding:'12px 14px', background:V.tealLight, display:'flex', flexDirection:'column', gap:8 }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <input type="email" placeholder="tu@email.com" value={alertasEmail} onChange={e=>{setAlertasEmail(e.target.value);setAlertasError('')}} onKeyDown={e=>e.key==='Enter'&&suscribirAlertas()} style={{ flex:1, border:`1.5px solid ${V.border}`, borderRadius:8, padding:'7px 10px', fontSize:12, fontWeight:600, color:V.ink, background:V.surface, outline:'none', fontFamily:"'Nunito',sans-serif" }} />
                            <button onClick={suscribirAlertas} disabled={alertasLoading} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:8, padding:'7px 12px', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>{alertasLoading?'...':'Activar →'}</button>
                          </div>
                          {alertasError && <div style={{ fontSize:11, color:V.red, fontWeight:600 }}>⚠️ {alertasError}</div>}
                          <button onClick={()=>setShowAlertasForm(false)} style={{ fontSize:10, color:V.ink3, background:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:"'Nunito',sans-serif" }}>Cancelar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>{/* fin panel-sidebar */}

          {/* ══ MAIN derecha ══ */}
          <div className="panel-main">
            {/* Vencimientos */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
              <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:14 }}>📅 Tus próximos vencimientos</div>
              {!hayFuenteVencimientos ? (
                <div style={{ textAlign:'center', padding:'12px 0 4px' }}>
                  <span style={{ fontSize:28, opacity:.25 }}>🔒</span>
                  <p style={{ fontSize:12, fontWeight:600, color:V.ink3, maxWidth:220, lineHeight:1.6, margin:'8px auto 10px' }}>Completá tu perfil (o la terminación de CUIT de algún negocio activo) para ver tus fechas exactas.</p>
                  <Link href="/mipanel/perfil" style={{ fontSize:12, fontWeight:800, color:V.teal, textDecoration:'none' }}>Completar perfil →</Link>
                </div>
              ) : vencimientos.length === 0 ? (
                <div style={{ fontSize:13, color:V.ink3, fontWeight:600 }}>Sin vencimientos próximos.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {vencimientos.map((v,i) => {
                    const dias = getDias(v.dia)
                    const urgente = dias <= 5
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', border:`1.5px solid ${urgente?'#fca5a5':V.border}`, borderRadius:10, background:urgente?V.redBg:V.surface }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:V.ink }}>{v.titulo}</div>
                          <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:1 }}>
                            {fmtFecha(v.dia)}
                            {(negociosConVencimiento.length > 0) && <> · <span style={{ fontWeight:800 }}>{v.negocio}</span></>}
                          </div>
                        </div>
                        <div style={{ fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:20, whiteSpace:'nowrap' as const, background:urgente?V.redBg:V.tealLight, color:urgente?V.red:V.teal, border:`1px solid ${urgente?'#fca5a5':V.tealRing}` }}>
                          {dias===0?'¡Hoy!':dias===1?'Mañana':`En ${dias}d`}
                        </div>
                      </div>
                    )
                  })}
                  <Link href="/calendario-fiscal" style={{ fontSize:12, fontWeight:800, color:V.teal, textDecoration:'none', marginTop:4, display:'block' }}>Ver calendario completo →</Link>
                </div>
              )}
            </div>

            {/* Tu situación personal — obligaciones que son de VOS, no de
                ningún negocio en particular (ej: Autónomos, Ganancias).
                Solo se muestra si ya tenés al menos un negocio activo: si
                todavía no usaste Crear Mi Negocio, la tarjeta general de
                abajo ya cubre esto sin necesidad de separarlo. */}
            {diagnosticosPorNegocio.length > 0 && (
              <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:12 }}>👤 Tu situación personal</div>
                {negociosPropios.length >= 2 && ingresoMensualCombinado > 0 && (
                  <div style={{ background:V.bg, borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
                    <div style={{ fontSize:11, color:V.ink3, fontWeight:700 }}>💰 Facturación mensual combinada ({negociosPropios.length} negocios)</div>
                    <div style={{ fontSize:16, fontWeight:900, color:V.ink, marginTop:2 }}>${ingresoMensualCombinado.toLocaleString('es-AR')}</div>
                    <div style={{ fontSize:10.5, color:V.ink3, fontWeight:600, marginTop:4, lineHeight:1.5 }}>
                      Es lo que en definitiva importa para evaluar Ganancias como persona — no cada negocio por separado. No calculamos el impuesto en sí, solo te mostramos el total para que lo tengas a mano.
                    </div>
                  </div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {obligacionesPersona.map(o => {
                    const color = o.aplica === true ? V.green : o.aplica === false ? V.ink3 : V.amber
                    const bg = o.aplica === true ? V.greenBg : o.aplica === false ? V.bg : V.amberBg
                    const icon = o.confianza === 'confirmado' ? '🟢' : o.confianza === 'inferido' ? '🟡' : o.confianza === 'heredado' ? '🔵' : '🟠'
                    return (
                      <div key={o.key} style={{ display:'flex', gap:9, padding:'8px 10px', borderRadius:9, background:bg }}>
                        <div style={{ fontSize:13 }}>{icon}</div>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ fontSize:12, fontWeight:800, color }}>{o.label}</div><span style={{ fontSize:9, fontWeight:800, color:V.ink3, textTransform:'uppercase' as const, letterSpacing:'.03em' }}>{CONFIANZA_LABEL[o.confianza]}</span></div>
                          <div style={{ fontSize:11, color:V.ink2, fontWeight:600, marginTop:1, lineHeight:1.4 }}>{o.motivo}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Link href="/mipanel/perfil" style={{ fontSize:11, fontWeight:800, color:V.teal, textDecoration:'none', marginTop:12, display:'block' }}>Editar Mi Perfil →</Link>
              </div>
            )}

            {/* Negocios activos (Crear Mi Negocio) — cada uno con su propio
                diagnóstico, porque una persona puede ser RI para un negocio
                y Monotributista para otro al mismo tiempo. */}
            {diagnosticosPorNegocio.length > 0 && diagnosticosPorNegocio.map(({ negocio, diagnostico: diagNeg }) => {
              const pend = diagNeg.filter(o => o.aplica === true).length
              const porConfirmar = diagNeg.filter(o => o.aplica === null).length
              const nombreNegocio = negocio.nombre || negocio.datos?.actividad || 'Negocio sin nombre'
              const esEmpleado = negocio.datos?.relacion === 'empleado'
              const RELACION_LABEL: Record<string,string> = { titular:'👤 Titular', socio:'🤝 Socio/a', administrador:'🗂️ Administrador/a', empleado:'💼 Empleado/a', otro:'Otra relación' }
              return (
                <div key={negocio.id} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>🏷️ {nombreNegocio}</div>
                    <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20, background:V.greenBg, color:V.green }}>🟢 Activo</span>
                  </div>
                  <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginBottom:12, display:'flex', gap:6, flexWrap:'wrap' }}>
                    {negocio.datos?.situacion_fiscal && (
                      <span>{negocio.datos.alternativa_elegida === 'sociedad' ? '🏛️ Sociedad' : negocio.datos.situacion_fiscal === 'mono' ? '📋 Monotributo' : negocio.datos.situacion_fiscal === 'ri' ? '🏢 Responsable Inscripto' : negocio.datos.situacion_fiscal}{negocio.datos.provincia && ` · ${negocio.datos.provincia}`}</span>
                    )}
                    {negocio.datos?.relacion && <span>· {RELACION_LABEL[negocio.datos.relacion]}</span>}
                  </div>

                  {esEmpleado ? (
                    <div style={{ background:V.bg, borderRadius:10, padding:'12px 14px' }}>
                      <div style={{ fontSize:12, color:V.ink2, fontWeight:600, lineHeight:1.6 }}>
                        Marcaste que sos <strong>empleado/a</strong> acá, no dueño/a — las obligaciones fiscales de este negocio le corresponden al empleador, no a vos personalmente. Si además hacés aportes por tu cuenta, los vas a ver en "Tu situación personal" arriba.
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                        <div style={{ flex:1, background:V.greenBg, border:`1px solid ${V.greenRing}`, borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                          <div style={{ fontSize:17, fontWeight:900, color:V.green }}>{pend}</div>
                          <div style={{ fontSize:10, fontWeight:700, color:V.ink3 }}>te corresponden</div>
                        </div>
                        <div style={{ flex:1, background:V.amberBg, border:`1px solid ${V.amberRing}`, borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                          <div style={{ fontSize:17, fontWeight:900, color:V.amber }}>{porConfirmar}</div>
                          <div style={{ fontSize:10, fontWeight:700, color:V.ink3 }}>por confirmar</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                        {diagNeg.map(o => {
                          const color = o.aplica === true ? V.green : o.aplica === false ? V.ink3 : V.amber
                          const bg = o.aplica === true ? V.greenBg : o.aplica === false ? V.bg : V.amberBg
                          const icon = o.confianza === 'confirmado' ? '🟢' : o.confianza === 'inferido' ? '🟡' : o.confianza === 'heredado' ? '🔵' : '🟠'
                          return (
                            <div key={o.key} style={{ display:'flex', gap:9, padding:'8px 10px', borderRadius:9, background:bg }}>
                              <div style={{ fontSize:13 }}>{icon}</div>
                              <div>
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ fontSize:12, fontWeight:800, color }}>{o.label}</div><span style={{ fontSize:9, fontWeight:800, color:V.ink3, textTransform:'uppercase' as const, letterSpacing:'.03em' }}>{CONFIANZA_LABEL[o.confianza]}</span></div>
                                <div style={{ fontSize:11, color:V.ink2, fontWeight:600, marginTop:1, lineHeight:1.4 }}>{o.motivo}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                  <Link href="/crear-negocio?ver=proyectos" style={{ fontSize:11, fontWeight:800, color:V.teal, textDecoration:'none', marginTop:12, display:'block' }}>Editar este negocio →</Link>
                </div>
              )
            })}

            {/* Diagnóstico general — Nivel 2, calculado a partir de Mi Perfil.
                Solo se muestra si TODAVÍA NO hay negocios activos (spec:
                cada negocio ya tiene su propia tarjeta arriba, y mostrar
                esto también generaría contradicciones/duplicados). */}
            {diagnosticosPorNegocio.length === 0 && (
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>🧾 Tus obligaciones fiscales</div>
                <span style={{ fontSize:11, fontWeight:800, color: completitudPerfil===100?V.green:V.teal }}>{completitudPerfil}% del perfil</span>
              </div>

              {diagnostico.length === 0 ? (
                <div style={{ textAlign:'center', padding:'12px 0 4px' }}>
                  <span style={{ fontSize:28, opacity:.25 }}>🧾</span>
                  <p style={{ fontSize:12, fontWeight:600, color:V.ink3, maxWidth:260, lineHeight:1.6, margin:'8px auto 10px' }}>Contanos tu situación fiscal en Mi Perfil y acá te mostramos qué obligaciones te corresponden.</p>
                  <Link href="/mipanel/perfil" style={{ fontSize:12, fontWeight:800, color:V.teal, textDecoration:'none' }}>Completar perfil →</Link>
                </div>
              ) : (
                <>
                  <div style={{ display:'flex', gap:8, marginBottom:14, marginTop:10 }}>
                    <div style={{ flex:1, background:V.greenBg, border:`1px solid ${V.greenRing}`, borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:17, fontWeight:900, color:V.green }}>{obligacionesPendientes}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:V.ink3 }}>te corresponden</div>
                    </div>
                    <div style={{ flex:1, background:V.amberBg, border:`1px solid ${V.amberRing}`, borderRadius:10, padding:'8px 10px', textAlign:'center' }}>
                      <div style={{ fontSize:17, fontWeight:900, color:V.amber }}>{obligacionesPorConfirmar}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:V.ink3 }}>por confirmar</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                    {diagnostico.map(o => {
                      const color = o.aplica === true ? V.green : o.aplica === false ? V.ink3 : V.amber
                      const bg = o.aplica === true ? V.greenBg : o.aplica === false ? V.bg : V.amberBg
                      const icon = o.confianza === 'confirmado' ? '🟢' : o.confianza === 'inferido' ? '🟡' : o.confianza === 'heredado' ? '🔵' : '🟠'
                      return (
                        <div key={o.key} style={{ display:'flex', gap:9, padding:'8px 10px', borderRadius:9, background:bg }}>
                          <div style={{ fontSize:13 }}>{icon}</div>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ fontSize:12, fontWeight:800, color }}>{o.label}</div><span style={{ fontSize:9, fontWeight:800, color:V.ink3, textTransform:'uppercase' as const, letterSpacing:'.03em' }}>{CONFIANZA_LABEL[o.confianza]}</span></div>
                            <div style={{ fontSize:11, color:V.ink2, fontWeight:600, marginTop:1, lineHeight:1.4 }}>{o.motivo}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {completitudPerfil < 100 && (
                    <Link href="/mipanel/perfil" style={{ fontSize:12, fontWeight:800, color:V.teal, textDecoration:'none', marginTop:12, display:'block' }}>Completar perfil para afinar el diagnóstico →</Link>
                  )}
                </>
              )}
            </div>
            )}

            {/* Novedades fiscales */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${V.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>📰 Novedades fiscales</div>
                  <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>
                    {perfilCompleto ? `Para ${tipoLabel}${perfil?.provincia ? ` · ${perfil.provincia}` : ''}` : 'Noticias generales de ARCA/AFIP'}
                  </div>
                </div>
                {!noticiasLoaded && (
                  <button onClick={cargarNoticias} disabled={noticiasLoading} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:800, cursor:noticiasLoading?'not-allowed':'pointer', opacity:noticiasLoading ? .6 : 1, fontFamily:"'Nunito',sans-serif", whiteSpace:'nowrap' }}>
                    {noticiasLoading ? 'Cargando...' : 'Ver novedades →'}
                  </button>
                )}
              </div>
              {!noticiasLoaded && !noticiasLoading && (
                <div style={{ padding:'24px 20px', textAlign:'center' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>📡</div>
                  <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0 }}>Hacé clic en "Ver novedades" para cargar las últimas noticias fiscales personalizadas.</p>
                </div>
              )}
              {noticiasLoading && <div style={{ padding:'24px 20px', textAlign:'center', color:V.ink3, fontSize:13, fontWeight:600 }}>Consultando novedades de ARCA...</div>}
              {noticiasLoaded && noticias.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column' }}>
                  {noticias.map((n, i) => (
                    <div key={i} style={{ padding:'14px 20px', borderBottom: i < noticias.length - 1 ? `1px solid ${V.border}` : 'none', display:'flex', gap:12, alignItems:'flex-start' }}>
                      <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background: n.urgente ? V.redBg : V.tealLight, border: `1px solid ${n.urgente ? V.redRing : V.tealRing}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                        {n.urgente ? '🚨' : '📋'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color: n.urgente ? V.red : V.ink, marginBottom:3 }}>{n.titulo}</div>
                        <div style={{ fontSize:12, color:V.ink3, fontWeight:600, lineHeight:1.6 }}>{n.resumen}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding:'12px 20px', borderTop:`1px solid ${V.border}`, background:V.bg }}>
                    <button onClick={() => { setNoticiasLoaded(false); setNoticias([]); cargarNoticias() }} style={{ fontSize:12, fontWeight:700, color:V.teal, background:'none', border:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>↻ Actualizar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Simulador fiscal */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${V.border}` }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>🔮 Simulador fiscal</div>
                <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>Calculá escenarios antes de tomar decisiones</div>
              </div>
              <div style={{ display:'flex', borderBottom:`1px solid ${V.border}`, background:V.bg }}>
                {([
                  { id:'mas', label:'¿Qué pasa si facturo más?' },
                  { id:'ri',  label:'¿Me conviene RI?' },
                  { id:'cuanto', label:'¿Cuánto pago?' },
                ] as const).map(tab => (
                  <button key={tab.id} onClick={() => { setSimTab(tab.id); setSimResultado(null) }} style={{ flex:1, padding:'10px 8px', border:'none', borderBottom:`2px solid ${simTab===tab.id?V.teal:'transparent'}`, background:'transparent', fontSize:11, fontWeight:simTab===tab.id?800:600, color:simTab===tab.id?V.teal:V.ink3, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>{tab.label}</button>
                ))}
              </div>
              <div style={{ padding:'20px' }}>
                <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
                  <div style={{ flex:1, minWidth:160 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:6 }}>Facturación mensual estimada</label>
                    <input type="number" placeholder="Ej: 500000" value={simFacturacion} onChange={e => { setSimFacturacion(e.target.value); setSimResultado(null) }}
                      style={{ width:'100%', border:`1.5px solid ${V.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, fontWeight:600, color:V.ink, background:V.bg, outline:'none', fontFamily:"'Nunito',sans-serif", boxSizing:'border-box' as const }} />
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end' }}>
                    <button onClick={simular} disabled={!simFacturacion} style={{ background: simFacturacion ? `linear-gradient(135deg,${V.tealDark},${V.teal})` : V.border, color: simFacturacion ? '#fff' : V.ink3, border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:800, cursor:simFacturacion?'pointer':'not-allowed', fontFamily:"'Nunito',sans-serif" }}>Simular →</button>
                  </div>
                </div>
                {simResultado && simResultado.tipo === 'mas' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ background:simResultado.superaLimite?V.redBg:simResultado.pct>=75?V.amberBg:V.greenBg, border:`1.5px solid ${simResultado.superaLimite?V.redRing:simResultado.pct>=75?V.amberRing:V.greenRing}`, borderRadius:12, padding:'16px 20px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:V.ink, marginBottom:4 }}>{simResultado.superaLimite ? '🔴 Superás el límite del monotributo' : `📊 Categoría actual: ${simResultado.catActual}`}</div>
                      <div style={{ height:8, background:'rgba(0,0,0,.08)', borderRadius:999, marginBottom:10, overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:999, width:`${Math.min(simResultado.pct,100)}%`, background:simResultado.pct>=90?V.red:simResultado.pct>=75?V.amber:V.green }} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        <div style={{ background:'rgba(255,255,255,.7)', borderRadius:8, padding:'10px 12px' }}>
                          <div style={{ fontSize:10, fontWeight:700, color:V.ink3, textTransform:'uppercase' as const, letterSpacing:'.05em' }}>Usaste del límite</div>
                          <div style={{ fontSize:20, fontWeight:900, color:simResultado.pct>=90?V.red:V.ink }}>{simResultado.pct}%</div>
                        </div>
                        <div style={{ background:'rgba(255,255,255,.7)', borderRadius:8, padding:'10px 12px' }}>
                          <div style={{ fontSize:10, fontWeight:700, color:V.ink3, textTransform:'uppercase' as const, letterSpacing:'.05em' }}>Podés facturar más</div>
                          <div style={{ fontSize:20, fontWeight:900, color:V.green }}>${Math.round(simResultado.disponible/1000)}K</div>
                        </div>
                      </div>
                    </div>
                    {simResultado.superaLimite && <div style={{ background:V.redBg, border:`1px solid ${V.redRing}`, borderRadius:10, padding:'12px 16px', fontSize:13, fontWeight:600, color:V.red }}>Superás el límite máximo del monotributo. Debés evaluar pasarte a Responsable Inscripto.</div>}
                  </div>
                )}
                {simResultado && simResultado.tipo === 'ri' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div style={{ background:simResultado.conviene==='mono'?V.greenBg:V.bg, border:`1.5px solid ${simResultado.conviene==='mono'?V.greenRing:V.border}`, borderRadius:12, padding:'16px' }}>
                        <div style={{ fontSize:12, fontWeight:800, color:V.ink, marginBottom:8 }}>📋 Monotributo {simResultado.conviene==='mono'&&'✓'}</div>
                        <div style={{ fontSize:10, color:V.ink3, fontWeight:600, marginBottom:4 }}>Categoría</div>
                        <div style={{ fontSize:16, fontWeight:900, color:V.ink, marginBottom:8 }}>{simResultado.mono.cat}</div>
                        <div style={{ fontSize:10, color:V.ink3, fontWeight:600, marginBottom:4 }}>Pago mensual estimado</div>
                        <div style={{ fontSize:20, fontWeight:900, color:V.teal }}>${Math.round(simResultado.mono.pagoEstimado).toLocaleString('es-AR')}</div>
                      </div>
                      <div style={{ background:simResultado.conviene==='ri'?V.greenBg:V.bg, border:`1.5px solid ${simResultado.conviene==='ri'?V.greenRing:V.border}`, borderRadius:12, padding:'16px' }}>
                        <div style={{ fontSize:12, fontWeight:800, color:V.ink, marginBottom:8 }}>🏢 Resp. Inscripto {simResultado.conviene==='ri'&&'✓'}</div>
                        <div style={{ fontSize:10, color:V.ink3, fontWeight:600, marginBottom:4 }}>IVA a pagar / mes</div>
                        <div style={{ fontSize:16, fontWeight:900, color:V.ink, marginBottom:8 }}>${Math.round(simResultado.ri.ivaAPagar).toLocaleString('es-AR')}</div>
                        <div style={{ fontSize:10, color:V.ink3, fontWeight:600, marginBottom:4 }}>Total estimado / mes</div>
                        <div style={{ fontSize:20, fontWeight:900, color:V.teal }}>${Math.round(simResultado.ri.total).toLocaleString('es-AR')}</div>
                      </div>
                    </div>
                    <div style={{ background:V.amberBg, border:`1px solid ${V.amberRing}`, borderRadius:10, padding:'12px 16px', fontSize:12, fontWeight:600, color:V.amber, lineHeight:1.6 }}>⚠️ Estimación simplificada. El IVA real depende de tus compras y crédito fiscal.</div>
                  </div>
                )}
                {simResultado && simResultado.tipo === 'cuanto' && (
                  <div style={{ background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, borderRadius:12, padding:'20px', color:'#fff' }}>
                    <div style={{ fontSize:12, fontWeight:700, opacity:.7, marginBottom:4 }}>Categoría estimada: {simResultado.cat}</div>
                    <div style={{ fontSize:36, fontWeight:900, lineHeight:1, marginBottom:4 }}>${simResultado.cuota.toLocaleString('es-AR')}</div>
                    <div style={{ fontSize:12, opacity:.7, marginBottom:16 }}>por mes · estimado 2026</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:10, opacity:.6, marginBottom:2 }}>Pago anual</div>
                        <div style={{ fontSize:15, fontWeight:800 }}>${simResultado.anual.toLocaleString('es-AR')}</div>
                      </div>
                      <div style={{ background:'rgba(255,255,255,.1)', borderRadius:8, padding:'10px 12px' }}>
                        <div style={{ fontSize:10, opacity:.6, marginBottom:2 }}>% de tus ingresos</div>
                        <div style={{ fontSize:15, fontWeight:800 }}>{simResultado.pctIngresos}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recupero saldo a favor */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${V.border}` }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>💰 Recupero de saldo a favor</div>
                <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>Detectá si tenés percepciones o saldos que podés reclamar</div>
              </div>
              <div style={{ padding:'20px' }}>
                <div style={{ fontSize:12, fontWeight:700, color:V.ink2, marginBottom:12 }}>¿Qué tipo de recupero querés consultar?</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                  {([
                    { id:'percepciones', icon:'📊', titulo:'Percepciones de Ingresos Brutos', desc:'Retenciones cobradas de más en tus ventas o cobros.' },
                    { id:'iva',          icon:'🧾', titulo:'Saldo técnico a favor en IVA',    desc:'Crédito fiscal acumulado que podés compensar o pedir devolución.' },
                    { id:'arba',         icon:'🏛️', titulo:'Percepciones ARBA (Bs. As.)',     desc:'Percepciones provinciales de Ingresos Brutos en Buenos Aires.' },
                  ] as const).map(op => (
                    <div key={op.id} onClick={() => { setRecuperoTipo(op.id); setRecuperoRespuesta('') }} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 16px', cursor:'pointer', border:`2px solid ${recuperoTipo===op.id?V.teal:V.border}`, borderRadius:10, background:recuperoTipo===op.id?V.tealLight:V.surface, transition:'all .15s' }}>
                      <span style={{ fontSize:20, flexShrink:0 }}>{op.icon}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:V.ink }}>{op.titulo}</div>
                        <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:2 }}>{op.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {recuperoTipo && (
                  <div style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:6 }}>Monto aproximado a recuperar (opcional)</label>
                    <input type="number" placeholder="Ej: 84000" value={recuperoMonto} onChange={e=>setRecuperoMonto(e.target.value)}
                      style={{ width:'100%', border:`1.5px solid ${V.border}`, borderRadius:10, padding:'10px 14px', fontSize:13, fontWeight:600, color:V.ink, background:V.bg, outline:'none', fontFamily:"'Nunito',sans-serif", boxSizing:'border-box' as const }} />
                  </div>
                )}
                <button onClick={consultarRecupero} disabled={!recuperoTipo||recuperoLoading} style={{ background:recuperoTipo?`linear-gradient(135deg,${V.tealDark},${V.teal})`:V.border, color:recuperoTipo?'#fff':V.ink3, border:'none', borderRadius:10, padding:'11px 20px', fontSize:13, fontWeight:800, cursor:recuperoTipo&&!recuperoLoading?'pointer':'not-allowed', fontFamily:"'Nunito',sans-serif", opacity:recuperoLoading ? .6 : 1 }}>
                  {recuperoLoading ? 'Consultando...' : '¿Cómo recuperarlo? →'}
                </button>
                {recuperoRespuesta && (
                  <div style={{ marginTop:16, padding:'14px 16px', background:V.bg, borderRadius:10, borderLeft:`3px solid ${V.teal}`, fontSize:13, color:V.ink2, fontWeight:600, lineHeight:1.8, whiteSpace:'pre-wrap' as const }}>
                    {recuperoRespuesta}
                  </div>
                )}
              </div>
            </div>


          </div>{/* fin panel-main */}
        </div>{/* fin panel-grid */}

        {/* ══ BURBUJA ASISTENTE IA FLOTANTE ══ */}
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:1000, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:12 }}>
          {/* Chat expandido */}
          {aiOpen && (
            <div style={{ width:360, maxHeight:520, background:V.surface, borderRadius:20, boxShadow:'0 8px 40px rgba(13,92,120,.25)', border:`1.5px solid ${V.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              {/* Header */}
              <div style={{ background:'#0a0a1a', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#4caf50', boxShadow:'0 0 0 3px rgba(76,175,80,.2)' }} />
                  <span style={{ fontSize:12, fontWeight:800, color:'#fff', letterSpacing:'1.2px', textTransform:'uppercase' as const }}>Asistente fiscal IA</span>
                </div>
                <button onClick={()=>setAiOpen(false)} style={{ background:'rgba(255,255,255,.1)', border:'none', borderRadius:6, width:24, height:24, cursor:'pointer', color:'#fff', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif" }}>×</button>
              </div>
              {/* Historial */}
              <div style={{ flex:1, padding:'14px 16px', overflowY:'auto' as const, display:'flex', flexDirection:'column', gap:10, maxHeight:320 }}>
                {aiHistory.length===0 && (
                  <div style={{ textAlign:'center', padding:'16px 0' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🤖</div>
                    <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0, lineHeight:1.6 }}>
                      {perfilCompleto ? `Hola${perfil?.nombre ? ` ${perfil.nombre}` : ''}! Ya tengo tu perfil. Preguntame sobre tu situación fiscal.` : 'Hola! Preguntame sobre impuestos y trámites en Argentina.'}
                    </p>
                  </div>
                )}
                {aiHistory.map((msg,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'85%', padding:'9px 13px', borderRadius:msg.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background:msg.role==='user'?V.teal:V.bg, color:msg.role==='user'?'#fff':V.ink2, fontSize:12, fontWeight:600, lineHeight:1.7, whiteSpace:'pre-wrap' as const, border:msg.role==='assistant'?`1px solid ${V.border}`:'none' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display:'flex', justifyContent:'flex-start' }}>
                    <div style={{ padding:'9px 13px', borderRadius:'16px 16px 16px 4px', background:V.bg, border:`1px solid ${V.border}`, fontSize:12, color:V.ink3, fontWeight:600 }}>Consultando...</div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>
              {/* Sugerencias */}
              {aiHistory.length===0 && (
                <div style={{ padding:'0 14px 10px', display:'flex', flexWrap:'wrap', gap:5 }}>
                  {sugerencias.slice(0,3).map(s => (
                    <button key={s} onClick={()=>askAI(s)} style={{ background:V.bg, border:`1px solid ${V.border}`, borderRadius:20, padding:'4px 10px', fontSize:10, fontWeight:700, color:V.ink3, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>{s}</button>
                  ))}
                </div>
              )}
              {/* Input */}
              <div style={{ padding:'10px 14px', borderTop:`1px solid ${V.border}`, display:'flex', gap:8 }}>
                <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&askAI()} placeholder="Preguntame..."
                  style={{ flex:1, border:`1.5px solid ${V.border}`, borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:600, color:V.ink, background:V.bg, outline:'none', fontFamily:"'Nunito',sans-serif" }} />
                <button onClick={()=>askAI()} disabled={aiLoading||!aiQuery.trim()} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:10, padding:'8px 14px', fontSize:12, fontWeight:800, cursor:aiLoading||!aiQuery.trim()?'not-allowed':'pointer', opacity:aiLoading||!aiQuery.trim() ? .5 : 1, fontFamily:"'Nunito',sans-serif" }}>→</button>
              </div>
            </div>
          )}
          {/* Burbuja */}
          <button onClick={()=>setAiOpen(v=>!v)} style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(13,92,120,.4)', fontSize:28, transition:'transform .2s', position:'relative' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.1)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
            🤖
            {!aiOpen && aiHistory.length === 0 && (
              <div style={{ position:'absolute', top:-2, right:-2, width:14, height:14, borderRadius:'50%', background:'#4caf50', border:'2px solid #fff' }} />
            )}
          </button>
        </div>

      </main>
    </div>
  )
}
