'use client'

import { useMemo, useState } from 'react'

type Modo = 'personal' | 'comercial'
type Via = 'correo' | 'courier' | 'general'

const box = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:20, boxShadow:'0 4px 20px #0f172a0d' }
const input = { width:'100%', minHeight:46, border:'2px solid #e2e8f0', borderRadius:9, padding:'10px 12px', fontFamily:'inherit', fontSize:16, marginTop:6, boxSizing:'border-box' as const }
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:14 }
const money=(n:number)=>n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const num=(v:string)=>Math.max(0,Number(v)||0)

export default function Importaciones2026(){
  const [modo,setModo]=useState<Modo>('personal')
  const [via,setVia]=useState<Via>('courier')
  const [fob,setFob]=useState('')
  const [envio,setEnvio]=useState('')
  const [tc,setTc]=useState('')
  const [derecho,setDerecho]=useState('20')
  const [primerosCinco,setPrimerosCinco]=useState(true)

  const r=useMemo(()=>{
    const f=num(fob), e=num(envio), t=num(tc), der=num(derecho)/100
    const cif=(f+e)*t
    const franquiciaPersonal=modo==='personal' && primerosCinco && f<=400 && (via==='correo' || via==='courier')
    const derechos=franquiciaPersonal?0:cif*der
    const estadistica=franquiciaPersonal?0:cif*0.03
    const baseIva=cif+derechos+estadistica
    const iva=baseIva*0.21
    const tributos=derechos+estadistica+iva
    return {cif,derechos,estadistica,iva,tributos,total:cif+tributos,franquiciaPersonal}
  },[modo,via,fob,envio,tc,derecho,primerosCinco])

  const advertencia = modo==='personal' && primerosCinco && num(fob)>400
    ? 'Superás USD 400 FOB. La franquicia deja de ser total y el tratamiento del excedente depende de la liquidación aduanera. Para evitar una falsa precisión, esta estimación calcula el caso sin franquicia completa.'
    : null

  return <main style={{background:'#f8fafc',minHeight:'100vh',fontFamily:'Nunito, sans-serif',color:'#102a36'}}>
    <header style={{background:'linear-gradient(135deg,#ea580c,#9a3412)',color:'white',padding:'48px 20px',textAlign:'center'}}>
      <h1 style={{fontSize:'clamp(30px,5vw,46px)',margin:'0 0 10px',fontWeight:900}}>Importar a Argentina, explicado fácil</h1>
      <p style={{maxWidth:760,margin:'0 auto',fontSize:18,lineHeight:1.55}}>Estimá impuestos y entendé qué cambia si comprás para uso personal, por courier, Correo Argentino o para tu negocio.</p>
    </header>

    <section style={{maxWidth:900,margin:'0 auto',padding:'28px 18px 44px'}}>
      <div style={box}>
        <h2 style={{margin:'0 0 6px'}}>Primero: ¿qué tipo de importación querés hacer?</h2>
        <p style={{margin:'0 0 18px',color:'#64748b',lineHeight:1.6}}>Esto cambia más que el producto en sí. Elegí la situación más parecida a la tuya.</p>
        <div style={grid}>
          <button onClick={()=>setModo('personal')} style={{padding:16,borderRadius:12,border:`2px solid ${modo==='personal'?'#ea580c':'#e2e8f0'}`,background:modo==='personal'?'#fff7ed':'white',fontFamily:'inherit',fontWeight:800,cursor:'pointer'}}>🛍️ Es para uso personal</button>
          <button onClick={()=>setModo('comercial')} style={{padding:16,borderRadius:12,border:`2px solid ${modo==='comercial'?'#ea580c':'#e2e8f0'}`,background:modo==='comercial'?'#fff7ed':'white',fontFamily:'inherit',fontWeight:800,cursor:'pointer'}}>🏪 Es para mi negocio / reventa</button>
        </div>
        <div style={{...grid,marginTop:18}}>
          <label><strong>¿Cómo ingresa?</strong><select value={via} onChange={e=>setVia(e.target.value as Via)} style={input}><option value="correo">Correo Argentino / Puerta a Puerta</option><option value="courier">Courier (DHL, FedEx, UPS, etc.)</option><option value="general">Régimen general</option></select></label>
          <label><strong>Valor FOB del producto (USD)</strong><input value={fob} onChange={e=>setFob(e.target.value)} type="number" min="0" style={input} placeholder="Ej.: 250"/></label>
          <label><strong>Envío / flete (USD)</strong><input value={envio} onChange={e=>setEnvio(e.target.value)} type="number" min="0" style={input} placeholder="Ej.: 40"/></label>
          <label><strong>Tipo de cambio aduanero</strong><input value={tc} onChange={e=>setTc(e.target.value)} type="number" min="0" style={input} placeholder="Cotización aplicable"/></label>
        </div>
        {modo==='personal' && via!=='general' ? <label style={{display:'flex',gap:10,alignItems:'flex-start',marginTop:18,lineHeight:1.5}}><input type="checkbox" checked={primerosCinco} onChange={e=>setPrimerosCinco(e.target.checked)}/><span>Es uno de mis primeros 5 envíos del año. Si además no supera USD 400 FOB, puede quedar exento de derechos de importación y tasa de estadística.</span></label>:null}
        <details style={{marginTop:18}}><summary style={{cursor:'pointer',fontWeight:800,color:'#9a3412'}}>⚙️ Tengo el arancel de mi producto</summary><div style={{marginTop:12,maxWidth:340}}><label><strong>Derecho de importación (%)</strong><input value={derecho} onChange={e=>setDerecho(e.target.value)} type="number" min="0" step="0.1" style={input}/></label><p style={{fontSize:13,color:'#64748b',lineHeight:1.5}}>El porcentaje real depende de la posición arancelaria/NCM. No uses 20% como valor definitivo si no conocés el código de tu producto.</p></div></details>
        {advertencia?<div style={{marginTop:18,padding:14,borderRadius:10,background:'#fff7ed',border:'1px solid #fdba74',lineHeight:1.55}}>⚠️ {advertencia}</div>:null}
        <div style={{...grid,marginTop:24}}>
          <div style={{padding:16,borderRadius:12,background:'#f1f5f9'}}><div style={{fontSize:13,color:'#64748b'}}>Producto + envío en pesos</div><strong style={{fontSize:24}}>{money(r.cif)}</strong></div>
          <div style={{padding:16,borderRadius:12,background:'#f1f5f9'}}><div style={{fontSize:13,color:'#64748b'}}>Tributos estimados</div><strong style={{fontSize:24}}>{money(r.tributos)}</strong></div>
          <div style={{padding:16,borderRadius:12,background:'#fff7ed',border:'2px solid #fdba74'}}><div style={{fontSize:13,color:'#9a3412'}}>Costo total estimado</div><strong style={{fontSize:27,color:'#9a3412'}}>{money(r.total)}</strong></div>
        </div>
        <p style={{margin:'14px 0 0',fontSize:13,color:'#64748b',lineHeight:1.6}}>Incluye en esta estimación derechos, tasa estadística e IVA cuando corresponde. No incluye honorarios de courier, almacenaje, despachante, impuestos internos, percepciones adicionales, antidumping ni intervenciones especiales.</p>
      </div>

      <section style={{...box,marginTop:22}}><h2 style={{marginTop:0}}>En pocas palabras: ¿qué te pueden cobrar?</h2><div style={grid}>{[['📦','Derecho de importación','Depende del producto y de su posición arancelaria.'],['📊','Tasa de estadística','En el régimen general puede corresponder; la tasa general usada en esta herramienta es 3%.'],['🧾','IVA','Se calcula sobre la base aduanera más los tributos que integran su base.'],['➕','Otros cargos','Puede haber percepciones, impuestos internos, antidumping, almacenaje, courier o despachante.']].map(x=><div key={x[1]} style={{padding:14,borderRadius:12,background:'#f8fafc'}}><div style={{fontSize:22}}>{x[0]}</div><strong>{x[1]}</strong><p style={{margin:'5px 0 0',fontSize:14,color:'#64748b',lineHeight:1.55}}>{x[2]}</p></div>)}</div></section>

      <section style={{...box,marginTop:22}}><h2 style={{marginTop:0}}>Correo, courier o régimen general: ¿cuál es la diferencia?</h2><div style={{display:'grid',gap:12}}><div style={{padding:14,borderRadius:12,background:'#eff6ff'}}><strong>📮 Correo Argentino / Puerta a Puerta</strong><p style={{margin:'6px 0 0',lineHeight:1.6}}>Para compras de uso personal de hasta USD 3.000 FOB, hasta 3 unidades de la misma especie y hasta 20 kg por paquete.</p></div><div style={{padding:14,borderRadius:12,background:'#ecfdf5'}}><strong>✈️ Courier</strong><p style={{margin:'6px 0 0',lineHeight:1.6}}>Admite envíos de hasta USD 3.000 FOB y hasta 50 kg por paquete. Puede tener o no finalidad comercial; la franquicia de pequeño envío exige requisitos adicionales.</p></div><div style={{padding:14,borderRadius:12,background:'#f8fafc'}}><strong>🏗️ Régimen general</strong><p style={{margin:'6px 0 0',lineHeight:1.6}}>Si el envío no encuadra en correo o courier, o está sujeto a exclusiones/intervenciones, puede requerir una destinación aduanera y despachante.</p></div></div></section>

      <section style={{...box,marginTop:22}}><h2 style={{marginTop:0}}>La franquicia de USD 400, sin vueltas</h2><p style={{lineHeight:1.7}}>Para determinados envíos de uso personal, los primeros <strong>5 envíos del año</strong> de hasta <strong>USD 400 FOB</strong> pueden quedar exentos de <strong>derechos de importación y tasa de estadística</strong>. El IVA sigue correspondiendo, al igual que Impuestos Internos si el producto está alcanzado.</p><p style={{lineHeight:1.7}}>Si superás USD 400 FOB o agotaste los 5 envíos, cambia el tratamiento. Por eso la calculadora no presenta la franquicia como una exención automática para cualquier compra.</p></section>

      <section style={{...box,marginTop:22}}><h2 style={{marginTop:0}}>Si importás para vender o para tu negocio</h2><p style={{lineHeight:1.7}}>No uses las reglas de “compra personal” para calcular una importación comercial. El courier puede admitir operaciones comerciales dentro de sus límites, pero los tributos se liquidan según el régimen aplicable y pueden existir percepciones, intervenciones o requisitos adicionales.</p><p style={{lineHeight:1.7}}>Si el envío supera los límites del courier o está excluido, corresponde revisar el <strong>régimen general de importaciones</strong>.</p></section>

      <section style={{...box,marginTop:22}}><h2 style={{marginTop:0}}>Antes de comprar, revisá estas 4 cosas</h2><ol style={{paddingLeft:22,lineHeight:1.8}}><li>El <strong>valor FOB</strong> del producto.</li><li>Si es para <strong>uso personal o comercial</strong>.</li><li>La <strong>posición arancelaria/NCM</strong>, porque define el derecho real.</li><li>Si el producto necesita una <strong>intervención especial</strong> o está excluido del régimen simplificado.</li></ol></section>

      <section style={{...box,marginTop:22}}><h2 style={{marginTop:0}}>Fuentes oficiales y actualización</h2><p style={{lineHeight:1.65}}>Revisado el 13/09/2026. La información se basa en ARCA y su normativa vigente sobre envíos internacionales. El Arancel Integrado debe consultarse para conocer el tratamiento exacto de cada producto.</p><div style={{display:'flex',flexWrap:'wrap',gap:10}}><a href="https://www.arca.gob.ar/envios-internacionales/" target="_blank" rel="noopener noreferrer">ARCA · Envíos internacionales ↗</a><a href="https://www.arca.gob.ar/envios-internacionales/courier/importacion/pequenios-envios.asp" target="_blank" rel="noopener noreferrer">Pequeños envíos ↗</a><a href="https://www.arca.gob.ar/envios-internacionales/puerta-a-puerta/" target="_blank" rel="noopener noreferrer">Puerta a Puerta ↗</a><a href="https://www.arca.gob.ar/aduana/arancelintegrado/" target="_blank" rel="noopener noreferrer">Arancel Integrado ↗</a></div></section>
    </section>
  </main>
}
