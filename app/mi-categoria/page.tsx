'use client'

import { useState } from 'react'
import SiteHeader from '@/components/SiteHeader'
import { useFiscalData } from '@/components/FiscalDataProvider'

type CategoriaCalculadora = {
  letra:string
  limite:number
  imp:number
  impProductos:number
  prev:number
  os:number
}

const V = {
  tealDark:'#0d5c78', teal:'#1a7fa8', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
  gold:'#f5a623', goldLight:'#fff8ec', goldRing:'#fde4a0',
  red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
  green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed', ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
}

export default function MiCategoria() {
  const { categorias, vigencia, fuenteUrl, origen } = useFiscalData()
  const CATEGORIAS: CategoriaCalculadora[] = categorias.map(c => ({
    letra:c.letra,
    limite:c.limite_anual,
    imp:c.imp,
    impProductos:c.imp_productos ?? c.imp,
    prev:c.prev,
    os:c.os ?? 0,
  }))

  const [facturacion, setFacturacion] = useState('')
  const [conOS, setConOS] = useState(true)
  const [actividad, setActividad] = useState<'servicios'|'productos'>('servicios')
  const [resultado, setResultado] = useState<CategoriaCalculadora|null>(null)
  const [excede, setExcede] = useState(false)
  const [calculado, setCalculado] = useState(false)
  const [email, setEmail] = useState('')
  const [emailOk, setEmailOk] = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [suscribiendo, setSuscribiendo] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResp, setAiResp] = useState('')
  const [aiLoad, setAiLoad] = useState(false)

  function money(n:number) {
    return '$' + n.toLocaleString('es-AR', { minimumFractionDigits:2, maximumFractionDigits:2 })
  }

  function calcular() {
    const monto = Number(facturacion)
    if (!Number.isFinite(monto) || monto <= 0) return
    const anual = monto * 12
    const cat = CATEGORIAS.find(c => anual <= c.limite) || null
    setResultado(cat)
    setExcede(!cat)
    setCalculado(true)
    setEmailOk(false)
    setEmailErr('')
  }

  async function suscribir() {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailErr('Ingresá un email válido.')
      return
    }
    setSuscribiendo(true)
    setEmailErr('')
    setEmailOk(false)
    try {
      const r = await fetch('/api/suscribir', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ email, tipos:['mono'], diasAnticipacion:3 }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No pudimos activar las alertas.')
      setEmailOk(true)
      if (d.bienvenidaEnviada === false) {
        setEmailErr('Las alertas quedaron activadas, pero no pudimos enviar el email de bienvenida. Esto no afecta la suscripción.')
      }
    } catch (e) {
      setEmailErr(e instanceof Error ? e.message : 'No pudimos activar las alertas. Intentá nuevamente.')
    } finally {
      setSuscribiendo(false)
    }
  }

  async function askAI(q?:string) {
    const query = q || aiQuery
    if (!query.trim()) return
    if (q) setAiQuery(q)
    setAiLoad(true)
    setAiResp('')
    try {
      const r = await fetch('/api/fiscal', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ query }) })
      const d = await r.json()
      setAiResp(d.response || 'Sin respuesta.')
    } catch {
      setAiResp('Error de conexión.')
    } finally {
      setAiLoad(false)
    }
  }

  function impuesto(c:CategoriaCalculadora) {
    return actividad === 'productos' ? c.impProductos : c.imp
  }

  function total(c:CategoriaCalculadora) {
    return impuesto(c) + c.prev + (conOS ? c.os : 0)
  }

  return <>
    <SiteHeader currentPath="/mi-categoria" />
    <div className="ff-page-content">
      <main style={{maxWidth:860,margin:'0 auto',padding:'32px 24px 80px'}}>
        <section style={{background:`linear-gradient(135deg,${V.tealDark},${V.teal})`,borderRadius:16,padding:'28px 32px',marginBottom:28,color:'white',textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.65)',marginBottom:8}}>Calculadora de Monotributo · Argentina 2026</div>
          <h1 style={{fontSize:27,fontWeight:900,margin:'0 0 7px'}}>Calculá tu categoría en segundos</h1>
          <p style={{fontSize:14,color:'rgba(255,255,255,.8)',fontWeight:600,margin:0}}>Compará tus ingresos anualizados con los límites vigentes de ARCA.</p>
          <a href={fuenteUrl} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',marginTop:10,fontSize:10,color:'rgba(255,255,255,.78)',fontWeight:700}}>
            {vigencia} · {origen === 'supabase_validado' ? 'dato validado en línea' : 'respaldo verificado'} ↗
          </a>
        </section>

        <section style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:'0 1px 4px rgba(13,92,120,.07)'}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>📊 Estimá tu categoría por ingresos</div>
          <div style={{padding:'20px 18px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:16}}>
              <label>
                <span style={labelStyle}>Facturación mensual promedio</span>
                <div style={{display:'flex',alignItems:'center',border:`1.5px solid ${V.border}`,borderRadius:8,overflow:'hidden',background:V.bg}}>
                  <span style={{padding:'10px 12px',fontWeight:800,color:V.ink3,borderRight:`1px solid ${V.border}`}}>$</span>
                  <input type="number" inputMode="decimal" min="0" placeholder="Ej: 1500000" value={facturacion} onChange={e=>setFacturacion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&calcular()} style={{flex:1,minWidth:0,border:'none',padding:'10px 12px',fontSize:14,fontWeight:600,color:V.ink,background:'transparent',outline:'none'}} />
                </div>
              </label>
              <label>
                <span style={labelStyle}>Actividad</span>
                <select value={actividad} onChange={e=>setActividad(e.target.value as 'servicios'|'productos')} style={selectStyle}>
                  <option value="servicios">Servicios / locaciones</option>
                  <option value="productos">Venta de cosas muebles</option>
                </select>
              </label>
              <label>
                <span style={labelStyle}>Obra social</span>
                <select value={conOS?'si':'no'} onChange={e=>setConOS(e.target.value==='si')} style={selectStyle}>
                  <option value="si">Incluir obra social</option>
                  <option value="no">Sin obra social</option>
                </select>
              </label>
            </div>
            <button onClick={calcular} style={{width:'100%',background:V.teal,color:'white',border:'none',borderRadius:8,padding:12,fontSize:14,fontWeight:900,cursor:'pointer'}}>Calcular →</button>
            <p style={{fontSize:12,color:V.ink3,lineHeight:1.6,margin:'12px 0 0'}}>Esta es una <strong>estimación por ingresos</strong>. La categoría definitiva puede depender también de alquileres, superficie, energía y precio unitario máximo, según la actividad. Verificá todos los parámetros en ARCA.</p>
          </div>
        </section>

        {calculado && <section style={{marginBottom:24}}>
          {excede ? <div style={{background:V.redBg,border:`1.5px solid ${V.redRing}`,borderRadius:14,padding:'20px',textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:900,color:V.red,marginBottom:7}}>⚠️ Por ingresos, superarías el límite máximo</div>
            <p style={{fontSize:13,color:'#7a2020',fontWeight:600,lineHeight:1.65,margin:0}}>La facturación anualizada supera {money(CATEGORIAS[CATEGORIAS.length-1]?.limite || 0)}. Esto indica que deberías <strong>revisar si corresponde pasar al Régimen General</strong>. La situación definitiva depende de tus datos reales y de las reglas de ARCA.</p>
          </div> : resultado && <div style={{background:V.greenBg,border:`1.5px solid ${V.greenRing}`,borderRadius:14,padding:'22px'}}>
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:800,color:V.green}}>Estimación por ingresos</div>
              <div style={{fontSize:42,fontWeight:900,color:V.green}}>Categoría {resultado.letra}</div>
              <div style={{fontSize:12,color:'#166534',fontWeight:700}}>Límite anual: {money(resultado.limite)}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:9}}>
              <Mini label="Impositivo" value={money(impuesto(resultado))}/>
              <Mini label="Previsional" value={money(resultado.prev)}/>
              {conOS && <Mini label="Obra social" value={money(resultado.os)}/>} 
            </div>
            <div style={{background:'rgba(255,255,255,.78)',borderRadius:9,padding:12,textAlign:'center',marginTop:10}}>
              <div style={{fontSize:11,color:'#166534',fontWeight:800}}>Total mensual estimado</div>
              <div style={{fontSize:26,fontWeight:900,color:V.green}}>{money(total(resultado))}</div>
            </div>
          </div>}
        </section>}

        {calculado && <section style={{background:V.surface,border:`1.5px solid ${V.tealRing}`,borderRadius:14,padding:18,marginBottom:24}}>
          <div style={{fontSize:14,fontWeight:900,color:V.tealDark,marginBottom:5}}>🔔 ¿Querés que te avisemos los vencimientos?</div>
          <p style={{fontSize:12,color:V.ink2,lineHeight:1.55,margin:'0 0 12px'}}>La suscripción es opcional. El resultado de la calculadora no depende de tu email.</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setEmailErr('')}} placeholder="tu@email.com" style={{flex:1,minWidth:210,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,background:V.bg}} />
            <button onClick={suscribir} disabled={suscribiendo} style={{background:V.gold,color:V.ink,border:'none',borderRadius:8,padding:'10px 16px',fontSize:13,fontWeight:900,cursor:'pointer',opacity:suscribiendo?.65:1}}>{suscribiendo?'Activando…':'Activar alertas'}</button>
          </div>
          {emailOk && <div style={{fontSize:12,fontWeight:800,color:V.green,marginTop:8}}>✅ Alertas activadas.</div>}
          {emailErr && <div style={{fontSize:12,fontWeight:700,color:emailOk?V.ink2:V.red,marginTop:8}}>{emailErr}</div>}
        </section>}

        <section style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:'0 1px 4px rgba(13,92,120,.07)'}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>📋 Categorías de Monotributo vigentes</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr style={{background:V.bg}}><Th>Cat.</Th><Th>Límite anual</Th><Th>Imp. servicios</Th><Th>Imp. productos</Th><Th>Previsional</Th><Th>Obra social</Th></tr></thead>
              <tbody>{CATEGORIAS.map((c,i)=><tr key={c.letra} style={{background:i%2?V.bg:'#fff'}}><Td strong>{c.letra}</Td><Td>{money(c.limite)}</Td><Td>{money(c.imp)}</Td><Td>{money(c.impProductos)}</Td><Td>{money(c.prev)}</Td><Td>{money(c.os)}</Td></tr>)}</tbody>
            </table>
          </div>
          <div style={{padding:'10px 18px',borderTop:`1px solid ${V.border}`,fontSize:11,color:V.ink3,fontWeight:600}}>Fuente: ARCA. La composición de la cuota puede variar según tu situación previsional y de obra social.</div>
        </section>

        <section style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>🔄 Recategorización</div>
          <div style={{padding:'17px 18px'}}>
            <div style={{background:V.goldLight,border:`1px solid ${V.goldRing}`,borderRadius:10,padding:'13px 15px',marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:900,color:'#7a4f00',marginBottom:5}}>Febrero y agosto</div>
              <div style={{fontSize:12,color:'#7a4f00',fontWeight:600,lineHeight:1.65}}>ARCA establece dos períodos de recategorización por año. En cada uno se evalúan los <strong>últimos 12 meses de actividad</strong>. El trámite puede realizarse hasta el día 5 de febrero o agosto, según corresponda.</div>
            </div>
            <p style={{fontSize:12,color:V.ink2,lineHeight:1.65,margin:'0 0 10px'}}>Si los parámetros se mantienen dentro de tu categoría actual, no tenés que modificarla. Quienes tienen menos de 6 meses de actividad tampoco deben recategorizarse.</p>
            <a href="https://www.arca.gob.ar/monotributo/ayuda/recategorizacion.asp" target="_blank" rel="noopener noreferrer" style={{fontSize:12,fontWeight:900,color:V.tealDark}}>Ver recategorización oficial en ARCA →</a>
          </div>
        </section>

        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:24}}>
          <a href="/como-facturar" style={linkCard}>🧾 Cómo facturar →</a>
          <a href="/calendario-fiscal" style={linkCard}>📅 Ver vencimientos →</a>
        </div>

        <section style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden'}}>
          <div style={{background:'#0a0a1a',color:'white',padding:'10px 16px',fontSize:11,fontWeight:800}}>Asistente Fiscal IA · Dudas sobre categorías</div>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askAI()} placeholder="Ej.: ¿Cuándo tengo que recategorizarme?" style={{flex:1,minWidth:220,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,background:V.bg}} />
              <button onClick={()=>askAI()} disabled={aiLoad} style={{background:V.teal,color:'white',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,fontWeight:900}}>{aiLoad?'…':'Consultar →'}</button>
            </div>
            {(aiLoad||aiResp) && <div style={{marginTop:10,padding:'10px 12px',background:V.bg,borderRadius:8,borderLeft:`3px solid ${V.teal}`,fontSize:13,color:V.ink2,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{aiLoad?'Consultando ARCA…':aiResp}</div>}
          </div>
        </section>
      </main>
    </div>
  </>
}

function Mini({label,value}:{label:string;value:string}) {
  return <div style={{background:'rgba(255,255,255,.72)',borderRadius:8,padding:'9px 10px',textAlign:'center'}}><div style={{fontSize:9,fontWeight:800,textTransform:'uppercase',color:'#166534'}}>{label}</div><div style={{fontSize:14,fontWeight:900,color:V.green,marginTop:3}}>{value}</div></div>
}
function Th({children}:{children:React.ReactNode}) { return <th style={{padding:'10px 12px',textAlign:'left',fontSize:9,fontWeight:900,letterSpacing:.5,textTransform:'uppercase',color:V.ink3,borderBottom:`1px solid ${V.border}`,whiteSpace:'nowrap'}}>{children}</th> }
function Td({children,strong=false}:{children:React.ReactNode;strong?:boolean}) { return <td style={{padding:'10px 12px',fontWeight:strong?900:600,color:strong?V.teal:V.ink2,whiteSpace:'nowrap'}}>{children}</td> }
const labelStyle:React.CSSProperties={display:'block',fontSize:10,fontWeight:900,letterSpacing:.7,textTransform:'uppercase',color:V.ink3,marginBottom:6}
const selectStyle:React.CSSProperties={width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none'}
const linkCard:React.CSSProperties={flex:1,minWidth:190,background:'#fff',border:`1.5px solid ${V.border}`,borderRadius:10,padding:'12px 16px',textDecoration:'none',color:V.ink,fontWeight:800,fontSize:13}
