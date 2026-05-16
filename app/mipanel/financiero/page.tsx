'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const V = {
  tealDark:'#0d5c78', teal:'#1a7fa8', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
  gold:'#f5a623', goldLight:'#fff8ec', goldRing:'#fde4a0',
  red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
  amber:'#d97706', amberBg:'#fffbeb', amberRing:'#fde68a',
  green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed', border2:'#c8d8e2',
  ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
}

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MESES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Límites de categorías monotributo 2026
const LIMITES_MONO = [2700000,4050000,5400000,6750000,9450000,13500000,19600000,24500000,29500000,35000000,68000000]
const CATS_MONO = ['A','B','C','D','E','F','G','H','I','J','K']

function money(n: number) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `$${Math.round(n/1000)}K`
  return `$${Math.round(n).toLocaleString('es-AR')}`
}

interface IngresoDB {
  mes: number
  monto: number
}

interface Factura {
  id: string
  cliente: string
  concepto: string
  monto: number
  fecha_emision: string
  fecha_vto: string | null
  estado: 'pendiente' | 'cobrada' | 'vencida' | 'cancelada'
  numero: string | null
  notas: string | null
}

interface Perfil {
  tipo_contribuyente: string
  facturacion_estimada: number | null
  nombre: string
}

export default function FinancieroPage() {
  const anioActual = new Date().getFullYear()
  const mesActual  = new Date().getMonth() // 0-indexed

  const [userId, setUserId]     = useState<string|null>(null)
  const [perfil, setPerfil]     = useState<Perfil|null>(null)
  const [loading, setLoading]   = useState(true)
  const [anio, setAnio]         = useState(anioActual)

  // Ingresos
  const [ingresos, setIngresos] = useState<number[]>(Array(12).fill(0))
  const [editMes, setEditMes]   = useState<number|null>(null)
  const [editVal, setEditVal]   = useState('')
  const [savingMes, setSavingMes] = useState(false)

  // Facturas
  const [facturas, setFacturas]           = useState<Factura[]>([])
  const [showNuevaFactura, setShowNuevaFactura] = useState(false)
  const [nfCliente, setNfCliente]         = useState('')
  const [nfConcepto, setNfConcepto]       = useState('')
  const [nfMonto, setNfMonto]             = useState('')
  const [nfVto, setNfVto]                 = useState('')
  const [nfNumero, setNfNumero]           = useState('')
  const [savingFactura, setSavingFactura] = useState(false)
  const [tabActiva, setTabActiva]         = useState<'financiero'|'cobranzas'>('financiero')

  // ── Cargar datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUserId(user.id)

      const [{ data: profileData }, { data: ingresosData }, { data: facturasData }] = await Promise.all([
        supabase.from('profiles').select('tipo_contribuyente, facturacion_estimada, nombre').eq('id', user.id).single(),
        supabase.from('ingresos_mensuales').select('mes, monto').eq('user_id', user.id).eq('anio', anio),
        supabase.from('facturas').select('*').eq('user_id', user.id).order('fecha_emision', { ascending: false }),
      ])

      if (profileData) setPerfil(profileData)

      const arr = Array(12).fill(0)
      for (const row of ingresosData || []) arr[row.mes - 1] = row.monto
      setIngresos(arr)

      setFacturas(facturasData || [])
      setLoading(false)
    }
    load()
  }, [anio])

  // ── Guardar ingreso de un mes ────────────────────────────────────────────
  const guardarIngreso = async (mes: number) => {
    if (!userId) return
    setSavingMes(true)
    const monto = parseFloat(editVal) || 0
    const newArr = [...ingresos]
    newArr[mes] = monto
    setIngresos(newArr)

    await supabase.from('ingresos_mensuales').upsert({
      user_id: userId,
      anio,
      mes: mes + 1,
      monto,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,anio,mes' })

    setSavingMes(false)
    setEditMes(null)
    setEditVal('')
  }

  // ── Nueva factura ────────────────────────────────────────────────────────
  const guardarFactura = async () => {
    if (!userId || !nfCliente || !nfMonto) return
    setSavingFactura(true)
    const { data } = await supabase.from('facturas').insert({
      user_id: userId,
      cliente: nfCliente,
      concepto: nfConcepto,
      monto: parseFloat(nfMonto),
      fecha_vto: nfVto || null,
      numero: nfNumero || null,
      estado: 'pendiente',
    }).select().single()

    if (data) setFacturas(prev => [data, ...prev])
    setNfCliente(''); setNfConcepto(''); setNfMonto(''); setNfVto(''); setNfNumero('')
    setShowNuevaFactura(false)
    setSavingFactura(false)
  }

  const cambiarEstado = async (id: string, estado: Factura['estado']) => {
    setFacturas(prev => prev.map(f => f.id === id ? {...f, estado} : f))
    await supabase.from('facturas').update({ estado, updated_at: new Date().toISOString() }).eq('id', id)
  }

  // ── Métricas calculadas ──────────────────────────────────────────────────
  const totalAnio         = useMemo(() => ingresos.reduce((a,b)=>a+b,0), [ingresos])
  const promedioMensual   = useMemo(() => { const c = ingresos.filter(x=>x>0).length; return c>0?totalAnio/c:0 }, [ingresos, totalAnio])
  const maxMes            = useMemo(() => Math.max(...ingresos), [ingresos])
  const ingresosHastaHoy  = useMemo(() => ingresos.slice(0, mesActual+1).reduce((a,b)=>a+b,0), [ingresos, mesActual])
  const proyeccionAnual   = useMemo(() => promedioMensual * 12, [promedioMensual])

  // Categoría y límite
  const catIdx      = useMemo(() => LIMITES_MONO.findIndex(l => proyeccionAnual <= l), [proyeccionAnual])
  const limiteAnual = useMemo(() => catIdx >= 0 ? LIMITES_MONO[catIdx] : LIMITES_MONO[LIMITES_MONO.length-1], [catIdx])
  const catLabel    = useMemo(() => catIdx >= 0 ? CATS_MONO[catIdx] : 'K+', [catIdx])
  const pctLimite   = useMemo(() => Math.min(Math.round((ingresosHastaHoy / limiteAnual) * 100), 100), [ingresosHastaHoy, limiteAnual])
  const disponible  = useMemo(() => Math.max(0, limiteAnual - ingresosHastaHoy), [limiteAnual, ingresosHastaHoy])

  // Cobranzas
  const pendientes  = useMemo(() => facturas.filter(f=>f.estado==='pendiente'), [facturas])
  const cobradas    = useMemo(() => facturas.filter(f=>f.estado==='cobrada'), [facturas])
  const vencidas    = useMemo(() => facturas.filter(f=>f.estado==='vencida'), [facturas])
  const totalPendiente = useMemo(() => pendientes.reduce((a,f)=>a+f.monto,0), [pendientes])
  const totalCobrado   = useMemo(() => cobradas.reduce((a,f)=>a+f.monto,0), [cobradas])

  const inp: React.CSSProperties = {
    border:`1.5px solid ${V.border}`, borderRadius:10, padding:'9px 12px',
    fontSize:13, fontWeight:600, color:V.ink, background:V.bg,
    outline:'none', fontFamily:"'Nunito',sans-serif", width:'100%', boxSizing:'border-box',
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", color:V.ink3 }}>Cargando...</div>
  )

  return (
    <div style={{ minHeight:'100vh', background:V.bg, fontFamily:"'Nunito',sans-serif", color:V.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Topbar */}
      <header style={{ background:V.surface, borderBottom:`1px solid ${V.border}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 4px rgba(13,92,120,.07)', position:'sticky', top:0, zIndex:100 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height:44, width:'auto' }} />
        </Link>
        <Link href="/mipanel" style={{ fontSize:13, fontWeight:700, color:V.ink3, textDecoration:'none' }}>← Mi panel</Link>
      </header>

      <main style={{ maxWidth:900, margin:'0 auto', padding:'28px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:V.ink, margin:'0 0 4px' }}>💼 Panel financiero</h1>
            <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0 }}>
              {perfil?.nombre ? `${perfil.nombre} · ` : ''}{anio}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={()=>setAnio(a=>a-1)} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:700, color:V.ink2, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>‹ {anio-1}</button>
            <span style={{ fontSize:14, fontWeight:800, color:V.teal }}>{anio}</span>
            <button onClick={()=>setAnio(a=>a+1)} disabled={anio>=anioActual} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:8, padding:'6px 12px', fontSize:13, fontWeight:700, color:anio>=anioActual?V.ink3:V.ink2, cursor:anio>=anioActual?'not-allowed':'pointer', fontFamily:"'Nunito',sans-serif" }}>{anio+1} ›</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:V.surface, borderRadius:12, padding:4, border:`1.5px solid ${V.border}` }}>
          {([
            { id:'financiero', label:'📊 Ingresos y proyección' },
            { id:'cobranzas',  label:'🧾 Control de cobranzas' },
          ] as const).map(tab => (
            <button key={tab.id} onClick={()=>setTabActiva(tab.id)} style={{
              flex:1, padding:'10px', border:'none', borderRadius:8,
              background:tabActiva===tab.id?V.teal:'transparent',
              color:tabActiva===tab.id?'#fff':V.ink3,
              fontSize:13, fontWeight:tabActiva===tab.id?800:600,
              cursor:'pointer', fontFamily:"'Nunito',sans-serif", transition:'all .15s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* ── TAB FINANCIERO ── */}
        {tabActiva === 'financiero' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
              {[
                { label:'Facturado en el año', valor:money(totalAnio), sub:`Hasta ${MESES_FULL[mesActual]}`, color:V.teal },
                { label:'Promedio mensual', valor:money(promedioMensual), sub:'Meses con ingresos', color:V.tealDark },
                { label:'Proyección anual', valor:money(proyeccionAnual), sub:'A este ritmo', color:pctLimite>=90?V.red:pctLimite>=75?V.amber:V.green },
                { label:'Disponible en categoría', valor:money(disponible), sub:`Cat. ${catLabel} · ${pctLimite}% usado`, color:pctLimite>=90?V.red:pctLimite>=75?V.amber:V.green },
              ].map((k,i) => (
                <div key={i} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 4px rgba(13,92,120,.06)' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:V.ink3, marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>{k.label}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:k.color, lineHeight:1, marginBottom:4 }}>{k.valor}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:V.ink3 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Barra de límite de categoría */}
            {perfil?.tipo_contribuyente === 'mono' && (
              <div style={{ background:V.surface, border:`1.5px solid ${pctLimite>=90?V.redRing:pctLimite>=75?V.amberRing:V.border}`, borderRadius:14, padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:10 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>Progreso en categoría {catLabel}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:pctLimite>=90?V.red:pctLimite>=75?V.amber:V.green }}>{pctLimite}% del límite</div>
                </div>
                <div style={{ height:12, background:V.border, borderRadius:999, overflow:'hidden', marginBottom:10 }}>
                  <div style={{ height:'100%', borderRadius:999, width:`${pctLimite}%`, transition:'width .5s ease', background:pctLimite>=90?`linear-gradient(90deg,${V.red},#f87171)`:pctLimite>=75?`linear-gradient(90deg,${V.amber},#fbbf24)`:`linear-gradient(90deg,${V.teal},#34d399)` }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:600, color:V.ink3 }}>
                  <span>Facturado: {money(ingresosHastaHoy)}</span>
                  <span>Límite anual: {money(limiteAnual)}</span>
                </div>
                {pctLimite >= 75 && (
                  <div style={{ marginTop:10, padding:'10px 14px', background:pctLimite>=90?V.redBg:V.amberBg, borderRadius:8, fontSize:12, fontWeight:700, color:pctLimite>=90?V.red:V.amber }}>
                    {pctLimite>=90
                      ? '🔴 Estás muy cerca del límite. Evaluá recategorizarte o pasarte a RI.'
                      : '⚠️ Vas a buen ritmo. Revisá si necesitás recategorizarte.'}
                  </div>
                )}
              </div>
            )}

            {/* Gráfico de barras de ingresos */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:'20px', boxShadow:'0 1px 4px rgba(13,92,120,.06)' }}>
              <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:20 }}>Ingresos mensuales {anio}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:6, alignItems:'flex-end', height:160, marginBottom:12 }}>
                {ingresos.map((val, i) => {
                  const alto = maxMes > 0 ? Math.max((val/maxMes)*140, val>0?8:0) : 0
                  const esMesActual = i === mesActual && anio === anioActual
                  return (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
                      <div
                        onClick={() => { setEditMes(i); setEditVal(val>0?String(val):'') }}
                        title={`${MESES_FULL[i]}: ${money(val)}`}
                        style={{
                          width:'100%', height:alto, minHeight: val>0?8:4,
                          background: esMesActual ? `linear-gradient(180deg,${V.gold},${V.goldRing})` : val>0?`linear-gradient(180deg,${V.teal},${V.tealDark})`:'rgba(0,0,0,.06)',
                          borderRadius:'4px 4px 0 0', cursor:'pointer', transition:'opacity .15s',
                        }}
                      />
                      <div style={{ fontSize:9, fontWeight:700, color:esMesActual?V.gold:V.ink3, textAlign:'center' }}>{MESES[i]}</div>
                    </div>
                  )
                })}
              </div>

              {/* Modal edición inline */}
              {editMes !== null && (
                <div style={{ background:V.tealLight, border:`1.5px solid ${V.tealRing}`, borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:V.tealDark }}>Ingresos {MESES_FULL[editMes]}:</span>
                  <input
                    autoFocus
                    type="number"
                    placeholder="Ej: 450000"
                    value={editVal}
                    onChange={e=>setEditVal(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&guardarIngreso(editMes)}
                    style={{ ...inp, width:160, flex:'none' }}
                  />
                  <button onClick={()=>guardarIngreso(editMes!)} disabled={savingMes} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
                    {savingMes?'Guardando...':'Guardar'}
                  </button>
                  <button onClick={()=>setEditMes(null)} style={{ background:'none', border:'none', color:V.ink3, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>Cancelar</button>
                </div>
              )}
              {editMes === null && (
                <p style={{ fontSize:11, color:V.ink3, fontWeight:600, margin:'8px 0 0', textAlign:'center' }}>
                  Hacé clic en cualquier barra para cargar o editar el ingreso de ese mes.
                </p>
              )}
            </div>

            {/* Predicción de caja */}
            {promedioMensual > 0 && (
              <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:'20px', boxShadow:'0 1px 4px rgba(13,92,120,.06)' }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:16 }}>🔮 Predicción de caja</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:10 }}>
                  {[
                    { label:'Ingreso esperado próximo mes', valor:money(promedioMensual), desc:'Basado en tu promedio histórico' },
                    { label:'Impuestos estimados próx. mes', valor:money(promedioMensual * (perfil?.tipo_contribuyente==='mono'?0.04:0.31)), desc:perfil?.tipo_contribuyente==='mono'?'~4% de tus ingresos':'IVA + Ganancias estimados' },
                    { label:'Neto estimado próx. mes', valor:money(promedioMensual * (perfil?.tipo_contribuyente==='mono'?0.96:0.69)), desc:'Después de impuestos' },
                  ].map((item,i) => (
                    <div key={i} style={{ background:V.bg, borderRadius:10, padding:'14px 16px', border:`1px solid ${V.border}` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:V.ink3, marginBottom:6, lineHeight:1.3 }}>{item.label}</div>
                      <div style={{ fontSize:20, fontWeight:900, color:V.tealDark }}>{item.valor}</div>
                      <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:4 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── TAB COBRANZAS ── */}
        {tabActiva === 'cobranzas' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* KPIs cobranzas */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
              {[
                { label:'Por cobrar', valor:money(totalPendiente), count:pendientes.length, color:V.amber },
                { label:'Cobrado', valor:money(totalCobrado), count:cobradas.length, color:V.green },
                { label:'Vencidas', valor:money(vencidas.reduce((a,f)=>a+f.monto,0)), count:vencidas.length, color:V.red },
              ].map((k,i) => (
                <div key={i} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:'16px 18px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:V.ink3, marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>{k.label}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:k.color }}>{k.valor}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:V.ink3 }}>{k.count} factura{k.count!==1?'s':''}</div>
                </div>
              ))}
            </div>

            {/* Nueva factura */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${V.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>Facturas y cobros</div>
                <button onClick={()=>setShowNuevaFactura(v=>!v)} style={{ background:V.teal, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
                  {showNuevaFactura?'Cancelar':'+ Nueva'}
                </button>
              </div>

              {showNuevaFactura && (
                <div style={{ padding:'18px 20px', background:V.tealLight, borderBottom:`1px solid ${V.tealRing}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Cliente *</label>
                    <input type="text" placeholder="Nombre del cliente" value={nfCliente} onChange={e=>setNfCliente(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Monto *</label>
                    <input type="number" placeholder="Ej: 150000" value={nfMonto} onChange={e=>setNfMonto(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Concepto</label>
                    <input type="text" placeholder="Descripción del servicio" value={nfConcepto} onChange={e=>setNfConcepto(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Fecha de vencimiento</label>
                    <input type="date" value={nfVto} onChange={e=>setNfVto(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>N° de factura (opcional)</label>
                    <input type="text" placeholder="Ej: 00001-00000001" value={nfNumero} onChange={e=>setNfNumero(e.target.value)} style={inp} />
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end' }}>
                    <button onClick={guardarFactura} disabled={savingFactura||!nfCliente||!nfMonto} style={{ background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif", width:'100%', opacity:savingFactura||!nfCliente||!nfMonto?.6:1 }}>
                      {savingFactura?'Guardando...':'Guardar factura →'}
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de facturas */}
              <div>
                {facturas.length === 0 ? (
                  <div style={{ padding:'32px 20px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>🧾</div>
                    <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0 }}>Todavía no cargaste facturas. Hacé clic en "+ Nueva" para empezar.</p>
                  </div>
                ) : facturas.map((f,i) => {
                  const vencida = f.estado==='pendiente' && f.fecha_vto && new Date(f.fecha_vto) < new Date()
                  const colorEstado = f.estado==='cobrada'?V.green:f.estado==='vencida'||vencida?V.red:f.estado==='cancelada'?V.ink3:V.amber
                  return (
                    <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 20px', borderBottom:i<facturas.length-1?`1px solid ${V.border}`:'none', flexWrap:'wrap' }}>
                      <div style={{ flex:1, minWidth:180 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:V.ink }}>{f.cliente}</div>
                        {f.concepto && <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:1 }}>{f.concepto}</div>}
                        {f.numero && <div style={{ fontSize:10, color:V.ink3, marginTop:1 }}>N° {f.numero}</div>}
                      </div>
                      <div style={{ textAlign:'right', minWidth:100 }}>
                        <div style={{ fontSize:15, fontWeight:900, color:V.ink }}>${f.monto.toLocaleString('es-AR')}</div>
                        {f.fecha_vto && <div style={{ fontSize:10, color:vencida?V.red:V.ink3, fontWeight:600 }}>Vto: {new Date(f.fecha_vto).toLocaleDateString('es-AR')}</div>}
                      </div>
                      <select
                        value={f.estado}
                        onChange={e=>cambiarEstado(f.id, e.target.value as Factura['estado'])}
                        style={{ border:`1.5px solid ${colorEstado}`, borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:700, color:colorEstado, background:`${colorEstado}15`, outline:'none', cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}
                      >
                        <option value="pendiente">⏳ Pendiente</option>
                        <option value="cobrada">✅ Cobrada</option>
                        <option value="vencida">🔴 Vencida</option>
                        <option value="cancelada">❌ Cancelada</option>
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
