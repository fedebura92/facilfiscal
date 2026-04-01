'use client'
import { useState, useEffect, useRef, useMemo } from 'react'

type Tipo = 'mono' | 'ri' | 'aut'
interface Vencimiento { id:string; nombre:string; emoji:string; detalle:string; dia_mes:number; tipo:string; fecha:string }
interface Alerta { id:string; icon:string; tipo:'warn'|'info'|'danger'; title:string; description:string }

const FALLBACK_VENC: Record<Tipo, Vencimiento[]> = {
  mono:[
    {id:'1',nombre:'Monotributo (term. 0-4)',emoji:'📋',detalle:'Terminación CUIT 0, 1, 2, 3 o 4',dia_mes:3, tipo:'mono',fecha:''},
    {id:'2',nombre:'Monotributo (term. 5-9)',emoji:'📋',detalle:'Terminación CUIT 5, 6, 7, 8 o 9',dia_mes:10,tipo:'mono',fecha:''},
    {id:'3',nombre:'Obra Social / Previsional',emoji:'🏥',detalle:'Componente previsional',dia_mes:12,tipo:'mono',fecha:''},
  ],
  ri:[
    {id:'4',nombre:'IVA',emoji:'🧾',detalle:'Presentación y pago mensual',dia_mes:19,tipo:'ri',fecha:''},
    {id:'5',nombre:'Ganancias anticipo',emoji:'💼',detalle:'Anticipo mensual',dia_mes:25,tipo:'ri',fecha:''},
    {id:'6',nombre:'SUSS Empleadores',emoji:'👥',detalle:'Contribuciones patronales',dia_mes:12,tipo:'ri',fecha:''},
    {id:'7',nombre:'Bienes Personales',emoji:'🏠',detalle:'Anticipo mensual',dia_mes:22,tipo:'ri',fecha:''},
  ],
  aut:[
    {id:'8',nombre:'Autónomos',emoji:'⚡',detalle:'Aporte mensual categorías I-V',dia_mes:8,tipo:'aut',fecha:''},
    {id:'9',nombre:'IVA',emoji:'🧾',detalle:'Si estás inscripto en IVA',dia_mes:19,tipo:'aut',fecha:''},
    {id:'10',nombre:'Ganancias anticipo',emoji:'💼',detalle:'Anticipo mensual personas humanas',dia_mes:25,tipo:'aut',fecha:''},
  ],
}
const FALLBACK_ALERTAS: Record<Tipo, Alerta[]> = {
  mono:[
    {id:'a1',icon:'🔄',tipo:'warn',title:'Recategorización abierta',description:'Período enero-febrero. Revisá si tus ingresos cambiaron.'},
    {id:'a2',icon:'💰',tipo:'warn',title:'Nuevos valores de cuota',description:'Los montos del monotributo se actualizaron. Verificá en ARCA.'},
    {id:'a3',icon:'📢',tipo:'info',title:'ARCA reemplaza a AFIP',description:'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.'},
  ],
  ri:[
    {id:'a4',icon:'📅',tipo:'warn',title:'IVA bimestral',description:'Si sos contribuyente bimestral, verificá el cronograma específico.'},
    {id:'a5',icon:'💼',tipo:'danger',title:'Retenciones y percepciones',description:'Verificá si debés presentar F.2002 o F.572 este mes.'},
    {id:'a6',icon:'📢',tipo:'info',title:'ARCA reemplaza a AFIP',description:'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.'},
  ],
  aut:[
    {id:'a7',icon:'⚡',tipo:'warn',title:'Ajuste de categorías',description:'Las categorías de autónomos se actualizan por inflación.'},
    {id:'a8',icon:'💰',tipo:'warn',title:'Aportes jubilatorios',description:'El importe varía según categoría. Confirmá en ARCA.'},
    {id:'a9',icon:'📢',tipo:'info',title:'ARCA reemplaza a AFIP',description:'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.'},
  ],
}
const MONTOS = {
  mono:{cats:['A','B','C','D','E','F','G','H'],limites:['$6,4M','$9,4M','$13,2M','$16,4M','$19,3M','$24,2M','$29M','$44M'],imp:[11000,12400,13900,17000,20500,25000,30000,42000],prev:[28000,28000,28000,28000,28000,28000,28000,28000],os:14000},
  ri:  {cats:['Pequeño RI','Mediano RI','Gran RI'],limites:['hasta $30M','hasta $100M','más de $100M'],imp:[18000,35000,60000],prev:[28000,40000,50000],os:0},
  aut: {cats:['Categoría I','Categoría II','Categoría III','Categoría IV'],limites:['menor','—','—','mayor'],imp:[15000,22000,32000,48000],prev:[22000,28000,35000,45000],os:0},
}

function addFecha(v: Vencimiento): Vencimiento {
  const n=new Date(); return {...v,fecha:new Date(n.getFullYear(),n.getMonth(),v.dia_mes).toISOString()}
}
function diff(f:string){const h=new Date();h.setHours(0,0,0,0);const d=new Date(f);d.setHours(0,0,0,0);return Math.round((d.getTime()-h.getTime())/86400000)}
function fmtL(f:string){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long'}).format(new Date(f))}
function fmtS(f:string){return new Intl.DateTimeFormat('es-AR',{day:'2-digit',month:'short'}).format(new Date(f))}
function money(n:number){return '$'+n.toLocaleString('es-AR')}

export default function Home() {
  const [tipo,setTipo]=useState<Tipo>('mono')
  const [venc,setVenc]=useState<Vencimiento[]>([])
  const [alertas,setAlertas]=useState<Alerta[]>([])
  const [catIdx,setCatIdx]=useState('')
  const [conOS,setConOS]=useState(true)
  const [aiQuery,setAiQuery]=useState('')
  const [aiResp,setAiResp]=useState('')
  const [aiLoading,setAiLoading]=useState(false)
  const [email,setEmail]=useState('')
  const [emailOk,setEmailOk]=useState(false)
  const [tiposSel,setTiposSel]=useState<string[]>(['mono'])
  const [suscError,setSuscError]=useState('')
  const [toast,setToast]=useState('')
  const [mounted,setMounted]=useState(false)
  const capturaRef=useRef<HTMLInputElement>(null)
  let toastTimer:any

  useEffect(()=>{setMounted(true)},[])
  useEffect(()=>{
    fetch(`/api/vencimientos?tipo=${tipo}`).then(r=>r.json()).then(d=>setVenc((d.vencimientos||[]).map(addFecha))).catch(()=>setVenc(FALLBACK_VENC[tipo].map(addFecha)))
    fetch(`/api/alerts?tipo=${tipo}`).then(r=>r.json()).then(d=>setAlertas(d.alerts||FALLBACK_ALERTAS[tipo])).catch(()=>setAlertas(FALLBACK_ALERTAS[tipo]))
    setCatIdx('')
  },[tipo])

  function showToast(msg:string){setToast(msg);clearTimeout(toastTimer);toastTimer=setTimeout(()=>setToast(''),2800)}
  function toggleTipo(t:string){setSuscError('');setTiposSel(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])}
  function tipoDisabled(t:string):boolean{
    if(t==='mono') return tiposSel.includes('ri')
    if(t==='ri')   return tiposSel.includes('mono')
    return false
  }

  async function askAI(q?:string){
    const query=q||aiQuery; if(!query.trim())return; if(q)setAiQuery(q)
    setAiLoading(true);setAiResp('')
    try{const r=await fetch('/api/fiscal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});const d=await r.json();setAiResp(d.response||'Sin respuesta.')}
    catch{setAiResp('Error de conexión.')}finally{setAiLoading(false)}
  }

  async function suscribir(){
    if(!email||!email.includes('@')){showToast('Ingresá un email válido');return}
    if(tiposSel.length===0){showToast('Seleccioná al menos una categoría');return}
    setSuscError('')
    try{
      const res=await fetch('/api/suscribir',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,tipos:tiposSel})})
      const data=await res.json()
      if(!res.ok){setSuscError(data.error||'Error al guardar');return}
      setEmailOk(true);showToast('✓ ¡Suscripción activada!')
    }catch{setSuscError('Error de conexión.')}
  }

  const vencOrd = useMemo(() => {
  return [...venc]
    .filter(v => diff(v.fecha) >= 0)
    .sort((a, b) => diff(a.fecha) - diff(b.fecha))
}, [venc])

const cards = useMemo(() => vencOrd.slice(0, 3), [vencOrd])

const proximos = useMemo(() => {
  return vencOrd.filter(v => diff(v.fecha) <= 10).slice(0, 8)
}, [vencOrd])

const idx = useMemo(() => parseInt(catIdx), [catIdx])

const os = useMemo(() => {
  return conOS && tipo === 'mono' ? MONTOS.mono.os : 0
}, [conOS, tipo])

const total = useMemo(() => {
  if (catIdx === '') return 0
  return MONTOS[tipo].imp[idx] + MONTOS[tipo].prev[idx] + os
}, [catIdx, tipo, idx, os])
  const tipoNombre:Record<Tipo,string>={mono:'Monotributo',ri:'Resp. Inscripto',aut:'Autónomo'}
  const fechaHoy=mounted?new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date()):''

  const V={
    tealDark:'#0d5c78',teal:'#1a7fa8',tealMid:'#2490bc',tealLight:'#e8f6fb',tealRing:'#a8ddf0',
    gold:'#f5a623',goldDark:'#e8920a',goldLight:'#fff8ec',goldRing:'#fde4a0',
    red:'#e53535',redBg:'#fff1f1',redRing:'#ffc8c8',
    amber:'#d97706',amberBg:'#fffbeb',amberRing:'#fde68a',
    green:'#16a34a',greenBg:'#f0fdf4',greenRing:'#bbf7d0',
    bg:'#f4f7f9',surface:'#fff',border:'#e2e8ed',
    ink:'#0f2733',ink2:'#3d5a6b',ink3:'#7a9aaa',
  }

  const cardCfg=(d:number)=>d===0
    ?{bg:`linear-gradient(150deg,#fff 65%,${V.redBg})`,border:V.redRing,iconBg:V.redBg,pill:{bg:V.redBg,color:V.red,border:V.redRing},txt:'🔴 Vence HOY',diasColor:V.red,diasTxt:'¡HOY!',btnDanger:true}
    :d===1
    ?{bg:`linear-gradient(150deg,#fff 65%,${V.goldLight})`,border:V.goldRing,iconBg:V.goldLight,pill:{bg:V.goldLight,color:V.amber,border:V.goldRing},txt:'🟡 Mañana',diasColor:V.amber,diasTxt:'Mañana',btnDanger:false}
    :{bg:`linear-gradient(150deg,#fff 65%,${V.tealLight})`,border:V.tealRing,iconBg:V.tealLight,pill:{bg:V.tealLight,color:V.tealDark,border:V.tealRing},txt:`🟢 En ${d} días`,diasColor:V.teal,diasTxt:`En ${d} días`,btnDanger:false}

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Nunito',sans-serif;background:#f4f7f9;color:#0f2733;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
        @keyframes cardUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        button{font-family:'Nunito',sans-serif;cursor:pointer}
        input,select{font-family:'Nunito',sans-serif}
        select{appearance:none}
        input::placeholder{color:rgba(255,255,255,.85)!important}

        /* ── RESPONSIVE ── */
        .ff-header-inner{max-width:1120px;margin:0 auto;padding:0 16px;height:56px;display:flex;align-items:center;justify-content:space-between;gap:8px}
        .ff-logo-tag{display:block}
        .ff-switcher{display:flex;background:#f4f7f9;border:1.5px solid #e2e8ed;border-radius:10px;padding:3px;gap:2px}
        .ff-tipo-btn{padding:7px 12px;border-radius:7px;border:none;background:none;font-family:'Nunito',sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .18s}
        .ff-cta{display:block}
        .ff-hero{padding:40px 16px 36px;text-align:center}
        .ff-hero h1{font-size:26px;font-weight:900;color:white;line-height:1.2;letter-spacing:-0.3px;margin-bottom:12px}
        .ff-hero p{font-size:14px;color:rgba(255,255,255,.8);font-weight:600;margin-bottom:24px;line-height:1.6}
        .ff-hero-btn{display:inline-block;background:#f5a623;color:#0f2733;border-radius:10px;padding:13px 24px;font-size:15px;font-weight:900;text-decoration:none;box-shadow:0 4px 16px rgba(245,166,35,.4)}
        .ff-social-proof{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:5px 14px;margin-bottom:16px;font-size:12px;font-weight:700;color:rgba(255,255,255,.9)}
        .ff-dolor-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .ff-main{max-width:1120px;margin:0 auto;padding:20px 16px 80px}
        .ff-cards-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:24px}
        .ff-two-col{display:grid;grid-template-columns:1fr;gap:16px;margin-bottom:24px}
        .ff-accion-grid{display:grid;grid-template-columns:1fr;gap:10px;margin-bottom:24px}
        .ff-captura{border-radius:16px;padding:28px 20px;display:flex;flex-direction:column;gap:20px}
        .ff-cap-form{display:flex;flex-direction:column;gap:10px;width:100%}
        .ff-cap-input-row{display:flex;gap:8px}
        .ff-calc-break{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}

        @media(min-width:600px){
          .ff-cards-grid{grid-template-columns:repeat(2,1fr)}
          .ff-accion-grid{grid-template-columns:repeat(3,1fr)}
          .ff-dolor-grid{grid-template-columns:repeat(4,1fr)}
        }
        @media(min-width:768px){
          .ff-header-inner{padding:0 24px;height:64px}
          .ff-logo-tag{display:block}
          .ff-tipo-btn{padding:8px 16px;font-size:13px}
          .ff-cta{display:block}
          .ff-hero{padding:52px 24px 48px}
          .ff-hero h1{font-size:36px}
          .ff-hero p{font-size:16px}
          .ff-main{padding:28px 24px 80px}
          .ff-cards-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
          .ff-two-col{grid-template-columns:1fr 1fr}
          .ff-captura{flex-direction:row;align-items:center;justify-content:space-between;padding:36px 40px}
          .ff-cap-form{width:auto;min-width:300px}
          .ff-cap-input-row{flex-direction:row}
        }
        @media(max-width:480px){
          .ff-switcher{padding:2px;gap:1px}
          .ff-tipo-btn{padding:6px 8px;font-size:11px}
          .ff-cta{font-size:11px;padding:7px 12px}
          .ff-dolor-grid{grid-template-columns:1fr 1fr}
          .ff-calc-break{grid-template-columns:1fr 1fr}
        }
      `}}/>

      {/* HEADER */}
      <header style={{background:V.surface,borderBottom:`1px solid ${V.border}`,position:'sticky',top:0,zIndex:100,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
        <div 
  className="ff-header-inner" 
  style={{
    display:'flex',
    flexWrap:'wrap',
    alignItems:'center',
    justifyContent:'space-between',
    gap:6
  }}
>
          <a href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none',flexShrink:0}}>
            <svg viewBox="0 0 44 44" fill="none" width={38} height={38}>
              <rect x="6" y="4" width="24" height="30" rx="4" fill="#1a7fa8"/>
              <rect x="10" y="11" width="12" height="2.5" rx="1.25" fill="rgba(255,255,255,.5)"/>
              <rect x="10" y="16" width="16" height="2.5" rx="1.25" fill="rgba(255,255,255,.4)"/>
              <rect x="10" y="21" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,.3)"/>
              <path d="M24 4 L30 10 L24 10 Z" fill="rgba(255,255,255,.25)"/>
              <path d="M10 24 L17 31 L32 15" stroke="#f5a623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{lineHeight:1}}>
              <div><span style={{fontSize:17,fontWeight:900,color:V.tealDark}}>Fácil</span><span style={{fontSize:17,fontWeight:900,color:V.teal}}> Fiscal</span></div>
            </div>
          </a>

         <div className="ff-switcher">
              {(['mono','ri','aut'] as Tipo[]).map((t,i)=>(
                <button
                  key={t}
                  onClick={() => {
                    if (t === 'ri') {
                      window.location.href = '/responsable-inscripto'
                      return
                    }
                    setTipo(t)
                  }}
                  className="ff-tipo-btn"
                  style={{
                    background: tipo === t ? V.teal : 'none',
                    color: tipo === t ? 'white' : V.ink3
                  }}
                >
                  {['Monotributo','Resp. Inscripto','Autónomo'][i]}
                </button>
              ))}
          </div>

          <button className="ff-cta"
            onClick={()=>{capturaRef.current?.scrollIntoView({behavior:'smooth'});setTimeout(()=>capturaRef.current?.focus(),600)}}
            style={{background:V.gold,color:V.ink,border:'none',borderRadius:8,padding:'8px 16px',fontSize:12,fontWeight:800,whiteSpace:'nowrap',boxShadow:`0 2px 8px rgba(245,166,35,.35)`}}>
            🔔 Alertas
          </button>
        </div>
      </header>

      {/* HERO */}
      <div className="ff-hero" style={{background:`linear-gradient(135deg,${V.tealDark} 0%,${V.teal} 100%)`,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',left:'50%',top:-80,transform:'translateX(-50%)',width:500,height:300,borderRadius:'50%',background:'rgba(255,255,255,.04)'}}/>
        <div style={{maxWidth:680,margin:'0 auto',position:'relative',zIndex:1}}>
          <div className="ff-social-proof">
            <span>👥</span> Más de 500 monotributistas ya usan Fácil Fiscal
          </div>
          <h1>Controlá tu monotributo<br/>sin errores ni multas</h1>
          <p>Calculá tu categoría, aprendé a facturar y recibí<br/>recordatorios automáticos antes de cada vencimiento.</p>
          <a href="/mi-categoria" className="ff-hero-btn"> Calculá tu categoría GRATIS →</a>
          <div style={{marginTop:10,fontSize:11,color:'rgba(255,255,255,.5)',fontWeight:600}}>Sin registro · Sin tarjeta · Gratis</div>
        </div>
      </div>

      {/* DOLOR */}
      <div style={{background:V.surface,borderBottom:`1px solid ${V.border}`}}>
        <div style={{maxWidth:1120,margin:'0 auto',padding:'24px 16px'}}>
          <div style={{textAlign:'center',marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:800,color:V.red,marginBottom:4}}>⚠️ Evitá problemas con AFIP</div>
            <div style={{fontSize:16,fontWeight:900,color:V.ink,letterSpacing:'-0.2px'}}>Errores comunes que te pueden costar caro</div>
          </div>
          <div className="ff-dolor-grid">
            {[
              {icon:'❌',txt:'Pagan la categoría incorrecta'},
              {icon:'❌',txt:'No saben cuándo recategorizarse'},
              {icon:'❌',txt:'Emiten facturas con errores'},
              {icon:'❌',txt:'Se enteran del vencimiento tarde'},
            ].map(e=>(
              <div key={e.txt} style={{display:'flex',gap:8,alignItems:'flex-start',background:V.redBg,border:`1px solid ${V.redRing}`,borderRadius:10,padding:'10px 12px'}}>
                <span style={{fontSize:13,flexShrink:0}}>{e.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:'#7a2020',lineHeight:1.4}}>{e.txt}</span>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:14}}>
            <a href="/mi-categoria" style={{fontSize:13,fontWeight:800,color:V.teal,textDecoration:'none'}}>Fácil Fiscal te ayuda a evitar todo esto →</a>
          </div>
        </div>
      </div>

      <main className="ff-main">

        {/* DATE STRIP */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{fontSize:13,color:V.ink3,fontWeight:600}}>Hoy es <strong style={{color:V.ink2}}>{fechaHoy}</strong></div>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:V.tealLight,border:`1.5px solid ${V.tealRing}`,borderRadius:20,padding:'4px 12px 4px 8px',fontSize:12,fontWeight:800,color:V.tealDark}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:V.teal,flexShrink:0}}/>{tipoNombre[tipo]}
          </div>
        </div>

        {/* VENCIMIENTOS HOY */}
        <div style={{fontSize:11,fontWeight:800,letterSpacing:'1.5px',textTransform:'uppercase',color:V.ink3,marginBottom:12}}>📅 Vencimientos de hoy</div>
        <div className="ff-cards-grid">
          {cards.length===0
            ?<div style={{padding:'20px 0',color:V.ink3,fontSize:13,fontWeight:600}}>✅ Sin vencimientos próximos inmediatos.</div>
            :cards.map((v,i)=>{
              const d=diff(v.fecha); const c=cardCfg(d)
              return(
                <div key={v.id} style={{background:c.bg,border:`1.5px solid ${c.border}`,borderRadius:16,padding:'18px 18px 14px',display:'flex',flexDirection:'column',gap:12,boxShadow:`0 1px 4px rgba(13,92,120,.07)`,animation:`cardUp .35s ease ${i*.09}s both`}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                    <div style={{width:40,height:40,borderRadius:11,background:c.iconBg,border:`1.5px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>{v.emoji}</div>
                    <div style={{background:c.pill.bg,color:c.pill.color,border:`1.5px solid ${c.pill.border}`,display:'inline-flex',alignItems:'center',borderRadius:20,padding:'4px 10px',fontSize:11,fontWeight:800,flexShrink:0}}>{c.txt}</div>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:900,color:V.ink,letterSpacing:'-0.2px',lineHeight:1.2,marginTop:6}}>{v.nombre}</div>
                    <div style={{fontSize:12,color:V.ink3,fontWeight:600,marginTop:2}}>{v.detalle}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:`1px solid ${V.border}`,paddingTop:10}}>
                    <div style={{fontSize:13,fontWeight:700,color:V.ink2}}>{fmtL(v.fecha)}</div>
                    <div style={{fontSize:13,fontWeight:900,color:c.diasColor}}>{c.diasTxt}</div>
                  </div>
                  <button onClick={()=>window.open('https://www.afip.gob.ar','_blank')} style={{width:'100%',borderRadius:8,padding:10,fontSize:13,fontWeight:800,background:c.btnDanger?V.red:V.bg,color:c.btnDanger?'white':V.ink2,border:c.btnDanger?`1.5px solid ${V.red}`:`1.5px solid ${V.border}`}}>
                    {d===0?'Pagar ahora →':d===1?'Ver cómo pagar':'Ver detalles'}
                  </button>
                </div>
              )
            })
          }
        </div>

        {/* PRÓXIMOS */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:14,overflow:'hidden',marginBottom:20,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{padding:'13px 16px',borderBottom:`1px solid ${V.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{fontSize:14,fontWeight:800,color:V.ink}}>📋 Próximos vencimientos</div>
            <div style={{fontSize:11,fontWeight:700,background:V.tealLight,color:V.tealDark,border:`1px solid ${V.tealRing}`,borderRadius:20,padding:'2px 9px'}}>{proximos.length} vto{proximos.length!==1?'s':''}</div>
          </div>
          <div>
            {proximos.length===0
              ?<div style={{padding:'14px 16px',color:V.ink3,fontSize:13,fontWeight:600}}>Sin vencimientos en los próximos 10 días.</div>
              :proximos.map((v,i)=>{
                const d=diff(v.fecha)
                const dot=d===0?V.red:d<=3?V.gold:V.teal
                const mb=d===0?{bg:V.redBg,color:V.red,border:`1px solid ${V.redRing}`,txt:'HOY'}
                  :d===1?{bg:V.amberBg,color:V.amber,border:`1px solid ${V.amberRing}`,txt:'Mañana'}
                  :d<=4?{bg:V.amberBg,color:V.amber,border:`1px solid ${V.amberRing}`,txt:`${d}d`}
                  :{bg:V.tealLight,color:V.tealDark,border:`1px solid ${V.tealRing}`,txt:`${d}d`}
                return(
                  <div key={v.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px',borderBottom:`1px solid ${V.border}`}}>
                    <div style={{width:9,height:9,borderRadius:'50%',background:dot,flexShrink:0}}/>
                    <div style={{fontSize:12,fontWeight:800,color:V.ink3,minWidth:60}}>{fmtS(v.fecha)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:V.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.emoji} {v.nombre}</div>
                      <div style={{fontSize:11,color:V.ink3,fontWeight:600}}>{v.detalle}</div>
                    </div>
                    <div style={{fontSize:10,fontWeight:800,padding:'2px 8px',borderRadius:20,background:mb.bg,color:mb.color,border:mb.border,flexShrink:0}}>{mb.txt}</div>
                  </div>
                )
              })
            }
          </div>
        </div>

        {/* ALERTAS + CALCULADORA */}
        <div className="ff-two-col">
          <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:14,overflow:'hidden',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
            <div style={{padding:'13px 16px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>⚠️ Alertas importantes</div>
            {alertas.map(a=>{
              const ib=a.tipo==='danger'?{bg:V.redBg,border:`1.5px solid ${V.redRing}`}:a.tipo==='info'?{bg:V.tealLight,border:`1.5px solid ${V.tealRing}`}:{bg:V.goldLight,border:`1.5px solid ${V.goldRing}`}
              return(
                <div key={a.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'11px 16px',borderBottom:`1px solid ${V.border}`}}>
                  <div style={{width:30,height:30,borderRadius:8,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,...ib}}>{a.icon}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:V.ink,marginBottom:2}}>{a.title}</div>
                    <div style={{fontSize:11,color:V.ink3,fontWeight:600,lineHeight:1.5}}>{a.description}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:14,overflow:'hidden',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
            <div style={{padding:'13px 16px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>🧮 ¿Cuánto tengo que pagar?</div>
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.8px',textTransform:'uppercase',color:V.ink3,marginBottom:5}}>Tu categoría</div>
              <select value={catIdx} onChange={e=>setCatIdx(e.target.value)} style={{width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'9px 10px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none',marginBottom:10}}>
                <option value="" disabled>— Elegí tu categoría —</option>
                {MONTOS[tipo].cats.map((c,i)=><option key={i} value={i}>{c} — {MONTOS[tipo].limites[i]}/año</option>)}
              </select>
              {tipo==='mono'&&<>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.8px',textTransform:'uppercase',color:V.ink3,marginBottom:5}}>Obra social</div>
                <select value={conOS?'si':'no'} onChange={e=>setConOS(e.target.value==='si')} style={{width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'9px 10px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none',marginBottom:10}}>
                  <option value="si">Incluir obra social</option>
                  <option value="no">Sin obra social</option>
                </select>
              </>}
              <div style={{background:`linear-gradient(135deg,${V.tealDark},${V.tealMid})`,borderRadius:8,padding:'16px',textAlign:'center',minHeight:80,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                {catIdx!==''?<>
                  <div style={{fontSize:28,fontWeight:900,color:'white',letterSpacing:'-0.5px',lineHeight:1,marginBottom:4}}>{money(total)}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.65)',fontWeight:600,marginBottom:8}}>por mes · estimado 2026</div>
                  <div className="ff-calc-break" style={{width:'100%'}}>
                    {[['Imp.',MONTOS[tipo].imp[idx]],['Prev.',MONTOS[tipo].prev[idx]],...(os?[['OS',os]]:[])].map(([l,val])=>(
                      <div key={l as string} style={{background:'rgba(255,255,255,.1)',borderRadius:6,padding:'5px 6px',textAlign:'center'}}>
                        <div style={{fontSize:8,color:'rgba(255,255,255,.55)',fontWeight:700,textTransform:'uppercase'}}>{l}</div>
                        <div style={{fontSize:12,fontWeight:900,color:'white',marginTop:1}}>{money(val as number)}</div>
                      </div>
                    ))}
                  </div>
                </>:<div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,.4)'}}>Seleccioná una categoría</div>}
              </div>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div style={{fontSize:11,fontWeight:800,letterSpacing:'1.5px',textTransform:'uppercase',color:V.ink3,marginBottom:12}}>Acciones rápidas</div>
        <div className="ff-accion-grid">
          {[
            {icon:'🧾',bg:V.goldLight,br:V.goldRing,label:'Facturá sin errores',desc:'Guía Factura C paso a paso',link:'Ver guía →',fn:()=>window.location.href='/como-facturar'},
            {icon:'📊',bg:V.tealLight,br:V.tealRing,label:'Calculá tu categoría',desc:'Evitá pagar de más o recategorizarte mal',link:'Calcular →',fn:()=>window.location.href='/mi-categoria'},
            {icon:'🏦',bg:V.bg,br:V.border,label:'Pagar en AFIP',desc:'Generá tu VEP y pagá desde home banking',link:'Ir a AFIP →',fn:()=>window.open('https://www.afip.gob.ar','_blank')},
          ].map(a=>(
            <button key={a.label} onClick={a.fn} style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:14,padding:'16px',display:'flex',gap:12,alignItems:'center',textAlign:'left',boxShadow:`0 1px 4px rgba(13,92,120,.07)`,width:'100%'}}>
              <div style={{width:40,height:40,borderRadius:10,background:a.bg,border:`1.5px solid ${a.br}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:800,color:V.ink}}>{a.label}</div>
                <div style={{fontSize:11,color:V.ink3,fontWeight:600}}>{a.desc}</div>
              </div>
              <div style={{fontSize:13,fontWeight:800,color:V.teal,flexShrink:0}}>{a.link}</div>
            </button>
          ))}
        </div>

        {/* AI */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:14,overflow:'hidden',marginBottom:20,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{background:'#0a0a1a',color:'white',padding:'9px 14px',display:'flex',alignItems:'center',gap:7,fontSize:11,letterSpacing:'1.2px',textTransform:'uppercase',fontWeight:700}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#4caf50',boxShadow:'0 0 0 3px rgba(76,175,80,.2)',flexShrink:0}}/>
            Asistente IA · Consultas fiscales
          </div>
          <div style={{padding:'12px 14px'}}>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askAI()} placeholder="¿Cuándo vence el monotributo este mes?"
                style={{flex:1,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'9px 10px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none'}}/>
              <button onClick={()=>askAI()} disabled={aiLoading} style={{background:V.teal,color:'white',border:'none',borderRadius:8,padding:'9px 14px',fontSize:13,fontWeight:800,opacity:aiLoading?.6:1,whiteSpace:'nowrap'}}>
                {aiLoading?'…':'Consultar →'}
              </button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['Vencimientos esta semana','Cuánto pago','Novedades ARCA','Ver deuda AFIP'].map(c=>(
                <button key={c} onClick={()=>askAI(c)} style={{background:V.bg,border:`1px solid ${V.border}`,borderRadius:20,padding:'4px 10px',fontSize:11,fontWeight:700,color:V.ink3}}>{c}</button>
              ))}
            </div>
            {(aiLoading||aiResp)&&<div style={{marginTop:10,padding:'10px 12px',background:V.bg,borderRadius:8,borderLeft:`3px solid ${V.teal}`,fontSize:13,color:V.ink2,fontWeight:600,lineHeight:1.75,whiteSpace:'pre-wrap'}}>
              {aiLoading?<span style={{color:V.ink3}}>Consultando ARCA/AFIP…</span>:aiResp}
            </div>}
          </div>
        </div>

        {/* CAPTURA */}
        <div className="ff-captura" style={{background:`linear-gradient(135deg,${V.tealDark} 0%,${V.teal} 100%)`,position:'relative',overflow:'hidden',boxShadow:`0 8px 32px rgba(13,92,120,.25)`}}>
          <div style={{position:'absolute',right:-50,top:-50,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:V.gold,marginBottom:5}}>Recordatorios gratis</div>
            <div style={{fontSize:20,fontWeight:900,color:'white',letterSpacing:'-0.3px',lineHeight:1.2,marginBottom:5}}>Recibí alertas antes<br/>de cada vencimiento</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontWeight:600}}>Sin spam. Solo cuando importa.</div>
          </div>
          <div className="ff-cap-form" style={{position:'relative',zIndex:1}}>
            {emailOk
              ?<div style={{color:V.gold,fontSize:15,fontWeight:800}}>✓ ¡Listo! Revisá tu email.</div>
              :<>
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  {[{key:'mono',label:'Monotributista'},{key:'ri',label:'Resp. Inscripto'},{key:'aut',label:'Autónomo'}].map(op=>(
                    <label key={op.key} style={{display:'flex',alignItems:'center',gap:5,cursor:tipoDisabled(op.key)?'not-allowed':'pointer',opacity:tipoDisabled(op.key)?.4:1}}>
                      <input type="checkbox" checked={tiposSel.includes(op.key)} disabled={tipoDisabled(op.key)} onChange={()=>toggleTipo(op.key)} style={{width:15,height:15,accentColor:V.gold}}/>
                      <span style={{fontSize:12,fontWeight:700,color:'white'}}>{op.label}</span>
                    </label>
                  ))}
                </div>
                {suscError&&<div style={{fontSize:12,color:'#fca5a5',fontWeight:600}}>{suscError}</div>}
                <div className="ff-cap-input-row">
                  <input ref={capturaRef} type="email" placeholder="tu@email.com" value={email}
                    onChange={e=>{setEmail(e.target.value);setSuscError('')}}
                    onKeyDown={e=>e.key==='Enter'&&suscribir()}
                    style={{background:'rgba(255,255,255,.25)',border:'1.5px solid rgba(255,255,255,.6)',borderRadius:8,padding:'10px 14px',fontSize:13,fontWeight:600,color:'white',outline:'none',flex:1,minWidth:0}}/>
                  <button onClick={suscribir} style={{background:V.gold,color:V.ink,border:'none',borderRadius:8,padding:'10px 16px',fontSize:13,fontWeight:900,whiteSpace:'nowrap',boxShadow:`0 2px 8px rgba(245,166,35,.4)`,flexShrink:0}}>
                    Activar →
                  </button>
                </div>
              </>
            }
          </div>
        </div>

      </main>

      {toast&&<div style={{position:'fixed',bottom:16,right:16,left:16,background:V.ink,color:'white',borderRadius:10,padding:'12px 16px',fontSize:13,fontWeight:700,boxShadow:`0 4px 16px rgba(13,92,120,.2)`,zIndex:999,textAlign:'center',animation:'cardUp .3s ease'}}>{toast}</div>}
    </>
  )
}
