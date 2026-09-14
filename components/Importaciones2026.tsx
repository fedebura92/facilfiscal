'use client'

import { useMemo, useState } from 'react'

const C = {
  ink:'#102a36', ink2:'#365563', ink3:'#64748b', bg:'#f8fafc', white:'#fff', border:'#e2e8f0',
  orange:'#c2410c', orangeBg:'#fff7ed', orangeRing:'#fed7aa', green:'#166534', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  blue:'#0d5c78', blueBg:'#eaf6fb', blueRing:'#b9e2f0', amber:'#92400e', amberBg:'#fffbeb', amberRing:'#fde68a',
}

type Regimen = 'courier'|'correo'|'comercial'

const moneyUSD = (n:number) => new Intl.NumberFormat('es-AR',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n||0)

export default function Importaciones2026(){
  const [regimen,setRegimen]=useState<Regimen>('courier')
  const [fob,setFob]=useState('')
  const [cantidad,setCantidad]=useState('1')
  const [usados,setUsados]=useState('0')
  const fobN=Number(fob)||0
  const cantN=Number(cantidad)||0
  const usadosN=Number(usados)||0

  const diagnostico=useMemo(()=>{
    if(regimen==='comercial'){
      if(fobN>3000) return {ok:false,title:'Supera el límite habitual del Courier',text:'Para importación por Courier el valor FOB debe ser de hasta USD 3.000 por envío. Si lo supera, corresponde revisar el Régimen General.'}
      return {ok:true,title:'Puede ser comercial, pero no usa la franquicia personal',text:'El Courier puede admitir envíos con finalidad comercial dentro de sus límites. En ese caso no aplican las ventajas del “pequeño envío” personal de hasta USD 400: los tributos dependen de la mercadería, su NCM, origen y demás reglas aplicables.'}
    }
    if(fobN>3000) return {ok:false,title:'Supera el límite del régimen simplificado',text:'Los envíos personales por Courier o Correo Argentino deben tener un valor FOB de hasta USD 3.000. Por encima de ese valor corresponde revisar el Régimen General.'}
    if(cantN>3) return {ok:false,title:'Revisá la cantidad de unidades',text:'Para uso personal, el régimen admite hasta 3 unidades de la misma especie y no debe presumirse finalidad comercial.'}
    if(usadosN>=5) return {ok:false,title:'Ya usaste la franquicia anual',text:'La franquicia de hasta USD 400 FOB se aplica a los primeros 5 envíos del año calendario por persona. Los siguientes quedan alcanzados por los tributos correspondientes.'}
    if(fobN>0 && fobN<=400) return {ok:true,title:'Tu envío puede usar la franquicia de USD 400',text:'Si además cumple los demás requisitos, no paga derecho de importación ni tasa de estadística. Sí puede corresponder IVA e Impuestos Internos según la mercadería.'}
    if(fobN>400 && fobN<=3000) return {ok:true,title:'Puede entrar, pero la franquicia no cubre todo el envío',text:'Sobre el excedente de USD 400 FOB pueden corresponder derecho de importación y tasa de estadística, además de IVA e Impuestos Internos. El porcentaje exacto depende de la mercadería.'}
    return {ok:true,title:'Completá los datos para orientarte',text:'Te indicamos qué régimen mirar y qué conceptos pueden aparecer, sin inventar una alícuota que depende del producto.'}
  },[regimen,fobN,cantN,usadosN])

  const card=(active:boolean)=>({padding:'14px 16px',borderRadius:12,border:`2px solid ${active?C.orange:C.border}`,background:active?C.orangeBg:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:800,fontSize:14,textAlign:'left' as const,color:C.ink})

  return <main style={{background:C.bg,minHeight:'100vh',fontFamily:'Nunito, sans-serif',color:C.ink}}>
    <header style={{background:'linear-gradient(135deg,#ea580c,#9a3412)',color:'white',padding:'42px 20px',textAlign:'center'}}>
      <h1 style={{fontSize:'clamp(30px,5vw,46px)',margin:'0 0 12px',fontWeight:900}}>Importaciones 2026, explicado fácil</h1>
      <p style={{maxWidth:760,margin:'0 auto',fontSize:'clamp(16px,2vw,18px)',lineHeight:1.55}}>Primero vemos cómo entra tu compra. Después te mostramos qué impuestos pueden corresponder y cuándo necesitás mirar el arancel exacto del producto.</p>
    </header>

    <section style={{maxWidth:900,margin:'0 auto',padding:'28px 18px 50px'}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px',boxShadow:'0 4px 20px #0f172a12'}}>
        <h2 style={{margin:'0 0 8px',fontSize:24}}>1. ¿Qué querés importar?</h2>
        <p style={{margin:'0 0 16px',color:C.ink2,lineHeight:1.6}}>Elegí la opción que más se parezca a tu caso.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
          <button style={card(regimen==='courier')} onClick={()=>setRegimen('courier')}>📦 Compra personal por Courier</button>
          <button style={card(regimen==='correo')} onClick={()=>setRegimen('correo')}>📮 Compra personal por Correo Argentino</button>
          <button style={card(regimen==='comercial')} onClick={()=>setRegimen('comercial')}>🏪 Mercadería para vender o usar comercialmente</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginTop:22}}>
          <label style={{fontWeight:700}}>Valor FOB del envío (USD)
            <input value={fob} onChange={e=>setFob(e.target.value)} type="number" min="0" placeholder="Ej.: 250" style={{width:'100%',boxSizing:'border-box',marginTop:7,padding:'12px',border:`2px solid ${C.border}`,borderRadius:9,fontFamily:'inherit',fontSize:16}}/>
          </label>
          {regimen!=='comercial' && <>
            <label style={{fontWeight:700}}>Unidades de la misma especie
              <input value={cantidad} onChange={e=>setCantidad(e.target.value)} type="number" min="1" style={{width:'100%',boxSizing:'border-box',marginTop:7,padding:'12px',border:`2px solid ${C.border}`,borderRadius:9,fontFamily:'inherit',fontSize:16}}/>
            </label>
            <label style={{fontWeight:700}}>¿Cuántos envíos con franquicia usaste este año?
              <select value={usados} onChange={e=>setUsados(e.target.value)} style={{width:'100%',boxSizing:'border-box',marginTop:7,padding:'12px',border:`2px solid ${C.border}`,borderRadius:9,fontFamily:'inherit',fontSize:16}}>
                {[0,1,2,3,4,5].map(x=><option value={x} key={x}>{x}{x===5?' o más':''}</option>)}
              </select>
            </label>
          </>}
        </div>

        <div style={{marginTop:22,padding:'16px',borderRadius:12,background:diagnostico.ok?C.greenBg:C.amberBg,border:`1px solid ${diagnostico.ok?C.greenRing:C.amberRing}`}}>
          <div style={{fontWeight:900,color:diagnostico.ok?C.green:C.amber,marginBottom:5}}>{diagnostico.title}</div>
          <div style={{color:C.ink2,lineHeight:1.6}}>{diagnostico.text}</div>
        </div>
      </div>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>2. ¿Qué impuestos pueden aparecer?</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
          {[
            ['IVA','Puede corresponder incluso cuando usás la franquicia de USD 400. La tasa depende de la mercadería.'],
            ['Derecho de importación','En los primeros 5 envíos personales de hasta USD 400 FOB está exento. Fuera de esa franquicia depende del producto y su NCM.'],
            ['Tasa de estadística','También está exenta dentro de la franquicia personal. Fuera de ella puede corresponder según el régimen aplicable.'],
            ['Impuestos Internos','Sólo para determinadas mercaderías. No se aplica a todo lo que importás.'],
          ].map(([t,d])=><div key={t} style={{padding:15,borderRadius:12,background:'#f8fafc',border:`1px solid ${C.border}`}}><strong>{t}</strong><p style={{margin:'6px 0 0',fontSize:13,color:C.ink2,lineHeight:1.55}}>{d}</p></div>)}
        </div>
        <div style={{marginTop:15,padding:14,borderRadius:10,background:C.orangeBg,border:`1px solid ${C.orangeRing}`,color:C.ink2,lineHeight:1.6}}>
          <strong>¿Por qué no ponemos un “20% de aduana” para todos?</strong><br/>Porque el derecho exacto depende de la posición arancelaria (NCM), el origen y el tratamiento de la mercadería. Dar un porcentaje único sería simple, pero podría ser incorrecto.
        </div>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>3. Courier, Correo Argentino o Régimen General</h2>
        <div style={{display:'grid',gap:12}}>
          <div style={{padding:15,borderRadius:12,background:C.blueBg,border:`1px solid ${C.blueRing}`}}><strong>📦 Courier</strong><div style={{marginTop:5,color:C.ink2,lineHeight:1.55}}>Para importación, el valor FOB debe ser de hasta USD 3.000 por envío y el paquete no puede superar 50 kg. Puede tener o no finalidad comercial. La modalidad “pequeño envío” con franquicia tiene requisitos adicionales: hasta 3 unidades de la misma especie y sin finalidad comercial.</div></div>
          <div style={{padding:15,borderRadius:12,background:C.blueBg,border:`1px solid ${C.blueRing}`}}><strong>📮 Correo Argentino / Puerta a Puerta</strong><div style={{marginTop:5,color:C.ink2,lineHeight:1.55}}>Para compras de uso personal que ingresan por el operador postal oficial: hasta USD 3.000 FOB, hasta 20 kg por paquete, hasta 3 unidades de la misma especie y sin finalidad comercial.</div></div>
          <div style={{padding:15,borderRadius:12,background:'#f1f5f9',border:`1px solid ${C.border}`}}><strong>🏗️ Régimen General</strong><div style={{marginTop:5,color:C.ink2,lineHeight:1.55}}>Si el envío no cumple los requisitos de los regímenes especiales, supera sus límites o está sujeto a exclusiones/intervenciones, puede corresponder una destinación aduanera con despachante.</div></div>
        </div>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>La franquicia de USD 400, sin vueltas</h2>
        <p style={{color:C.ink2,lineHeight:1.7}}>Para determinados envíos de uso personal, los primeros <strong>5 envíos por año calendario y por persona</strong> de hasta <strong>USD 400 FOB</strong> están exentos de <strong>derecho de importación y tasa de estadística</strong>. El IVA sigue correspondiendo, y también Impuestos Internos si la mercadería está alcanzada.</p>
        <p style={{color:C.ink2,lineHeight:1.7}}>Si el envío supera USD 400 FOB, esos dos tributos pueden aplicarse sobre el excedente. Si ya utilizaste los 5 envíos, la franquicia deja de aplicarse.</p>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>Ejemplos rápidos</h2>
        <div style={{display:'grid',gap:10,color:C.ink2,lineHeight:1.6}}>
          <div><strong>🛍️ Compraste algo de {moneyUSD(250)} para uso personal:</strong> si es uno de tus primeros 5 envíos y cumple los demás requisitos, no paga derecho de importación ni tasa de estadística. Puede pagar IVA e Internos.</div>
          <div><strong>📦 Compraste algo de {moneyUSD(650)}:</strong> puede seguir ingresando por el régimen si cumple sus límites, pero la franquicia de USD 400 no cubre todo el valor.</div>
          <div><strong>🏪 Traés mercadería para vender:</strong> no corresponde tratarla como “pequeño envío personal”. Puede ingresar por Courier si cumple sus requisitos, pero con el tratamiento tributario comercial que corresponda.</div>
        </div>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>¿Por qué no damos un costo total único?</h2>
        <p style={{color:C.ink2,lineHeight:1.7}}>Porque para hacerlo bien necesitamos conocer el producto exacto. La posición arancelaria puede modificar el derecho de importación, el IVA aplicable, Impuestos Internos, percepciones, antidumping o intervenciones de otros organismos.</p>
        <p style={{color:C.ink2,lineHeight:1.7,marginBottom:0}}>Fácil Fiscal te ayuda primero a identificar el régimen y los conceptos que pueden aparecer. Cuando necesitás el importe exacto, el paso siguiente es consultar el <strong>Arancel Integrado</strong> con la NCM correspondiente.</p>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>Antes de comprar, revisá estas 4 cosas</h2>
        <ol style={{paddingLeft:20,color:C.ink2,lineHeight:1.8,marginBottom:0}}>
          <li>Si es para <strong>uso personal o comercial</strong>.</li>
          <li>El <strong>valor FOB</strong>, peso y cantidad de unidades.</li>
          <li>Si todavía tenés disponible alguno de tus <strong>5 envíos con franquicia anual</strong>.</li>
          <li>La <strong>NCM</strong> y si el producto tiene una intervención o tratamiento especial.</li>
        </ol>
      </section>

      <section style={{marginTop:24,padding:'18px',borderRadius:14,background:C.blueBg,border:`1px solid ${C.blueRing}`}}>
        <strong>Fuentes oficiales y actualización</strong>
        <p style={{margin:'7px 0 10px',color:C.ink2,lineHeight:1.6}}>Revisado el 13/09/2026 con información oficial de ARCA. La regulación postal fue actualizada en julio de 2026 y el Arancel Integrado informado por ARCA figura actualizado al 11/09/2026.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,fontWeight:800}}>
          <a href="https://www.arca.gob.ar/envios-internacionales/courier/importacion/pequenios-envios.asp" target="_blank" rel="noopener noreferrer">Pequeños envíos →</a>
          <a href="https://www.arca.gob.ar/envios-internacionales/puerta-a-puerta/" target="_blank" rel="noopener noreferrer">Puerta a Puerta →</a>
          <a href="https://www.arca.gob.ar/envios-internacionales/regimen-general/" target="_blank" rel="noopener noreferrer">Régimen General →</a>
          <a href="https://www.arca.gob.ar/aduana/arancelintegrado/" target="_blank" rel="noopener noreferrer">Arancel Integrado →</a>
        </div>
      </section>
    </section>
  </main>
}
