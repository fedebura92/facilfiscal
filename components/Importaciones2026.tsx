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
    if(regimen==='comercial') return {ok:false,title:'Esto ya es una importación comercial',text:'Si la mercadería tiene finalidad comercial o no encuadra en un régimen especial, corresponde analizar el Régimen General. El costo depende de la posición arancelaria (NCM), origen, valor aduanero y tributos aplicables.'}
    if(fobN>3000) return {ok:false,title:'Supera el límite del régimen simplificado',text:'Los envíos personales por Courier o Correo Argentino deben tener un valor FOB de hasta USD 3.000. Por encima de ese valor corresponde revisar el Régimen General.'}
    if(cantN>3) return {ok:false,title:'Revisá la cantidad de unidades',text:'Para uso personal, el régimen admite hasta 3 unidades de la misma especie y no debe presumirse finalidad comercial.'}
    if(usadosN>=5) return {ok:false,title:'Ya usaste la franquicia anual',text:'La franquicia de hasta USD 400 FOB se aplica a los primeros 5 envíos del año. Los siguientes quedan alcanzados por los tributos del régimen general, aunque sigan ingresando por el canal correspondiente.'}
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

        {regimen!=='comercial' && <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginTop:22}}>
            <label style={{fontWeight:700}}>Valor FOB del envío (USD)
              <input value={fob} onChange={e=>setFob(e.target.value)} type="number" min="0" placeholder="Ej.: 250" style={{width:'100%',boxSizing:'border-box',marginTop:7,padding:'12px',border:`2px solid ${C.border}`,borderRadius:9,fontFamily:'inherit',fontSize:16}}/>
            </label>
            <label style={{fontWeight:700}}>Unidades de la misma especie
              <input value={cantidad} onChange={e=>setCantidad(e.target.value)} type="number" min="1" style={{width:'100%',boxSizing:'border-box',marginTop:7,padding:'12px',border:`2px solid ${C.border}`,borderRadius:9,fontFamily:'inherit',fontSize:16}}/>
            </label>
            <label style={{fontWeight:700}}>¿Cuántos envíos con franquicia usaste este año?
              <select value={usados} onChange={e=>setUsados(e.target.value)} style={{width:'100%',boxSizing:'border-box',marginTop:7,padding:'12px',border:`2px solid ${C.border}`,borderRadius:9,fontFamily:'inherit',fontSize:16}}>
                {[0,1,2,3,4,5].map(x=><option value={x} key={x}>{x}{x===5?' o más':''}</option>)}
              </select>
            </label>
          </div>
        </>}

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
          <div style={{padding:15,borderRadius:12,background:C.blueBg,border:`1px solid ${C.blueRing}`}}><strong>📦 Courier</strong><div style={{marginTop:5,color:C.ink2,lineHeight:1.55}}>Para envíos gestionados por prestadores privados. En “pequeño envío” puede usarse para personas humanas o jurídicas, hasta USD 3.000, hasta 50 kg por paquete, hasta 3 unidades de la misma especie y sin finalidad comercial.</div></div>
          <div style={{padding:15,borderRadius:12,background:C.blueBg,border:`1px solid ${C.blueRing}`}}><strong>📮 Correo Argentino / Puerta a Puerta</strong><div style={{marginTop:5,color:C.ink2,lineHeight:1.55}}>Para compras personales que ingresan por el operador postal oficial. Hasta USD 3.000 FOB, hasta 20 kg por paquete, hasta 3 unidades de la misma especie y sin finalidad comercial.</div></div>
          <div style={{padding:15,borderRadius:12,background:'#f1f5f9',border:`1px solid ${C.border}`}}><strong>🏪 Régimen General</strong><div style={{marginTop:5,color:C.ink2,lineHeight:1.55}}>Si el envío no cumple los requisitos de los regímenes simplificados o tiene finalidad comercial, puede corresponder una destinación aduanera y la intervención de un despachante de aduana.</div></div>
        </div>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>Ejemplos rápidos</h2>
        <div style={{display:'grid',gap:10,color:C.ink2,lineHeight:1.6}}>
          <div><strong>🛍️ Compraste algo de {moneyUSD(250)} para uso personal:</strong> si es uno de tus primeros 5 envíos y cumple los demás requisitos, no paga derecho de importación ni tasa de estadística. Puede pagar IVA e Internos.</div>
          <div><strong>📦 Compraste algo de {moneyUSD(650)}:</strong> el envío puede seguir encuadrando por valor, pero la franquicia sólo cubre hasta USD 400 FOB; sobre el excedente pueden aparecer los demás tributos.</div>
          <div><strong>🏪 Traés 20 unidades para vender:</strong> no lo tratamos como “pequeño envío personal”. Hay que revisar el Régimen General y el NCM correspondiente.</div>
        </div>
      </section>

      <section style={{marginTop:24,background:C.white,border:`1px solid ${C.border}`,borderRadius:16,padding:'24px'}}>
        <h2 style={{marginTop:0}}>Antes de comprar, revisá estas 4 cosas</h2>
        <ol style={{paddingLeft:20,color:C.ink2,lineHeight:1.8,marginBottom:0}}>
          <li>Si es para <strong>uso personal o comercial</strong>.</li>
          <li>El <strong>valor FOB</strong> y la cantidad de unidades.</li>
          <li>Si todavía tenés disponible alguno de tus <strong>5 envíos con franquicia anual</strong>.</li>
          <li>Si el producto tiene una <strong>NCM o intervención especial</strong> que modifique el tratamiento.</li>
        </ol>
      </section>

      <section style={{marginTop:24,padding:'18px',borderRadius:14,background:C.blueBg,border:`1px solid ${C.blueRing}`}}>
        <strong>Fuentes oficiales y actualización</strong>
        <p style={{margin:'7px 0 10px',color:C.ink2,lineHeight:1.6}}>Revisado el 13/09/2026 con información oficial de ARCA. El Arancel Integrado informado por ARCA figura actualizado al 11/09/2026.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:12,fontWeight:800}}>
          <a href="https://www.arca.gob.ar/envios-internacionales/courier/pequenios-envios.asp" target="_blank" rel="noopener noreferrer">Pequeños envíos →</a>
          <a href="https://www.arca.gob.ar/envios-internacionales/puerta-a-puerta/" target="_blank" rel="noopener noreferrer">Puerta a Puerta →</a>
          <a href="https://www.arca.gob.ar/aduana/arancelintegrado/" target="_blank" rel="noopener noreferrer">Arancel Integrado →</a>
        </div>
      </section>
    </section>
  </main>
}
