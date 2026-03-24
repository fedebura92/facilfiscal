'use client'
import { useState, useEffect, useRef } from 'react'

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

  function toggleTipo(t:string){
    setSuscError('')
    setTiposSel(prev=>{
      if(prev.includes(t)) return prev.filter(x=>x!==t)
      return [...prev,t]
    })
  }

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

  const vencOrd=[...venc].filter(v=>diff(v.fecha)>=0).sort((a,b)=>diff(a.fecha)-diff(b.fecha))
  const cards=vencOrd.slice(0,3)
  const proximos=vencOrd.filter(v=>diff(v.fecha)<=10).slice(0,8)
  const idx=parseInt(catIdx)
  const os=conOS&&tipo==='mono'?MONTOS.mono.os:0
  const total=catIdx!==''?MONTOS[tipo].imp[idx]+MONTOS[tipo].prev[idx]+os:0
  const tipoNombre:Record<Tipo,string>={mono:'Monotributo',ri:'Resp. Inscripto',aut:'Autónomo'}
  const fechaHoy=mounted?new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(new Date()):''

  const V={
    tealDark:'#0d5c78',teal:'#1a7fa8',tealMid:'#2490bc',tealLight:'#e8f6fb',tealRing:'#a8ddf0',
    gold:'#f5a623',goldDark:'#e8920a',goldLight:'#fff8ec',goldRing:'#fde4a0',
    red:'#e53535',redBg:'#fff1f1',redRing:'#ffc8c8',
    amber:'#d97706',amberBg:'#fffbeb',amberRing:'#fde68a',
    bg:'#f4f7f9',surface:'#fff',border:'#e2e8ed',
    ink:'#0f2733',ink2:'#3d5a6b',ink3:'#7a9aaa',ink4:'#b8cdd6',
  }

  const cardCfg=(d:number)=>d===0
    ?{bg:`linear-gradient(150deg,#fff 65%,${V.redBg})`,border:V.redRing,iconBg:V.redBg,pill:{bg:V.redBg,color:V.red,border:V.redRing},txt:'🔴 Vence HOY',diasColor:V.red,diasTxt:'¡HOY!',btnDanger:true}
    :d===1
    ?{bg:`linear-gradient(150deg,#fff 65%,${V.goldLight})`,border:V.goldRing,iconBg:V.goldLight,pill:{bg:V.goldLight,color:V.amber,border:V.goldRing},txt:'🟡 Vence mañana',diasColor:V.amber,diasTxt:'Mañana',btnDanger:false}
    :{bg:`linear-gradient(150deg,#fff 65%,${V.tealLight})`,border:V.tealRing,iconBg:V.tealLight,pill:{bg:V.tealLight,color:V.tealDark,border:V.tealRing},txt:`🟢 En ${d} días`,diasColor:V.teal,diasTxt:`En ${d} días`,btnDanger:false}

  const s={
    header:{background:V.surface,borderBottom:`1px solid ${V.border}`,position:'sticky' as const,top:0,zIndex:100,boxShadow:`0 1px 4px rgba(13,92,120,.07)`},
    headerInner:{maxWidth:1120,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16},
    main:{maxWidth:1120,margin:'0 auto',padding:'28px 24px 80px'},
    twoCol:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24},
    accionGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24},
    cardsGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,marginBottom:28},
    card:{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`},
    cardHead:{padding:'15px 20px',borderBottom:`1px solid ${V.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'},
    cardTitle:{fontSize:15,fontWeight:800,color:V.ink},
    sectionLabel:{fontSize:11,fontWeight:800,letterSpacing:'1.5px',textTransform:'uppercase' as const,color:V.ink3,marginBottom:13},
    captura:{background:`linear-gradient(135deg,${V.tealDark} 0%,${V.teal} 100%)`,borderRadius:20,padding:'36px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:28,position:'relative' as const,overflow:'hidden',boxShadow:`0 8px 32px rgba(13,92,120,.25)`},
  }

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
        input::placeholder{color:rgba(255,255,255,.9)!important}
      `}}/>

      <header style={s.header}>
        <div style={s.headerInner}>
          <a href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',flexShrink:0}}>
            <svg viewBox="0 0 44 44" fill="none" width={44} height={44}>
              <rect x="6" y="4" width="24" height="30" rx="4" fill="#1a7fa8"/>
              <rect x="10" y="11" width="12" height="2.5" rx="1.25" fill="rgba(255,255,255,.5)"/>
              <rect x="10" y="16" width="16" height="2.5" rx="1.25" fill="rgba(255,255,255,.4)"/>
              <rect x="10" y="21" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,.3)"/>
              <path d="M24 4 L30 10 L24 10 Z" fill="rgba(255,255,255,.25)"/>
              <path d="M10 24 L17 31 L32 15" stroke="#f5a623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{display:'flex',flexDirection:'column',lineHeight:1}}>
              <div><span style={{fontSize:19,fontWeight:900,color:V.tealDark}}>Fácil</span><span style={{fontSize:19,fontWeight:900,color:V.teal}}> Fiscal</span></div>
              <span style={{fontSize:9,fontWeight:600,color:V.ink3,marginTop:3}}>Tu solución contable y fiscal simplificada</span>
            </div>
          </a>
          <div style={{display:'flex',background:V.bg,border:`1.5px solid ${V.border}`,borderRadius:12,padding:3,gap:2}}>
            {(['mono','ri','aut'] as Tipo[]).map((t,i)=>(
              <button key={t} onClick={()=>setTipo(t)} style={{padding:'8px 18px',borderRadius:8,border:'none',background:tipo===t?V.teal:'none',color:tipo===t?'white':V.ink3,fontSize:13,fontWeight:700,whiteSpace:'nowrap'}}>
                {['Monotributo','Resp. Inscripto','Autónomo'][i]}
              </button>
            ))}
          </div>
          <button onClick={()=>{capturaRef.current?.scrollIntoView({behavior:'smooth'});setTimeout(()=>capturaRef.current?.focus(),600)}}
            style={{background:V.gold,color:V.ink,border:'none',borderRadius:8,padding:'9px 20px',fontSize:13,fontWeight:800,whiteSpace:'nowrap',boxShadow:`0 2px 8px rgba(245,166,35,.35)`}}>
            🔔 Activar alertas
          </button>
        </div>
      </header>

      <main style={s.main}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
          <div style={{fontSize:13,color:V.ink3,fontWeight:600}}>Hoy es <strong style={{color:V.ink2}}>{fechaHoy}</strong></div>
          <div style={{display:'inline-flex',alignItems:'center',gap:7,background:V.tealLight,border:`1.5px solid ${V.tealRing}`,borderRadius:20,padding:'5px 14px 5px 10px',fontSize:12,fontWeight:800,color:V.tealDark}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:V.teal}}/>{tipoNombre[tipo]}
          </div>
        </div>

        <div style={s.sectionLabel}>📅 Vencimientos de hoy</div>
        <div style={s.cardsGrid}>
          {cards.length===0
            ?<div style={{padding:'24px 0',color:V.ink3,fontSize:13,fontWeight:600,gridColumn:'1/-1'}}>✅ Sin vencimientos próximos inmediatos.</div>
            :cards.map((v,i)=>{
              const d=diff(v.fecha); const c=cardCfg(d)
              return(
                <div key={v.id} style={{background:c.bg,border:`1.5px solid ${c.border}`,borderRadius:20,padding:'22px 22px 18px',display:'flex',flexDirection:'column',gap:13,boxShadow:`0 1px 4px rgba(13,92,120,.07)`,animation:`cardUp .35s ease ${i*.09}s both`}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                    <div style={{width:42,height:42,borderRadius:12,background:c.iconBg,border:`1.5px solid ${c.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{v.emoji}</div>
                    <div style={{background:c.pill.bg,color:c.pill.color,border:`1.5px solid ${c.pill.border}`,display:'inline-flex',alignItems:'center',borderRadius:20,padding:'5px 11px',fontSize:11,fontWeight:800,flexShrink:0}}>{c.txt}</div>
                  </div>
                  <div>
                    <div style={{fontSize:17,fontWeight:900,color:V.ink,letterSpacing:'-0.3px',lineHeight:1.2,marginTop:8}}>{v.nombre}</div>
                    <div style={{fontSize:12,color:V.ink3,fontWeight:600,marginTop:2}}>{v.detalle}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',borderTop:`1px solid ${V.border}`,paddingTop:11}}>
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

        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.cardTitle}>📋 Próximos vencimientos</div>
            <div style={{fontSize:11,fontWeight:700,background:V.tealLight,color:V.tealDark,border:`1px solid ${V.tealRing}`,borderRadius:20,padding:'3px 10px'}}>{proximos.length} vencimiento{proximos.length!==1?'s':''}</div>
          </div>
          <div>
            {proximos.length===0
              ?<div style={{padding:'16px 20px',color:V.ink3,fontSize:13,fontWeight:600}}>Sin vencimientos en los próximos 10 días.</div>
              :proximos.map((v,i)=>{
                const d=diff(v.fecha)
                const dot=d===0?V.red:d<=3?V.gold:V.teal
                const mb=d===0?{bg:V.redBg,color:V.red,border:`1px solid ${V.redRing}`,txt:'HOY'}
                  :d===1?{bg:V.amberBg,color:V.amber,border:`1px solid ${V.amberRing}`,txt:'Mañana'}
                  :d<=4?{bg:V.amberBg,color:V.amber,border:`1px solid ${V.amberRing}`,txt:`${d} días`}
                  :{bg:V.tealLight,color:V.tealDark,border:`1px solid ${V.tealRing}`,txt:`${d} días`}
                return(
                  <div key={v.id} style={{display:'flex',alignItems:'center',gap:14,padding:'11px 20px',borderBottom:`1px solid ${V.border}`,animation:`cardUp .3s ease ${i*.05}s both`}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:dot,flexShrink:0}}/>
                    <div style={{fontSize:12,fontWeight:800,color:V.ink3,minWidth:72}}>{fmtS(v.fecha)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:V.ink}}>{v.emoji} {v.nombre}</div>
                      <div style={{fontSize:11,color:V.ink3,fontWeight:600}}>{v.detalle}</div>
                    </div>
                    <div style={{fontSize:10,fontWeight:800,padding:'3px 9px',borderRadius:20,background:mb.bg,color:mb.color,border:mb.border,flexShrink:0}}>{mb.txt}</div>
                  </div>
                )
              })
            }
          </div>
        </div>

        <div style={s.twoCol}>
          <div style={{...s.card,marginBottom:0}}>
            <div style={s.cardHead}><div style={s.cardTitle}>⚠️ Alertas importantes</div></div>
            {alertas.map(a=>{
              const ib=a.tipo==='danger'?{bg:V.redBg,border:`1.5px solid ${V.redRing}`}:a.tipo==='info'?{bg:V.tealLight,border:`1.5px solid ${V.tealRing}`}:{bg:V.goldLight,border:`1.5px solid ${V.goldRing}`}
              return(
                <div key={a.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'13px 18px',borderBottom:`1px solid ${V.border}`}}>
                  <div style={{width:32,height:32,borderRadius:9,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,...ib}}>{a.icon}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:800,color:V.ink,marginBottom:2}}>{a.title}</div>
                    <div style={{fontSize:11,color:V.ink3,fontWeight:600,lineHeight:1.5}}>{a.description}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{...s.card,marginBottom:0}}>
            <div style={s.cardHead}><div style={s.cardTitle}>🧮 ¿Cuánto tengo que pagar?</div></div>
            <div style={{padding:'16px 18px'}}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.8px',textTransform:'uppercase',color:V.ink3,marginBottom:6}}>Tu categoría</div>
              <select value={catIdx} onChange={e=>setCatIdx(e.target.value)} style={{width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:14,fontWeight:600,color:V.ink,background:V.bg,outline:'none',marginBottom:12}}>
                <option value="" disabled>— Elegí tu categoría —</option>
                {MONTOS[tipo].cats.map((c,i)=><option key={i} value={i}>{c} — hasta {MONTOS[tipo].limites[i]}/año</option>)}
              </select>
              {tipo==='mono'&&<>
                <div style={{fontSize:11,fontWeight:800,letterSpacing:'0.8px',textTransform:'uppercase',color:V.ink3,marginBottom:6}}>Obra social</div>
                <select value={conOS?'si':'no'} onChange={e=>setConOS(e.target.value==='si')} style={{width:'100%',border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:14,fontWeight:600,color:V.ink,background:V.bg,outline:'none',marginBottom:12}}>
                  <option value="si">Incluir obra social</option>
                  <option value="no">Sin obra social</option>
                </select>
              </>}
              <div style={{background:`linear-gradient(135deg,${V.tealDark},${V.tealMid})`,borderRadius:8,padding:'18px 16px',textAlign:'center',minHeight:90,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                {catIdx!==''?<>
                  <div style={{fontSize:32,fontWeight:900,color:'white',letterSpacing:'-0.5px',lineHeight:1,marginBottom:5}}>{money(total)}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.65)',fontWeight:600,marginBottom:10}}>por mes · valores estimados 2026</div>
                  <div style={{display:'flex',gap:10,width:'100%'}}>
                    {[['Impositivo',MONTOS[tipo].imp[idx]],['Previsional',MONTOS[tipo].prev[idx]],...(os?[['Obra social',os]]:[])].map(([l,val])=>(
                      <div key={l as string} style={{flex:1,background:'rgba(255,255,255,.1)',borderRadius:7,padding:'7px 8px',textAlign:'center'}}>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.55)',fontWeight:700,textTransform:'uppercase'}}>{l}</div>
                        <div style={{fontSize:14,fontWeight:900,color:'white',marginTop:2}}>{money(val as number)}</div>
                      </div>
                    ))}
                  </div>
                </>:<div style={{fontSize:16,fontWeight:700,color:'rgba(255,255,255,.4)'}}>Seleccioná una categoría</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={s.sectionLabel}>Acciones rápidas</div>
        <div style={s.accionGrid}>
          {[
            {icon:'🏦',bg:V.tealLight,br:V.tealRing,label:'Pagar en AFIP',desc:'Generá tu VEP y pagá desde home banking',link:'Ir a AFIP →',fn:()=>window.open('https://www.afip.gob.ar','_blank')},
            {icon:'🧾',bg:V.goldLight,br:V.goldRing,label:'Ver cómo facturar',desc:'Guía Factura C electrónica paso a paso',link:'Ver guía →',fn:()=>showToast('Guía próximamente')},
            {icon:'📊',bg:V.bg,br:V.border,label:'Ver mi categoría',desc:'Comprobá si debés recategorizarte',link:'Verificar →',fn:()=>showToast('Verificador próximamente')},
          ].map(a=>(
            <button key={a.label} onClick={a.fn} style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,padding:'20px 18px',display:'flex',flexDirection:'column',gap:10,textAlign:'left',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
              <div style={{width:44,height:44,borderRadius:12,background:a.bg,border:`1.5px solid ${a.br}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21}}>{a.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:V.ink,lineHeight:1.2}}>{a.label}</div>
                <div style={{fontSize:11,color:V.ink3,fontWeight:600,marginTop:1}}>{a.desc}</div>
              </div>
              <div style={{marginTop:'auto',fontSize:12,fontWeight:800,color:V.teal}}>{a.link}</div>
            </button>
          ))}
        </div>

        <div style={{...s.card,marginBottom:24}}>
          <div style={{background:'#0a0a1a',color:'white',padding:'10px 16px',display:'flex',alignItems:'center',gap:8,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#4caf50',boxShadow:'0 0 0 3px rgba(76,175,80,.2)'}}/>
            Asistente Fiscal IA · Datos de ARCA/AFIP en tiempo real
          </div>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askAI()} placeholder="Ej: ¿Cuándo vence el monotributo este mes?"
                style={{flex:1,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none'}}/>
              <button onClick={()=>askAI()} disabled={aiLoading} style={{background:V.teal,color:'white',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,fontWeight:800,opacity:aiLoading?.6:1,whiteSpace:'nowrap'}}>
                {aiLoading?'…':'Consultar →'}
              </button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['Vencimientos esta semana','Cuánto pago','Pagar home banking','Novedades ARCA','Ver deuda AFIP'].map(c=>(
                <button key={c} onClick={()=>askAI(c)} style={{background:V.bg,border:`1px solid ${V.border}`,borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:V.ink3}}>
                  {c}
                </button>
              ))}
            </div>
            {(aiLoading||aiResp)&&<div style={{marginTop:12,padding:'12px 14px',background:V.bg,borderRadius:8,borderLeft:`3px solid ${V.teal}`,fontSize:13,color:V.ink2,fontWeight:600,lineHeight:1.75,whiteSpace:'pre-wrap'}}>
              {aiLoading?<span style={{color:V.ink3}}>Consultando ARCA/AFIP…</span>:aiResp}
            </div>}
          </div>
        </div>

        {/* 7. CAPTURA CON CHECKBOXES */}
        <div style={s.captura}>
          <div style={{position:'absolute',right:-50,top:-50,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,.05)'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:V.gold,marginBottom:6}}>Recordatorios gratis</div>
            <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:'-0.3px',lineHeight:1.2,marginBottom:5}}>Recibí alertas antes<br/>de cada vencimiento</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontWeight:600}}>Sin spam. Solo cuando importa.</div>
          </div>
          <div style={{position:'relative',zIndex:1,flexShrink:0,minWidth:300}}>
            {emailOk
              ?<div style={{color:V.gold,fontSize:16,fontWeight:800}}>✓ ¡Listo! Revisá tu email para confirmar.</div>
              :<div>
                {/* CHECKBOXES */}
                <div style={{display:'flex',gap:16,marginBottom:12}}>
                  {[
                    {key:'mono',label:'Monotributista'},
                    {key:'ri',  label:'Resp. Inscripto'},
                    {key:'aut', label:'Autónomo'},
                  ].map(op=>(
                    <label key={op.key} style={{display:'flex',alignItems:'center',gap:6,cursor:tipoDisabled(op.key)?'not-allowed':'pointer',opacity:tipoDisabled(op.key)?.4:1}}>
                      <input
                        type="checkbox"
                        checked={tiposSel.includes(op.key)}
                        disabled={tipoDisabled(op.key)}
                        onChange={()=>toggleTipo(op.key)}
                        style={{width:16,height:16,accentColor:V.gold,cursor:'pointer'}}
                      />
                      <span style={{fontSize:12,fontWeight:700,color:'white'}}>{op.label}</span>
                    </label>
                  ))}
                </div>
                {/* ERROR */}
                {suscError&&<div style={{fontSize:12,color:'#fca5a5',fontWeight:600,marginBottom:8}}>{suscError}</div>}
                {/* INPUT + BOTÓN */}
                <div style={{display:'flex',gap:8}}>
                  <input ref={capturaRef} type="email" placeholder="tu@email.com" value={email}
                    onChange={e=>{setEmail(e.target.value);setSuscError('')}}
                    onKeyDown={e=>e.key==='Enter'&&suscribir()}
                    style={{background:'rgba(255,255,255,.25)',border:'1.5px solid rgba(255,255,255,.6)',borderRadius:8,padding:'11px 16px',fontSize:13,fontWeight:600,color:'white',outline:'none',flex:1}}
                  />
                  <button onClick={suscribir} style={{background:V.gold,color:V.ink,border:'none',borderRadius:8,padding:'11px 20px',fontSize:13,fontWeight:900,whiteSpace:'nowrap',boxShadow:`0 2px 10px rgba(245,166,35,.4)`}}>
                    Activar →
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </main>

      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:V.ink,color:'white',borderRadius:8,padding:'12px 20px',fontSize:13,fontWeight:700,boxShadow:`0 4px 16px rgba(13,92,120,.1)`,zIndex:999,animation:'cardUp .3s ease'}}>{toast}</div>}
    </>
  )
}
