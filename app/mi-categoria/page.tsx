'use client'
import { useState, useEffect } from 'react'
import SiteHeader from '@/components/SiteHeader'

const CATEGORIAS = [
  { letra:'A', limite:6450000,   imp:11000,  prev:28000 },
  { letra:'B', limite:9450000,   imp:12400,  prev:28000 },
  { letra:'C', limite:13250000,  imp:13900,  prev:28000 },
  { letra:'D', limite:16450000,  imp:17000,  prev:28000 },
  { letra:'E', limite:19350000,  imp:20500,  prev:28000 },
  { letra:'F', limite:24250000,  imp:25000,  prev:28000 },
  { letra:'G', limite:29000000,  imp:30000,  prev:28000 },
  { letra:'H', limite:44000000,  imp:42000,  prev:28000 },
  { letra:'I', limite:52000000,  imp:55000,  prev:28000 },
  { letra:'J', limite:62000000,  imp:70000,  prev:28000 },
  { letra:'K', limite:72000000,  imp:85000,  prev:28000 },
]
const OS_EXTRA = 14000

export default function MiCategoria() {
  const [facturacion, setFacturacion] = useState('')
  const [conOS, setConOS]             = useState(true)
  const [paso, setPaso]               = useState<'calc'|'email'|'result'>('calc')
  const [email, setEmail]             = useState('')
  const [emailOk, setEmailOk]         = useState(false)
  const [emailErr, setEmailErr]       = useState('')
  const [resultado, setResultado]     = useState<typeof CATEGORIAS[0]|null>(null)
  const [excede, setExcede]           = useState(false)
  const [aiQuery, setAiQuery]         = useState('')
  const [aiResp, setAiResp]           = useState('')
  const [aiLoad, setAiLoad]           = useState(false)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => setMounted(true), [])

  function calcular() {
    const monto = parseFloat(facturacion.replace(/\./g,'').replace(',','.'))
    if (isNaN(monto) || monto <= 0) return
    const anual = monto * 12
    const cat = CATEGORIAS.find(c => anual <= c.limite)
    if (cat) { setResultado(cat); setExcede(false) }
    else { setResultado(null); setExcede(true) }
    setPaso('email')
  }

  async function submitEmail() {
    if (!email || !email.includes('@')) { setEmailErr('Ingresá un email válido'); return }
    setEmailErr('')
    try {
      await fetch('/api/suscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tipos: ['mono'] }),
      })
    } catch {}
    setEmailOk(true)
    setPaso('result')
  }

  function saltearEmail() {
    setPaso('result')
  }

  async function askAI(q?: string) {
    const query = q || aiQuery
    if (!query.trim()) return
    if (q) setAiQuery(q)
    setAiLoad(true); setAiResp('')
    try {
      const r = await fetch('/api/fiscal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ query }) })
      const d = await r.json()
      setAiResp(d.response || 'Sin respuesta.')
    } catch { setAiResp('Error de conexión.') }
    finally { setAiLoad(false) }
  }

  function money(n: number) { return '$' + n.toLocaleString('es-AR') }

  const V = {
    tealDark:'#0d5c78', teal:'#1a7fa8', tealMid:'#2490bc', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
    gold:'#f5a623', goldLight:'#fff8ec', goldRing:'#fde4a0',
    red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
    green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
    bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed',
    ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
  }

  if (!mounted) return null

  return (
    <>
      <SiteHeader currentPath="/mi-categoria" />

      <div className="ff-page-content">
      <main style={{maxWidth:860,margin:'0 auto',padding:'32px 24px 80px'}}>

        {/* HERO */}
        <div style={{background:`linear-gradient(135deg,${V.tealDark},${V.teal})`,borderRadius:16,padding:'28px 32px',marginBottom:28,color:'white',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:8}}>Calculadora de monotributo · Argentina 2026</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:'-0.3px',marginBottom:6}}> Calculá tu categoría en segundos</div>
          <div style={{fontSize:14,color:'rgba(255,255,255,.75)',fontWeight:600}}>Ingresá tu facturación y evitá errores con AFIP</div>
        </div>

        {/* CALCULADORA — PASO 1: INGRESAR MONTO */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:14,fontWeight:800,color:V.ink}}>Paso 1 — Ingresá tu facturación</div>
            {paso!=='calc'&&<button onClick={()=>setPaso('calc')} style={{fontSize:12,fontWeight:700,color:V.teal,background:'none',border:'none'}}>← Modificar</button>}
          </div>
          <div style={{padding:'20px 18px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
              <div>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.8px',textTransform:'uppercase',color:V.ink3,marginBottom:6}}>Facturación mensual promedio</div>
                <div style={{display:'flex',alignItems:'center',border:`1.5px solid ${V.border}`,borderRadius:8,overflow:'hidden',background:V.bg}}>
                  <span style={{padding:'10px 12px',fontSize:14,fontWeight:700,color:V.ink3,borderRight:`1px solid ${V.border}`}}>$</span>
                  <input type="number" placeholder="Ej: 1500000" value={facturacion}
                    onChange={e=>setFacturacion(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&calcular()}
                    disabled={paso!=='calc'}
                    style={{flex:1,border:'none',padding:'10px 12px',fontSize:14,fontWeight:600,color:V.ink,background:'transparent',outline:'none',opacity:paso!=='calc'?.6:1}}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.8px',textTransform:'uppercase',color:V.ink3,marginBottom:6}}>Obra social</div>
                <select value={conOS?'si':'no'} onChange={e=>setConOS(e.target.value==='si')}
                  disabled={paso!=='calc'}
                  style={{width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:14,fontWeight:600,color:V.ink,background:V.bg,outline:'none',opacity:paso!=='calc'?.6:1}}>
                  <option value="si">Incluir obra social</option>
                  <option value="no">Sin obra social</option>
                </select>
              </div>
            </div>
            {paso==='calc'&&(
              <button onClick={calcular} style={{width:'100%',background:V.teal,color:'white',border:'none',borderRadius:8,padding:12,fontSize:14,fontWeight:800}}>
                Ver mi categoría →
              </button>
            )}
          </div>
        </div>

        {/* PASO 2: CAPTURA EMAIL */}
        {paso==='email'&&(
          <div style={{background:V.surface,border:`2px solid ${V.teal}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 4px 20px rgba(26,127,168,.15)`,animation:'fadeIn .3s ease'}}>
            <div style={{background:`linear-gradient(135deg,${V.tealDark},${V.teal})`,padding:'14px 18px',display:'flex',alignItems:'center',gap:8}}>
              <div style={{fontSize:14,fontWeight:800,color:'white'}}>Paso 2 — Recibí el resultado por email</div>
              <div style={{marginLeft:'auto',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.7)'}}>+ alertas de vencimientos gratis</div>
            </div>
            <div style={{padding:'20px 18px'}}>
              <p style={{fontSize:13,color:V.ink2,fontWeight:600,marginBottom:14,lineHeight:1.6}}>
                Ingresá tu email y te mandamos el resultado + te avisamos <strong>antes de cada vencimiento</strong> de monotributo.
              </p>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <input type="email" placeholder="tu@email.com" value={email}
                  onChange={e=>{setEmail(e.target.value);setEmailErr('')}}
                  onKeyDown={e=>e.key==='Enter'&&submitEmail()}
                  style={{flex:1,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 14px',fontSize:14,fontWeight:600,color:V.ink,background:V.bg,outline:'none'}}/>
                <button onClick={submitEmail} style={{background:V.gold,color:V.ink,border:'none',borderRadius:8,padding:'10px 20px',fontSize:13,fontWeight:900,whiteSpace:'nowrap',boxShadow:`0 2px 8px rgba(245,166,35,.35)`}}>
                  Ver resultado →
                </button>
              </div>
              {emailErr&&<div style={{fontSize:12,color:V.red,fontWeight:600,marginBottom:6}}>{emailErr}</div>}
              <button onClick={saltearEmail} style={{fontSize:12,color:V.ink3,fontWeight:600,background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
                Ver resultado sin suscribirme
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: RESULTADO */}
        {paso==='result'&&(
          <div style={{animation:'fadeIn .3s ease',marginBottom:24}}>
            {emailOk&&(
              <div style={{background:V.greenBg,border:`1px solid ${V.greenRing}`,borderRadius:10,padding:'10px 16px',marginBottom:14,fontSize:13,fontWeight:700,color:V.green}}>
                ✅ ¡Listo! Te vamos a avisar antes de cada vencimiento de monotributo.
              </div>
            )}
            {excede ? (
              <div style={{background:V.redBg,border:`1.5px solid ${V.redRing}`,borderRadius:12,padding:'20px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:900,color:V.red,marginBottom:6}}>⚠️ Superás el límite del Monotributo</div>
                <div style={{fontSize:13,color:'#7a2020',fontWeight:600,lineHeight:1.6}}>
                  Tu facturación anual supera los $72.000.000.<br/>Debés pasar al régimen general como <strong>Responsable Inscripto</strong>.
                </div>
              </div>
            ) : resultado ? (
              <div style={{background:V.greenBg,border:`1.5px solid ${V.greenRing}`,borderRadius:12,padding:'22px'}}>
                <div style={{textAlign:'center',marginBottom:16}}>
                  <div style={{fontSize:13,color:V.green,fontWeight:700,marginBottom:4}}>Tu categoría es</div>
                  <div style={{fontSize:56,fontWeight:900,color:V.green,lineHeight:1}}>Categoría {resultado.letra}</div>
                  <div style={{fontSize:13,color:'#166534',fontWeight:600,marginTop:6}}>Límite anual: {money(resultado.limite)}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                  {([
                    ['Impositivo', resultado.imp],
                    ['Previsional', resultado.prev],
                    ['Obra social', conOS ? OS_EXTRA : 0],
                  ] as [string,number][]).filter(([,v])=>v>0).map(([l,v])=>(
                    <div key={l} style={{background:'rgba(255,255,255,.7)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                      <div style={{fontSize:10,fontWeight:800,textTransform:'uppercase',color:'#166534',letterSpacing:'0.5px'}}>{l}</div>
                      <div style={{fontSize:15,fontWeight:900,color:V.green,marginTop:3}}>{money(v)}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:'rgba(255,255,255,.8)',borderRadius:8,padding:'12px',textAlign:'center',marginTop:10}}>
                  <div style={{fontSize:11,color:'#166534',fontWeight:700,marginBottom:2}}>Total mensual estimado</div>
                  <div style={{fontSize:26,fontWeight:900,color:V.green}}>{money(resultado.imp+resultado.prev+(conOS?OS_EXTRA:0))}</div>
                </div>
                <div style={{fontSize:11,color:'#166534',fontWeight:600,textAlign:'center',marginTop:10}}>
                  * Valores estimados 2026. Verificá en arca.gob.ar.
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* TABLA COMPLETA */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>
            📊 Tabla completa de categorías monotributo 2026
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{background:V.bg}}>
                  {['Cat.','Límite anual','Impositivo','Previsional','Con OS','Sin OS'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',color:V.ink3,borderBottom:`1px solid ${V.border}`}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.map((c,i)=>(
                  <tr key={c.letra} style={{background:resultado?.letra===c.letra?V.greenBg:i%2===0?V.surface:V.bg}}>
                    <td style={{padding:'10px 14px',fontWeight:900,fontSize:15,color:resultado?.letra===c.letra?V.green:V.teal}}>{c.letra}{resultado?.letra===c.letra?' ✓':''}</td>
                    <td style={{padding:'10px 14px',fontWeight:600,color:V.ink2}}>{money(c.limite)}</td>
                    <td style={{padding:'10px 14px',color:V.ink2}}>{money(c.imp)}</td>
                    <td style={{padding:'10px 14px',color:V.ink2}}>{money(c.prev)}</td>
                    <td style={{padding:'10px 14px',fontWeight:700,color:V.ink}}>{money(c.imp+c.prev+OS_EXTRA)}</td>
                    <td style={{padding:'10px 14px',color:V.ink2}}>{money(c.imp+c.prev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{padding:'10px 18px',borderTop:`1px solid ${V.border}`,fontSize:11,color:V.ink3,fontWeight:600}}>
            * Valores estimados 2026. Se actualizan por resolución de ARCA.
          </div>
        </div>

        {/* RECATEGORIZACIÓN */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>🔄 Recategorización</div>
          <div style={{padding:'16px 18px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
              <div style={{background:V.goldLight,border:`1px solid ${V.goldRing}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:800,color:'#a06000',marginBottom:6}}>📅 Períodos obligatorios</div>
                <div style={{fontSize:13,color:'#7a4e00',fontWeight:600,lineHeight:1.6}}>
                  <div>• <strong>Enero–Febrero</strong>: revisás el año anterior</div>
                  <div>• <strong>Julio–Agosto</strong>: revisás los últimos 12 meses</div>
                </div>
              </div>
              <div style={{background:V.tealLight,border:`1px solid ${V.tealRing}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:800,color:V.tealDark,marginBottom:6}}>📋 Cómo recategorizarse</div>
                <div style={{fontSize:13,color:V.teal,fontWeight:600,lineHeight:1.6}}>
                  <div>1. Ingresá a ARCA con Clave Fiscal</div>
                  <div>2. "Sistema Registral"</div>
                  <div>3. "Monotributo" → "Recategorización"</div>
                </div>
              </div>
            </div>
            <div style={{background:V.redBg,border:`1px solid ${V.redRing}`,borderRadius:8,padding:'10px 14px',fontSize:12,fontWeight:600,color:'#7a2020'}}>
              ⚠️ Si no te recategorizás cuando corresponde, ARCA puede hacerlo de oficio y aplicarte diferencias más intereses.
            </div>
          </div>
        </div>

        {/* INTERLINKING */}
        <div style={{display:'flex',gap:10,marginBottom:24,flexWrap:'wrap'}}>
          <a href="/como-facturar" style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:10,padding:'12px 16px',textDecoration:'none',display:'flex',alignItems:'center',gap:8,flex:1,minWidth:200}}>
            <span style={{fontSize:20}}>🧾</span>
            <div><div style={{fontSize:13,fontWeight:800,color:V.ink}}>Aprendé a facturar</div><div style={{fontSize:11,color:V.ink3,fontWeight:600}}>Guía Factura C paso a paso</div></div>
            <span style={{marginLeft:'auto',color:V.teal,fontWeight:800,fontSize:13}}>→</span>
          </a>
          <a href="/" style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:10,padding:'12px 16px',textDecoration:'none',display:'flex',alignItems:'center',gap:8,flex:1,minWidth:200}}>
            <span style={{fontSize:20}}>📅</span>
            <div><div style={{fontSize:13,fontWeight:800,color:V.ink}}>Ver vencimientos</div><div style={{fontSize:11,color:V.ink3,fontWeight:600}}>Calendario fiscal actualizado</div></div>
            <span style={{marginLeft:'auto',color:V.teal,fontWeight:800,fontSize:13}}>→</span>
          </a>
        </div>

        {/* AI */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{background:'#0a0a1a',color:'white',padding:'10px 16px',display:'flex',alignItems:'center',gap:8,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#4caf50',boxShadow:'0 0 0 3px rgba(76,175,80,.2)'}}/>
            Asistente Fiscal IA · Dudas sobre categorías
          </div>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askAI()}
                placeholder="Ej: ¿Qué pasa si supero el límite de mi categoría?"
                style={{flex:1,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none'}}/>
              <button onClick={()=>askAI()} disabled={aiLoad}
                style={{background:V.teal,color:'white',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,fontWeight:800,opacity:aiLoad?.6:1,whiteSpace:'nowrap'}}>
                {aiLoad?'…':'Consultar →'}
              </button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['¿Cuándo debo recategorizarme?','¿Qué pasa si supero el límite?','¿Me conviene pasar a RI?','¿Cuáles son los valores 2026?'].map(c=>(
                <button key={c} onClick={()=>askAI(c)} style={{background:V.bg,border:`1px solid ${V.border}`,borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:V.ink3}}>{c}</button>
              ))}
            </div>
            {(aiLoad||aiResp)&&<div style={{marginTop:12,padding:'12px 14px',background:V.bg,borderRadius:8,borderLeft:`3px solid ${V.teal}`,fontSize:13,color:V.ink2,fontWeight:600,lineHeight:1.75,whiteSpace:'pre-wrap'}}>
              {aiLoad?<span style={{color:V.ink3}}>Consultando ARCA/AFIP…</span>:aiResp}
            </div>}
          </div>
        </div>

      </main>
      </div>
    </>
  )
}
