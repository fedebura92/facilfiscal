'use client'
import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { calcularIIBB, calcularIVA, calcularImportacion, estimarGananciasSimple, VERIFICACION_FISCAL } from '@/lib/calculadoras-fiscales'
import { ACTIVIDADES_SIMPLES, estimarAlicuotaProvincia, PROVINCIAS_IIBB, type ActividadSimple } from '@/lib/provincias-fiscales'

const money=(n:number)=>n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})
const n=(v:string)=>Number(v)||0
const input:CSSProperties={width:'100%',minHeight:48,padding:'11px 13px',border:'2px solid #e2e8f0',borderRadius:9,fontFamily:'inherit',fontSize:16,lineHeight:1.4,boxSizing:'border-box',marginTop:7}
const grid:CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:16}
const formSection:CSSProperties={marginTop:26}
const question:CSSProperties={margin:'0 0 10px',fontSize:'clamp(18px,2vw,20px)',lineHeight:1.4,fontWeight:700,color:'#183744'}
const fieldLabel:CSSProperties={display:'block',fontSize:15,lineHeight:1.45,color:'#243b4a'}

function Shell({title,intro,color,source,children}:{title:string;intro:string;color:string;source:string;children:ReactNode}){return <main style={{background:'#f8fafc',minHeight:'100vh',fontFamily:'Nunito, sans-serif',color:'#102a36'}}><header style={{background:color,color:'white',padding:'clamp(36px,6vw,52px) 20px',textAlign:'center'}}><h1 style={{fontSize:'clamp(30px,5vw,46px)',lineHeight:1.15,letterSpacing:'-0.02em',margin:'0 0 12px',fontWeight:900}}>{title}</h1><p style={{maxWidth:700,margin:'0 auto',fontSize:'clamp(16px,2vw,18px)',lineHeight:1.5}}>{intro}</p></header><section style={{maxWidth:820,margin:'0 auto',padding:'clamp(24px,4vw,36px) 18px 40px'}}><div style={{background:'white',padding:'clamp(22px,4vw,34px)',borderRadius:16,boxShadow:'0 4px 24px #0f172a14',overflow:'hidden'}}>{children}</div><p style={{margin:'12px 0 0',padding:'0 2px',fontSize:13,color:'#64748b',lineHeight:1.6}}>Revisado el {VERIFICACION_FISCAL}. <a href={source} target="_blank" rel="noopener noreferrer">Ver fuente oficial</a>. Es una estimación: ARCA o el organismo provincial determina el importe definitivo.</p></section></main>}
function Choice({active,onClick,children}:{active:boolean;onClick:()=>void;children:ReactNode}){return <button type="button" onClick={onClick} style={{minHeight:50,padding:'11px 13px',borderRadius:9,border:`2px solid ${active?'#0d9488':'#e2e8f0'}`,background:active?'#ecfdf5':'white',fontFamily:'inherit',fontSize:15,lineHeight:1.35,fontWeight:700,cursor:'pointer'}}>{children}</button>}
function Result({label,value,main=false}:{label:string;value:string;main?:boolean}){return <div style={{background:main?'#ecfdf5':'#f1f5f9',border:main?'2px solid #86efac':'none',padding:18,borderRadius:10}}><div style={{fontSize:13,color:'#475569'}}>{label}</div><strong style={{fontSize:main?27:21,color:main?'#166534':'#0f172a'}}>{value}</strong></div>}
function More({open,setOpen,children}:{open:boolean;setOpen:(v:boolean)=>void;children:ReactNode}){return <><button type="button" onClick={()=>setOpen(!open)} style={{display:'block',marginTop:22,padding:'4px 0',border:'none',background:'none',color:'#0d5c78',fontFamily:'inherit',fontSize:14,lineHeight:1.45,fontWeight:800,cursor:'pointer'}}>⚙️ {open?'Ocultar opciones adicionales':'Tengo más datos para mejorar el cálculo'}</button>{open?<div style={{marginTop:14,padding:18,background:'#f8fafc',borderRadius:12}}>{children}</div>:null}</>}

export function GananciasCalculator(){
 const [tipo,setTipo]=useState<'empleado'|'independiente'>('empleado'); const [ing,setIng]=useState(''); const [meses,setMeses]=useState('13'); const [gastos,setGastos]=useState(''); const [hijos,setHijos]=useState('0'); const [conyuge,setConyuge]=useState(false); const [alquiler,setAlquiler]=useState(''); const [prepaga,setPrepaga]=useState(''); const [domestico,setDomestico]=useState(''); const [more,setMore]=useState(false)
 const r=estimarGananciasSimple({tipo,ingresoMensual:n(ing),meses:n(meses),gastosMensuales:n(gastos),hijos:n(hijos),conyuge,alquilerMensual:n(alquiler),prepagaMensual:n(prepaga),personalDomesticoMensual:n(domestico)})
 return <Shell title="Calculadora de Ganancias 2026" intro="Decinos cuánto ganás y respondé preguntas simples. Nosotros hacemos las deducciones." color="linear-gradient(135deg,#7c3aed,#4c1d95)" source="https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/deducciones-personales.asp">
  <section><h2 style={question}>1. ¿Cómo trabajás?</h2><div style={grid}><Choice active={tipo==='empleado'} onClick={()=>{setTipo('empleado');setMeses('13')}}>👔 Trabajo en relación de dependencia</Choice><Choice active={tipo==='independiente'} onClick={()=>{setTipo('independiente');setMeses('12')}}>💼 Trabajo por mi cuenta</Choice></div></section>
  <section style={formSection}><h2 style={question}>2. ¿Cuánto cobrás normalmente?</h2><label style={fieldLabel}>{tipo==='empleado'?'Sueldo bruto mensual (antes de descuentos)':'Ingresos o facturación mensual'}<input style={input} type="number" min="0" value={ing} onChange={e=>setIng(e.target.value)} placeholder="Ej.: 2500000"/></label>
  {tipo==='independiente'?<label style={{display:'block',marginTop:14}}><strong>Gastos mensuales del trabajo</strong><input style={input} type="number" min="0" value={gastos} onChange={e=>setGastos(e.target.value)} placeholder="Alquiler, insumos, servicios…"/></label>:null}
  </section>
  <section style={formSection}><h2 style={question}>3. Tu situación familiar</h2><div style={grid}><label style={fieldLabel}>Hijos menores o a cargo<select style={input} value={hijos} onChange={e=>setHijos(e.target.value)}>{[0,1,2,3,4,5].map(x=><option key={x}>{x}</option>)}</select></label><label style={{display:'flex',gap:10,alignItems:'center',minHeight:48,paddingTop:27,fontSize:15,lineHeight:1.4}}><input type="checkbox" checked={conyuge} onChange={e=>setConyuge(e.target.checked)}/> <span>Mi pareja no tiene ingresos y está a mi cargo</span></label></div></section>
  <More open={more} setOpen={setMore}><div style={grid}><label>Alquiler mensual de tu vivienda<input style={input} type="number" value={alquiler} onChange={e=>setAlquiler(e.target.value)}/></label><label>Prepaga adicional por mes<input style={input} type="number" value={prepaga} onChange={e=>setPrepaga(e.target.value)}/></label><label>Personal doméstico por mes<input style={input} type="number" value={domestico} onChange={e=>setDomestico(e.target.value)}/></label><label>Pagos recibidos en el año<select style={input} value={meses} onChange={e=>setMeses(e.target.value)}><option value="12">12 meses</option><option value="13">12 meses + aguinaldo</option></select></label></div></More>
  <div style={{...grid,marginTop:26}}><Result main label="Ganancias anual estimada" value={money(r.impuesto)}/><Result label="Promedio mensual orientativo" value={money(r.impuesto/12)}/><Result label="Ingreso anual considerado" value={money(r.ingresoAnual)}/></div>
  <p style={{background:'#f5f3ff',padding:14,borderRadius:10,lineHeight:1.5}}>Aplicamos automáticamente aportes estimados, mínimo no imponible, deducción especial 2026 y las cargas que marcaste. Si tu empleador ya te retiene, compará el resultado con tu recibo y lo informado en SiRADIG.</p>
 </Shell>
}

export function IVACalculator(){
 const [ventas,setVentas]=useState('');const [compras,setCompras]=useState('');const [incluye,setIncluye]=useState(true);const [tasa,setTasa]=useState('.21');const [ret,setRet]=useState('');const [more,setMore]=useState(false)
 const rate=Number(tasa); const net=(x:number)=>incluye?x/(1+rate):x; const r=calcularIVA({ventas:[{neto:net(n(ventas)),tasa:rate}],compras:[{neto:net(n(compras)),tasa:rate}],retenciones:n(ret)})
 return <Shell title="Calculadora de IVA 2026" intro="Usá los totales de tus ventas y compras del mes. No necesitás separar débito y crédito." color="linear-gradient(135deg,#0891b2,#155e75)" source="https://biblioteca.arca.gob.ar/search/query/dcp/TOR_C_020631_1997_03_26">
  <section><h2 style={question}>¿Cuánto vendiste este mes?</h2><input style={input} type="number" value={ventas} onChange={e=>setVentas(e.target.value)} placeholder="Total facturado"/></section>
  <section style={formSection}><h2 style={question}>¿Cuánto compraste con factura válida?</h2><input style={input} type="number" value={compras} onChange={e=>setCompras(e.target.value)} placeholder="Compras y gastos del negocio"/></section>
  <div style={{...grid,marginTop:24}}><label style={fieldLabel}>¿Los importes ya incluyen IVA?<select style={input} value={incluye?'si':'no'} onChange={e=>setIncluye(e.target.value==='si')}><option value="si">Sí, son los totales de las facturas</option><option value="no">No, son importes netos</option></select></label><label style={fieldLabel}>IVA habitual<select style={input} value={tasa} onChange={e=>setTasa(e.target.value)}><option value=".21">21% — la mayoría de actividades</option><option value=".105">10,5% — tasa reducida</option><option value=".27">27% — ciertos servicios</option></select></label></div>
  <More open={more} setOpen={setMore}><label>Retenciones y percepciones que figuran en ARCA<input style={input} type="number" value={ret} onChange={e=>setRet(e.target.value)}/></label></More>
  <div style={{...grid,marginTop:26}}><Result label="IVA de tus ventas" value={money(r.debito)}/><Result label="IVA de tus compras" value={money(r.credito)}/><Result main label={r.pagar?'IVA estimado a pagar':'Saldo estimado a favor'} value={money(r.pagar||r.saldoFavor)}/></div>
 </Shell>
}

export function IIBBCalculator(){
 const [prov,setProv]=useState('Buenos Aires');const [act,setAct]=useState<ActividadSimple>('servicios');const [fac,setFac]=useState('');const [ret,setRet]=useState('');const [ali,setAli]=useState('');const [more,setMore]=useState(false)
 const sugerida=estimarAlicuotaProvincia(prov,act);const usada=ali?Number(ali):sugerida;const r=calcularIIBB({base:n(fac),alicuota:usada,retenciones:n(ret)})
 return <Shell title="Calculadora de Ingresos Brutos 2026" intro="Elegí dónde trabajás, qué hacés y cuánto facturaste. Te damos una estimación inmediata." color="linear-gradient(135deg,#059669,#065f46)" source="https://www.comarb.gob.ar/convenio-multilateral">
  <div style={grid}><label><strong>Provincia</strong><select style={input} value={prov} onChange={e=>{setProv(e.target.value);setAli('')}}>{PROVINCIAS_IIBB.map(p=><option key={p[0]}>{p[0]}</option>)}</select></label><label><strong>¿A qué te dedicás?</strong><select style={input} value={act} onChange={e=>{setAct(e.target.value as ActividadSimple);setAli('')}}>{Object.entries(ACTIVIDADES_SIMPLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label></div>
  <label style={{display:'block',marginTop:18}}><strong>¿Cuánto facturaste este mes?</strong><input style={input} type="number" value={fac} onChange={e=>setFac(e.target.value)} placeholder="Total de facturas del mes"/></label>
  <More open={more} setOpen={setMore}><div style={grid}><label>Alícuota exacta si la conocés (%)<input style={input} type="number" step=".01" value={ali} onChange={e=>setAli(e.target.value)}/></label><label>Retenciones/percepciones del mes<input style={input} type="number" value={ret} onChange={e=>setRet(e.target.value)}/></label></div></More>
  <div style={{...grid,marginTop:26}}><Result label="Tasa orientativa usada" value={`${usada}%`}/><Result main label="Ingresos Brutos estimado" value={money(r.pagar)}/></div>
  <p style={{background:'#fff7ed',padding:14,borderRadius:10}}>La tasa sugerida es una orientación general, porque el padrón puede asignarte otra según código de actividad, ingresos y exenciones. Si tenés la alícuota de tu padrón, abrí “más datos” y reemplazala.</p>
 </Shell>
}

export function ImportCalculator(){
 const [fob,setFob]=useState('');const [envio,setEnvio]=useState('');const [tc,setTc]=useState('');const [fran,setFran]=useState(true);const [more,setMore]=useState(false);const [der,setDer]=useState('20')
 const r=calcularImportacion({fobUSD:n(fob),fleteUSD:n(envio),seguroUSD:0,tipoCambio:n(tc),derecho:n(der),estadistica:3,iva:21,franquiciaSimplificada:fran})
 return <Shell title="Calculadora de importación 2026" intro="Ingresá el precio, envío y dólar aduanero. Las opciones técnicas quedan ocultas." color="linear-gradient(135deg,#ea580c,#9a3412)" source="https://www.arca.gob.ar/aduana/arancelintegrado/">
  <div style={grid}><label><strong>Precio del producto (USD)</strong><input style={input} type="number" value={fob} onChange={e=>setFob(e.target.value)}/></label><label><strong>Envío (USD)</strong><input style={input} type="number" value={envio} onChange={e=>setEnvio(e.target.value)}/></label><label><strong>Dólar aduanero</strong><input style={input} type="number" value={tc} onChange={e=>setTc(e.target.value)} placeholder="Cotización usada por Aduana"/></label></div>
  <label style={{display:'flex',gap:10,marginTop:18}}><input type="checkbox" checked={fran} onChange={e=>setFran(e.target.checked)}/> Es uno de mis primeros 5 envíos del año y el producto no supera USD 400</label>
  <More open={more} setOpen={setMore}><label>Derecho de importación según producto (%)<input style={input} type="number" value={der} onChange={e=>setDer(e.target.value)}/></label></More>
  <div style={{...grid,marginTop:26}}><Result label="Producto + envío en pesos" value={money(r.cif)}/><Result label="Impuestos estimados" value={money(r.tributos)}/><Result main label="Costo total estimado" value={money(r.total)}/></div>
 </Shell>
}

export function ProvinceCalculatorPage(){
 const [prov,setProv]=useState('Buenos Aires');const [act,setAct]=useState<ActividadSimple>('servicios');const [fac,setFac]=useState('');const [ret,setRet]=useState('');
 const info=PROVINCIAS_IIBB.find(p=>p[0]===prov)!;const tasa=estimarAlicuotaProvincia(prov,act);const r=calcularIIBB({base:n(fac),alicuota:tasa,retenciones:n(ret)})
 return <main style={{background:'#f8fafc',minHeight:'100vh'}}>
  <header style={{background:'linear-gradient(135deg,#1d4ed8,#312e81)',color:'white',padding:'52px 20px',textAlign:'center'}}><h1 style={{fontSize:'clamp(30px,5vw,46px)',margin:'0 0 12px'}}>Calculadora de impuestos por provincia</h1><p style={{maxWidth:730,margin:'auto',fontSize:18}}>Elegí tu provincia y actividad. Calculá Ingresos Brutos y consultá el organismo que te corresponde.</p></header>
  <section style={{maxWidth:900,margin:'0 auto',padding:'36px 18px'}}>
   <div style={{background:'white',padding:'clamp(20px,4vw,34px)',borderRadius:16,boxShadow:'0 4px 24px #0f172a14'}}>
    <h2 style={{margin:'0 0 22px'}}>Calculá en tres pasos</h2><div style={grid}><label><strong>1. ¿Dónde está tu actividad?</strong><select style={input} value={prov} onChange={e=>setProv(e.target.value)}>{PROVINCIAS_IIBB.map(p=><option key={p[0]}>{p[0]}</option>)}</select></label><label><strong>2. ¿Qué hacés?</strong><select style={input} value={act} onChange={e=>setAct(e.target.value as ActividadSimple)}>{Object.entries(ACTIVIDADES_SIMPLES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></label><label><strong>3. Facturación mensual</strong><input style={input} type="number" value={fac} onChange={e=>setFac(e.target.value)} placeholder="Ej.: 2000000"/></label></div>
    <label style={{display:'block',marginTop:16,maxWidth:420}}>Si te retuvieron IIBB, ingresalo acá (opcional)<input style={input} type="number" value={ret} onChange={e=>setRet(e.target.value)}/></label>
    <div style={{...grid,marginTop:24}}><Result label="Alícuota general orientativa" value={`${tasa}%`}/><Result main label="IIBB mensual estimado" value={money(r.pagar)}/></div>
    <div style={{marginTop:22,padding:18,borderRadius:12,background:'#eff6ff'}}><h3 style={{margin:'0 0 6px'}}>{prov} · {info[1]}</h3><p style={{margin:'0 0 10px'}}>{ACTIVIDADES_SIMPLES[act].nota}. La tasa final puede cambiar por padrón, nivel de ingresos, municipio o exención.</p><a href={info[3]} target="_blank" rel="noopener noreferrer" style={{fontWeight:800}}>Consultar en {info[1]} →</a></div>
   </div>
   <section style={{marginTop:36}}><h2>Compará las 24 jurisdicciones</h2><p style={{color:'#64748b'}}>Estas son tasas generales orientativas para una primera estimación. Seleccioná una provincia para calcular arriba.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:12}}>{PROVINCIAS_IIBB.map(p=><button key={p[0]} onClick={()=>{setProv(p[0]);window.scrollTo({top:0,behavior:'smooth'})}} style={{textAlign:'left',padding:16,borderRadius:12,border:`2px solid ${prov===p[0]?'#2563eb':'#e2e8f0'}`,background:'white',cursor:'pointer'}}><strong style={{display:'block',fontSize:16}}>{p[0]}</strong><span style={{color:'#2563eb',fontWeight:900,fontSize:20}}>{p[2]}%</span><small style={{display:'block',color:'#64748b'}}>{p[1]}</small></button>)}</div></section>
  </section>
 </main>
}
