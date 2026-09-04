'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import CapturaEmail from '@/components/CapturaEmail'
import { SEOMonotributo } from '@/components/SEOContent/SEOContent'
import { useFiscalData } from '@/components/FiscalDataProvider'
import {
  FALLBACK_VENC, FALLBACK_ALERTAS,
  addFecha, diffDias, fmtLarga, fmtCorta, money,
  type VencimientoUI, type AlertaUI,
} from '@/lib/data'

const TIPO = 'mono'

const V = {
  tealDark:'#0d5c78', teal:'#1a7fa8', tealMid:'#2490bc', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
  gold:'#f5a623', goldDark:'#e8920a', goldLight:'#fff8ec', goldRing:'#fde4a0',
  red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
  amber:'#d97706', amberBg:'#fffbeb', amberRing:'#fde68a',
  green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed',
  ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
}

function cardCfg(d: number) {
  return d === 0
    ? { bg:`linear-gradient(150deg,#fff 65%,${V.redBg})`,  border:V.redRing,  iconBg:V.redBg,  pill:{bg:V.redBg,  color:V.red,      border:V.redRing},  txt:'🔴 Vence HOY', diasColor:V.red,   diasTxt:'¡HOY!',     btnDanger:true }
    : d === 1
    ? { bg:`linear-gradient(150deg,#fff 65%,${V.goldLight})`,border:V.goldRing,iconBg:V.goldLight,pill:{bg:V.goldLight,color:V.amber,  border:V.goldRing}, txt:'🟡 Mañana',     diasColor:V.amber, diasTxt:'Mañana',     btnDanger:false }
    : { bg:`linear-gradient(150deg,#fff 65%,${V.tealLight})`,border:V.tealRing,iconBg:V.tealLight,pill:{bg:V.tealLight,color:V.tealDark,border:V.tealRing},txt:`🟢 En ${d} días`,diasColor:V.teal, diasTxt:`En ${d} días`,btnDanger:false }
}

export default function Home() {
  const { categorias } = useFiscalData()
  const [venc, setVenc]           = useState<VencimientoUI[]>([])
  const [alertas, setAlertas]     = useState<AlertaUI[]>([])
  const [catIdx, setCatIdx]       = useState('')
  const [conOS, setConOS]         = useState(true)
  const [actividad, setActividad] = useState<'servicios'|'productos'>('servicios')
  const [aiQuery, setAiQuery]     = useState('')
  const [aiResp, setAiResp]       = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [mounted, setMounted]     = useState(false)
  const capturaRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    fetch(`/api/vencimientos?tipo=${TIPO}`)
      .then(r => r.json()).then(d => setVenc((d.vencimientos || []).map(addFecha)))
      .catch(() => setVenc(FALLBACK_VENC[TIPO].map(addFecha)))
    fetch(`/api/alerts?tipo=${TIPO}`)
      .then(r => r.json()).then(d => setAlertas(d.alerts || FALLBACK_ALERTAS[TIPO]))
      .catch(() => setAlertas(FALLBACK_ALERTAS[TIPO]))
  }, [])

  async function askAI(q?: string) {
    const query = q || aiQuery
    if (!query.trim()) return
    if (q) setAiQuery(q)
    setAiLoading(true); setAiResp('')
    try {
      const r = await fetch('/api/fiscal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query }) })
      const d = await r.json()
      setAiResp(d.response || 'Sin respuesta.')
    } catch { setAiResp('Error de conexión.') }
    finally { setAiLoading(false) }
  }

  const vencOrd = useMemo(() => [...venc].filter(v => diffDias(v.fecha) >= 0).sort((a, b) => diffDias(a.fecha) - diffDias(b.fecha)), [venc])
  const cards   = useMemo(() => vencOrd.slice(0, 3), [vencOrd])
  const proximos = useMemo(() => vencOrd.filter(v => diffDias(v.fecha) <= 10).slice(0, 8), [vencOrd])
  const idx     = useMemo(() => parseInt(catIdx), [catIdx])
  const os      = useMemo(() => conOS ? (categorias[idx]?.os ?? 0) : 0, [conOS, categorias, idx])
  const impuesto = catIdx === '' ? 0 : actividad === 'productos' ? (categorias[idx].imp_productos ?? categorias[idx].imp) : categorias[idx].imp
  const total   = useMemo(() => catIdx === '' ? 0 : impuesto + categorias[idx].prev + os, [catIdx, categorias, idx, os, impuesto])
  const fechaHoy = mounted ? new Intl.DateTimeFormat('es-AR', { weekday:'long', day:'numeric', month:'long' }).format(new Date()) : ''

  return (
    <>
      <SiteHeader
        currentPath="/"
        onAlertasClick={() => {
          capturaRef.current?.scrollIntoView({ behavior: 'smooth' })
          setTimeout(() => capturaRef.current?.focus(), 600)
        }}
      />

      <div className="ff-page-content">
        {/* HERO */}
        <div className="ff-hero" style={{ background:`linear-gradient(135deg,${V.tealDark} 0%,${V.teal} 100%)`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:'50%', top:-80, transform:'translateX(-50%)', width:500, height:300, borderRadius:'50%', background:'rgba(255,255,255,.04)' }} />
          <div style={{ maxWidth:640, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div className="ff-social-proof"><span>🇦🇷</span> Monotributo 2026 · Información actualizada</div>
            <h1>Todo sobre el Monotributo,<br/>explicado fácil</h1>
            <p>Calculá tu categoría, consultá cuánto pagás<br/>y controlá tus próximos vencimientos.</p>
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              <Link href="/mi-categoria" className="ff-hero-btn">Calcular mi categoría →</Link>
              <Link href="/calendario-fiscal" className="ff-hero-btn" style={{background:'white',color:V.tealDark}}>Ver vencimientos</Link>
            </div>
            <div style={{ marginTop:10, fontSize:11, color:'rgba(255,255,255,.5)', fontWeight:600 }}>Sin registro · Sin tarjeta · Gratis</div>
          </div>
        </div>

        <section style={{background:V.surface,borderBottom:`1px solid ${V.border}`}} aria-label="Accesos rápidos de Monotributo">
          <div style={{maxWidth:860,margin:'0 auto',padding:'18px 16px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
            <Link href="/mi-categoria" className="ff-card-link">📊 Conocer mi categoría</Link>
            <a href="#cuota-monotributo" className="ff-card-link">💳 Consultar mi cuota</a>
            <a href="#vencimientos-monotributo" className="ff-card-link">📅 Próximos vencimientos</a>
          </div>
        </section>

        <main className="ff-main">
          <div id="vencimientos-monotributo" style={{scrollMarginTop:90}}>
            {/* DATE STRIP */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontSize:13, color:V.ink3, fontWeight:600 }}>Hoy es <strong style={{ color:V.ink2 }}>{fechaHoy}</strong></div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:V.tealLight, border:`1.5px solid ${V.tealRing}`, borderRadius:20, padding:'4px 12px 4px 8px', fontSize:12, fontWeight:800, color:V.tealDark }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:V.teal, flexShrink:0 }} />
                Monotributo
              </div>
            </div>
          </div>

          {/* VENCIMIENTOS */}
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:'1.5px', textTransform:'uppercase', color:V.ink3, marginBottom:12 }}>📅 Próximos vencimientos</div>
          <div className="ff-cards-grid">
            {cards.length === 0
              ? <div style={{ padding:'20px 0', color:V.ink3, fontSize:13, fontWeight:600 }}>✅ Sin vencimientos próximos inmediatos.</div>
              : cards.map((v, i) => {
                  const d = diffDias(v.fecha); const c = cardCfg(d)
                  return (
                    <div key={v.id} style={{ background:c.bg, border:`1.5px solid ${c.border}`, borderRadius:16, padding:'18px 18px 14px', display:'flex', flexDirection:'column', gap:12, boxShadow:`0 1px 4px rgba(13,92,120,.07)`, animation:`cardUp .35s ease ${i*.09}s both` }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                        <div style={{ width:40, height:40, borderRadius:11, background:c.iconBg, border:`1.5px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>{v.emoji}</div>
                        <div style={{ background:c.pill.bg, color:c.pill.color, border:`1.5px solid ${c.pill.border}`, display:'inline-flex', alignItems:'center', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:800, flexShrink:0 }}>{c.txt}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:900, color:V.ink, letterSpacing:'-0.2px', lineHeight:1.2, marginTop:6 }}>{v.nombre}</div>
                        <div style={{ fontSize:12, color:V.ink3, fontWeight:600, marginTop:2 }}>{v.detalle}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid ${V.border}`, paddingTop:10 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:V.ink2 }}>{fmtLarga(v.fecha)}</div>
                        <div style={{ fontSize:13, fontWeight:900, color:c.diasColor }}>{c.diasTxt}</div>
                      </div>
                      <button onClick={() => window.open('https://www.arca.gob.ar','_blank')} style={{ width:'100%', borderRadius:8, padding:10, fontSize:13, fontWeight:800, background:c.btnDanger?V.red:V.bg, color:c.btnDanger?'white':V.ink2, border:c.btnDanger?`1.5px solid ${V.red}`:`1.5px solid ${V.border}` }}>
                        {d===0?'Pagar ahora →':d===1?'Ver cómo pagar':'Ver detalles'}
                      </button>
                    </div>
                  )
                })
            }
          </div>

          {/* PRÓXIMOS (Lista del mes) */}
          <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden', marginBottom:20, boxShadow:`0 1px 4px rgba(13,92,120,.07)` }}>
            <div style={{ padding:'13px 16px', borderBottom:`1px solid ${V.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:14, fontWeight:800, color:V.ink }}>📋 Lista de vencimientos del mes</div>
              <div style={{ fontSize:11, fontWeight:700, background:V.tealLight, color:V.tealDark, border:`1px solid ${V.tealRing}`, borderRadius:20, padding:'2px 9px' }}>{proximos.length} vto{proximos.length!==1?'s':''}</div>
            </div>
            <div>
              {proximos.length === 0
                ? <div style={{ padding:'14px 16px', color:V.ink3, fontSize:13, fontWeight:600 }}>Sin vencimientos en los próximos 10 días.</div>
                : proximos.map(v => {
                    const d = diffDias(v.fecha)
                    const dot = d===0?V.red:d<=3?V.gold:V.teal
                    const mb = d===0?{bg:V.redBg,color:V.red,border:`1px solid ${V.redRing}`,txt:'HOY'}:d===1?{bg:V.amberBg,color:V.amber,border:`1px solid ${V.amberRing}`,txt:'Mañana'}:d<=4?{bg:V.amberBg,color:V.amber,border:`1px solid ${V.amberRing}`,txt:`${d}d`}:{bg:V.tealLight,color:V.tealDark,border:`1px solid ${V.tealRing}`,txt:`${d}d`}
                    return (
                      <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom:`1px solid ${V.border}` }}>
                        <div style={{ width:9, height:9, borderRadius:'50%', background:dot, flexShrink:0 }} />
                        <div style={{ fontSize:12, fontWeight:800, color:V.ink3, minWidth:60 }}>{fmtCorta(v.fecha)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:V.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.emoji} {v.nombre}</div>
                          <div style={{ fontSize:11, color:V.ink3, fontWeight:600 }}>{v.detalle}</div>
                        </div>
                        <div style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20, background:mb.bg, color:mb.color, border:mb.border, flexShrink:0 }}>{mb.txt}</div>
                      </div>
                    )
                  })
              }
            </div>
          </div>

          {/* ALERTAS + CALCULADORA */}
          <div className="ff-two-col">
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden', boxShadow:`0 1px 4px rgba(13,92,120,.07)` }}>
              <div style={{ padding:'13px 16px', borderBottom:`1px solid ${V.border}`, fontSize:14, fontWeight:800, color:V.ink }}>⚠️ Alertas importantes</div>
              {alertas.map(a => {
                const ib = a.tipo==='danger'?{bg:V.redBg,border:`1.5px solid ${V.redRing}`}:a.tipo==='info'?{bg:V.tealLight,border:`1.5px solid ${V.tealRing}`}:{bg:V.goldLight,border:`1.5px solid ${V.goldRing}`}
                return (
                  <div key={a.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'11px 16px', borderBottom:`1px solid ${V.border}` }}>
                    <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, ...ib }}>{a.icon}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:V.ink, marginBottom:2 }}>{a.title}</div>
                      <div style={{ fontSize:11, color:V.ink3, fontWeight:600, lineHeight:1.5 }}>{a.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div id="cuota-monotributo" style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden', boxShadow:`0 1px 4px rgba(13,92,120,.07)`, scrollMarginTop:90 }}>
              <div style={{ padding:'13px 16px', borderBottom:`1px solid ${V.border}`, fontSize:14, fontWeight:800, color:V.ink }}>🧮 ¿Cuánto tengo que pagar?</div>
              <div style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.8px', textTransform:'uppercase', color:V.ink3, marginBottom:5 }}>Tu categoría</div>
                <select value={catIdx} onChange={e => setCatIdx(e.target.value)} style={{ width:'100%', border:`1.5px solid ${V.border}`, borderRadius:8, padding:'9px 10px', fontSize:13, fontWeight:600, color:V.ink, background:V.bg, outline:'none', marginBottom:10 }}>
                  <option value="" disabled>— Elegí tu categoría —</option>
                  {categorias.map((c, i) => <option key={c.letra} value={i}>{c.letra} — {money(c.limite_anual)}/año</option>)}
                </select>
                <div style={{ fontSize:11,fontWeight:800,color:V.ink3,marginBottom:5 }}>ACTIVIDAD</div>
                <select value={actividad} onChange={e=>setActividad(e.target.value as 'servicios'|'productos')} style={{width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'9px 10px',marginBottom:10,background:V.bg}}><option value="servicios">Servicios / locaciones</option><option value="productos">Venta de cosas muebles</option></select>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:'0.8px', textTransform:'uppercase', color:V.ink3, marginBottom:5 }}>Obra social</div>
                <select value={conOS?'si':'no'} onChange={e => setConOS(e.target.value==='si')} style={{ width:'100%', border:`1.5px solid ${V.border}`, borderRadius:8, padding:'9px 10px', fontSize:13, fontWeight:600, color:V.ink, background:V.bg, outline:'none', marginBottom:10 }}>
                  <option value="si">Incluir obra social</option>
                  <option value="no">Sin obra social</option>
                </select>
                <div style={{ background:`linear-gradient(135deg,${V.tealDark},${V.tealMid})`, borderRadius:8, padding:'16px', textAlign:'center', minHeight:80, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  {catIdx !== '' ? <>
                    <div style={{ fontSize:28, fontWeight:900, color:'white', letterSpacing:'-0.5px', lineHeight:1, marginBottom:4 }}>{money(total)}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.65)', fontWeight:600, marginBottom:8 }}>por mes · vigente desde agosto 2026</div>
                    <div className="ff-calc-break" style={{ width:'100%' }}>
                      {([['Imp.', impuesto], ['Prev.', categorias[idx].prev], ...(os ? [['OS', os]] : [])] as [string, number][]).map(([l, val]) => (
                        <div key={l} style={{ background:'rgba(255,255,255,.1)', borderRadius:6, padding:'5px 6px', textAlign:'center' }}>
                          <div style={{ fontSize:8, color:'rgba(255,255,255,.55)', fontWeight:700, textTransform:'uppercase' }}>{l}</div>
                          <div style={{ fontSize:12, fontWeight:900, color:'white', marginTop:1 }}>{money(val)}</div>
                        </div>
                      ))}
                    </div>
                  </> : <div style={{ fontSize:14, fontWeight:700, color:'rgba(255,255,255,.4)' }}>Seleccioná una categoría</div>}
                </div>
              </div>
            </div>
          </div>

          {/* AI */}
          <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden', marginBottom:20, boxShadow:`0 1px 4px rgba(13,92,120,.07)` }}>
            <div style={{ background:'#0a0a1a', color:'white', padding:'9px 14px', display:'flex', alignItems:'center', gap:7, fontSize:11, letterSpacing:'1.2px', textTransform:'uppercase', fontWeight:700 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#4caf50', boxShadow:'0 0 0 3px rgba(76,175,80,.2)', flexShrink:0 }} />
              Asistente IA · Consultas fiscales
            </div>
            <div style={{ padding:'12px 14px' }}>
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key==='Enter'&&askAI()} placeholder="¿Cuándo vence el monotributo este mes?"
                  style={{ flex:1, border:`1.5px solid ${V.border}`, borderRadius:8, padding:'9px 10px', fontSize:13, fontWeight:600, color:V.ink, background:V.bg, outline:'none' }}/>
                <button onClick={() => askAI()} disabled={aiLoading} style={{ background:V.teal, color:'white', border:'none', borderRadius:8, padding:'9px 14px', fontSize:13, fontWeight:800, opacity:aiLoading?.6:1, whiteSpace:'nowrap' }}>
                  {aiLoading?'…':'Consultar →'}
                </button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {['Vencimientos esta semana','Cuánto pago','Novedades ARCA','Ver deuda AFIP'].map(c => (
                  <button key={c} onClick={() => askAI(c)} style={{ background:V.bg, border:`1px solid ${V.border}`, borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700, color:V.ink3 }}>{c}</button>
                ))}
              </div>
              {(aiLoading||aiResp) && <div style={{ marginTop:10, padding:'10px 12px', background:V.bg, borderRadius:8, borderLeft:`3px solid ${V.teal}`, fontSize:13, color:V.ink2, fontWeight:600, lineHeight:1.75, whiteSpace:'pre-wrap' }}>
                {aiLoading ? <span style={{ color:V.ink3 }}>Consultando ARCA/AFIP…</span> : aiResp}
              </div>}
            </div>
          </div>        

          {/* DOLOR */}
          <section style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, marginBottom:20, overflow:'hidden' }} aria-labelledby="errores-monotributo">
            <div style={{ padding:'20px 16px' }}>
              <div style={{ textAlign:'center', marginBottom:14 }}>
                <div style={{ fontSize:13, fontWeight:800, color:V.red, marginBottom:4 }}>⚠️ Evitá problemas con ARCA</div>
                <h2 id="errores-monotributo" style={{ fontSize:16, fontWeight:900, color:V.ink, letterSpacing:'-0.2px', margin:0 }}>Errores comunes que te pueden costar caro</h2>
              </div>
              <div className="ff-dolor-grid">
                {[
                  { icon:'❌', txt:'Pagan la categoría incorrecta' },
                  { icon:'❌', txt:'No saben cuándo recategorizarse' },
                  { icon:'❌', txt:'Emiten facturas con errores' },
                  { icon:'❌', txt:'Se enteran del vencimiento tarde' },
                ].map(e => (
                  <div key={e.txt} style={{ display:'flex', gap:8, alignItems:'flex-start', background:V.redBg, border:`1px solid ${V.redRing}`, borderRadius:10, padding:'10px 12px' }}>
                    <span style={{ fontSize:13, flexShrink:0 }}>{e.icon}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'#7a2020', lineHeight:1.4 }}>{e.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SEO: Contenido informativo */}
          <SEOMonotributo />

          {/* SEO: Calculadoras */}
          <section style={{ marginTop:32 }}>
            <h2 style={{ fontSize:17, fontWeight:900, marginBottom:12, color:V.ink }}>Calculadoras de impuestos</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:10 }}>
              <Link href="/iva"                    className="ff-card-link">🧾 Calculadora de IVA</Link>
              <Link href="/ingresos-brutos"        className="ff-card-link">📊 Ingresos Brutos</Link>
              <Link href="/impuesto-ganancias"     className="ff-card-link">💼 Ganancias</Link>
              <Link href="/impuestos-importacion"  className="ff-card-link">📦 Importaciones</Link>
              <Link href="/impuestos-por-provincia"className="ff-card-link">🗺️ Por provincia</Link>
              <Link href="/calendario-fiscal"      className="ff-card-link">📅 Calendario Fiscal 2026</Link>
            </div>
          </section>


          {/* CAPTURA EMAIL */}
          <div style={{ marginTop:24 }}>
            <CapturaEmail ref={capturaRef} tipoDefault="mono" />
          </div>

          <section style={{marginTop:24,padding:20,border:`1.5px solid ${V.tealRing}`,borderRadius:14,background:V.tealLight}} aria-labelledby="otro-regimen">
            <h2 id="otro-regimen" style={{fontSize:17,fontWeight:900,color:V.tealDark,margin:'0 0 6px'}}>¿Todavía no sabés qué régimen te conviene?</h2>
            <p style={{fontSize:13,color:V.ink2,lineHeight:1.6,fontWeight:600,margin:'0 0 14px'}}>Compará Monotributo, Régimen General y sociedad según tu actividad, facturación y forma de trabajar.</p>
            <Link href="/crear-negocio" className="ff-hero-btn" style={{display:'inline-flex',fontSize:13,padding:'10px 16px'}}>Evaluar mi negocio →</Link>
          </section>

        </main>
      </div>

    </>
  )
}
