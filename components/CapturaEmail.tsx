'use client'
import { useState,forwardRef } from 'react'
const OPCIONES=[{key:'mono',label:'Monotributista'},{key:'ri',label:'Resp. Inscripto'},{key:'aut',label:'Autónomo'}]
const CapturaEmail=forwardRef<HTMLInputElement,{tipoDefault:'mono'|'ri'|'aut'}>(function CapturaEmail({tipoDefault},ref){
  const[email,setEmail]=useState(''),[ok,setOk]=useState(false),[tipos,setTipos]=useState<string[]>([tipoDefault]),[terminacion,setTerminacion]=useState(''),[dias,setDias]=useState(3),[error,setError]=useState(''),[loading,setLoading]=useState(false)
  const requiereCuit=tipos.includes('ri')||tipos.includes('aut')
  const disabled=(t:string)=>(t==='mono'&&tipos.includes('ri'))||(t==='ri'&&tipos.includes('mono'))
  const toggle=(t:string)=>{setError('');setTipos(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t])}
  async function submit(){
    if(!email.includes('@'))return setError('Ingresá un email válido')
    if(!tipos.length)return setError('Seleccioná al menos una categoría')
    if(requiereCuit&&!terminacion)return setError('Elegí el último número de tu CUIT')
    setLoading(true);setError('')
    try{const r=await fetch('/api/suscribir',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,tipos,terminacionCuit:terminacion||null,diasAnticipacion:dias})});const d=await r.json();if(!r.ok)return setError(d.error||'Error al guardar');setOk(true)}catch{setError('Error de conexión.')}finally{setLoading(false)}
  }
  const inputStyle={background:'rgba(255,255,255,.25)',border:'1.5px solid rgba(255,255,255,.6)',borderRadius:8,padding:'10px 12px',fontSize:13,fontWeight:600,color:'white',outline:'none'} as const
  return <div className="ff-captura" style={{background:'linear-gradient(135deg,var(--teal-dark),var(--teal))',position:'relative',overflow:'hidden',boxShadow:'var(--sh-lg)'}}>
    <div style={{position:'relative',zIndex:1}}><div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:'uppercase',color:'var(--gold)',marginBottom:5}}>Recordatorios gratis</div><div style={{fontSize:20,fontWeight:900,color:'white',lineHeight:1.2,marginBottom:5}}>Recibí alertas antes<br/>de cada vencimiento</div><div style={{fontSize:13,color:'rgba(255,255,255,.7)',fontWeight:600}}>Elegí cuándo. Sin spam.</div></div>
    <div className="ff-cap-form" style={{position:'relative',zIndex:1}}>
      {ok?<div style={{color:'var(--gold)',fontSize:15,fontWeight:800}}>✓ ¡Listo! Revisá tu email.</div>:<>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{OPCIONES.map(op=><label key={op.key} style={{display:'flex',alignItems:'center',gap:5,cursor:disabled(op.key)?'not-allowed':'pointer',opacity:disabled(op.key)?.4:1}}><input type="checkbox" checked={tipos.includes(op.key)} disabled={disabled(op.key)} onChange={()=>toggle(op.key)} style={{width:15,height:15,accentColor:'var(--gold)'}}/><span style={{fontSize:12,fontWeight:700,color:'white'}}>{op.label}</span></label>)}</div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {requiereCuit&&<label style={{fontSize:11,color:'white',fontWeight:700}}>Último número del CUIT<br/><select value={terminacion} onChange={e=>setTerminacion(e.target.value)} style={{...inputStyle,marginTop:4}}><option value="" style={{color:'#0f2733'}}>Elegir</option>{Array.from({length:10},(_,i)=><option key={i} value={i} style={{color:'#0f2733'}}>{i}</option>)}</select></label>}
          <label style={{fontSize:11,color:'white',fontWeight:700}}>Avisarme antes<br/><select value={dias} onChange={e=>setDias(Number(e.target.value))} style={{...inputStyle,marginTop:4}}><option value={1} style={{color:'#0f2733'}}>1 día</option><option value={3} style={{color:'#0f2733'}}>3 días</option><option value={7} style={{color:'#0f2733'}}>7 días</option></select></label>
        </div>
        {error&&<div style={{fontSize:12,color:'#fecaca',fontWeight:700}}>{error}</div>}
        <div className="ff-cap-input-row"><input ref={ref} type="email" placeholder="tu@email.com" value={email} onChange={e=>{setEmail(e.target.value);setError('')}} onKeyDown={e=>e.key==='Enter'&&submit()} style={{...inputStyle,flex:1,minWidth:0}}/><button onClick={submit} disabled={loading} style={{background:'var(--gold)',color:'var(--ink)',border:'none',borderRadius:8,padding:'10px 16px',fontSize:13,fontWeight:900,whiteSpace:'nowrap',cursor:loading?'not-allowed':'pointer',opacity:loading?.7:1}}>{loading?'Guardando…':'Activar →'}</button></div>
      </>}
    </div>
  </div>
})
export default CapturaEmail
