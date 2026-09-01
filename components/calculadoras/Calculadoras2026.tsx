'use client'

import { useState } from 'react'
import { calcularGanancias2026, calcularIIBB, calcularIVA, calcularImportacion, VERIFICACION_FISCAL } from '@/lib/calculadoras-fiscales'

const money = (n:number) => n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2})
const num = (v:string) => Number(v) || 0
const field = { width:'100%', padding:12, border:'1px solid #cbd5e1', borderRadius:8, fontSize:16, boxSizing:'border-box' as const }
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:16 }

function Shell({ title, intro, color, source, children }:{title:string;intro:string;color:string;source:string;children:React.ReactNode}) {
  return <main style={{background:'#f8fafc',minHeight:'100vh'}}>
    <section style={{background:color,color:'white',padding:'54px 20px',textAlign:'center'}}><h1 style={{fontSize:'clamp(30px,5vw,46px)',margin:'0 0 12px'}}>{title}</h1><p style={{maxWidth:720,margin:'auto',fontSize:18}}>{intro}</p></section>
    <section style={{maxWidth:820,margin:'0 auto',padding:'40px 20px'}}>
      <div style={{background:'white',padding:'clamp(20px,4vw,34px)',borderRadius:16,boxShadow:'0 4px 24px #0f172a14'}}>{children}</div>
      <p style={{fontSize:13,color:'#475569',lineHeight:1.6,marginTop:18}}>Información verificada el {VERIFICACION_FISCAL}. Fuente oficial: <a href={source} target="_blank" rel="noopener noreferrer">consultar ARCA / organismo competente</a>. El resultado depende de los datos ingresados y no reemplaza la declaración jurada ni el asesoramiento profesional.</p>
    </section>
  </main>
}

export function GananciasCalculator() {
  const [base,setBase]=useState(''); const r=calcularGanancias2026(num(base))
  return <Shell title="Calculadora de Ganancias 2026" intro="Aplicá la escala anual 2026 a tu ganancia neta sujeta a impuesto." color="linear-gradient(135deg,#7c3aed,#4c1d95)" source="https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-liquidacion-anual-y-final-2026.pdf">
    <label><strong>Ganancia neta sujeta a impuesto anual</strong><input style={{...field,marginTop:8}} type="number" min="0" value={base} onChange={e=>setBase(e.target.value)} placeholder="Ej.: 12000000" /></label>
    <p style={{color:'#64748b'}}>Ingresá la base luego de gastos deducibles, deducciones personales y quebrantos admitidos. No ingreses el sueldo bruto.</p>
    <div style={{...grid,marginTop:24}}><Result label="Impuesto anual estimado" value={money(r.impuesto)}/><Result label="Alícuota marginal" value={`${r.tasaMarginal*100}%`}/></div>
    <Notice>Las personas humanas ingresan cinco anticipos, pero no equivalen simplemente a dividir este resultado por cinco: ARCA calcula una base específica.</Notice>
  </Shell>
}

export function IVACalculator() {
  const [v,setV]=useState(['','','']); const [c,setC]=useState(['','','']); const [ret,setRet]=useState(''); const [saldo,setSaldo]=useState('')
  const tasas=[.21,.105,.27]; const r=calcularIVA({ventas:tasas.map((t,i)=>({neto:num(v[i]),tasa:t})),compras:tasas.map((t,i)=>({neto:num(c[i]),tasa:t})),retenciones:num(ret),saldoAnterior:num(saldo)})
  return <Shell title="Calculadora de IVA 2026" intro="Calculá débito fiscal, crédito fiscal y saldo del período por alícuota." color="linear-gradient(135deg,#0891b2,#155e75)" source="https://biblioteca.arca.gob.ar/search/query/dcp/TOR_C_020631_1997_03_26">
    <h2>Importes netos, sin IVA</h2><div style={grid}>{tasas.map((t,i)=><div key={t}><label><strong>Ventas {t*100}%</strong><input style={{...field,marginTop:6}} type="number" min="0" value={v[i]} onChange={e=>setV(v.map((x,j)=>j===i?e.target.value:x))}/></label><label style={{display:'block',marginTop:12}}><strong>Compras {t*100}%</strong><input style={{...field,marginTop:6}} type="number" min="0" value={c[i]} onChange={e=>setC(c.map((x,j)=>j===i?e.target.value:x))}/></label></div>)}</div>
    <div style={{...grid,marginTop:20}}><label>Retenciones/percepciones computables<input style={{...field,marginTop:6}} type="number" value={ret} onChange={e=>setRet(e.target.value)}/></label><label>Saldo a favor anterior<input style={{...field,marginTop:6}} type="number" value={saldo} onChange={e=>setSaldo(e.target.value)}/></label></div>
    <div style={{...grid,marginTop:24}}><Result label="Débito fiscal" value={money(r.debito)}/><Result label="Crédito fiscal" value={money(r.credito)}/><Result label={r.pagar?'Saldo a pagar':'Saldo a favor'} value={money(r.pagar||r.saldoFavor)}/></div>
    <Notice>Las exportaciones no generan débito fiscal: no uses 2,5% para representarlas. Operaciones exentas, prorrateo del crédito y regímenes especiales requieren tratamiento separado.</Notice>
  </Shell>
}

export function IIBBCalculator() {
  const [base,setBase]=useState(''); const [ali,setAli]=useState(''); const [min,setMin]=useState(''); const [ret,setRet]=useState(''); const [saldo,setSaldo]=useState('')
  const r=calcularIIBB({base:num(base),alicuota:num(ali),minimo:num(min),retenciones:num(ret),saldoAnterior:num(saldo)})
  return <Shell title="Calculadora de Ingresos Brutos 2026" intro="Estimá el impuesto con la alícuota oficial de tu actividad y jurisdicción." color="linear-gradient(135deg,#059669,#065f46)" source="https://www.comarb.gob.ar/convenio-multilateral">
    <div style={grid}><label>Base imponible del período<input style={{...field,marginTop:6}} type="number" value={base} onChange={e=>setBase(e.target.value)}/></label><label>Alícuota oficial (%)<input style={{...field,marginTop:6}} type="number" step="0.01" value={ali} onChange={e=>setAli(e.target.value)}/></label><label>Mínimo del período (opcional)<input style={{...field,marginTop:6}} type="number" value={min} onChange={e=>setMin(e.target.value)}/></label><label>Retenciones/percepciones<input style={{...field,marginTop:6}} type="number" value={ret} onChange={e=>setRet(e.target.value)}/></label><label>Saldo anterior<input style={{...field,marginTop:6}} type="number" value={saldo} onChange={e=>setSaldo(e.target.value)}/></label></div>
    <div style={{...grid,marginTop:24}}><Result label="Impuesto determinado" value={money(r.determinado)}/><Result label={r.pagar?'Saldo a pagar':'Saldo a favor'} value={money(r.pagar||r.saldoFavor)}/></div>
    <Notice>No existe una tasa única por provincia. Buscá la alícuota según actividad, padrón y ley tarifaria. En Convenio Multilateral ingresá la base atribuida a la jurisdicción después de aplicar el coeficiente correspondiente.</Notice>
  </Shell>
}

export function ImportCalculator() {
  const [x,setX]=useState<Record<string,string>>({}); const set=(k:string,v:string)=>setX(s=>({...s,[k]:v})); const [fran,setFran]=useState(false)
  const r=calcularImportacion({fobUSD:num(x.fob),fleteUSD:num(x.flete),seguroUSD:num(x.seguro),tipoCambio:num(x.tc),derecho:num(x.der),estadistica:num(x.est),iva:num(x.iva)||21,percepcionIVA:num(x.piva),percepcionGanancias:num(x.pgan),internos:num(x.int),franquiciaSimplificada:fran})
  const fields=[['fob','FOB (USD)'],['flete','Flete (USD)'],['seguro','Seguro (USD)'],['tc','Tipo de cambio aduanero (ARS/USD)'],['der','Derecho según NCM (%)'],['est','Tasa estadística (%)'],['iva','IVA (%)'],['piva','Percepción IVA (%)'],['pgan','Percepción Ganancias (%)'],['int','Impuestos internos (%)']]
  return <Shell title="Calculadora de impuestos de importación" intro="Desglosá el costo aduanero con las tasas oficiales de la posición NCM." color="linear-gradient(135deg,#ea580c,#9a3412)" source="https://www.arca.gob.ar/aduana/arancelintegrado/">
    <div style={grid}>{fields.map(([k,l])=><label key={k}>{l}<input style={{...field,marginTop:6}} type="number" step="0.01" value={x[k]||''} onChange={e=>set(k,e.target.value)}/></label>)}</div>
    <label style={{display:'flex',gap:10,marginTop:20,alignItems:'start'}}><input type="checkbox" checked={fran} onChange={e=>setFran(e.target.checked)}/> Envío simplificado elegible dentro de los primeros cinco del año y FOB hasta USD 400: sin derecho de importación ni tasa estadística.</label>
    <div style={{...grid,marginTop:24}}><Result label="Valor CIF" value={money(r.cif)}/><Result label="Tributos estimados" value={money(r.tributos)}/><Result label="Total CIF + tributos" value={money(r.total)}/></div>
    <Notice>La franquicia no elimina IVA ni impuestos internos. Confirmá canal, límites y NCM: esta calculadora no incluye honorarios, almacenaje, logística local ni restricciones de importación.</Notice>
  </Shell>
}

function Result({label,value}:{label:string;value:string}) { return <div style={{background:'#f1f5f9',padding:18,borderRadius:10}}><div style={{fontSize:13,color:'#475569'}}>{label}</div><strong style={{fontSize:22}}>{value}</strong></div> }
function Notice({children}:{children:React.ReactNode}) { return <div style={{background:'#fff7ed',border:'1px solid #fed7aa',padding:14,borderRadius:10,marginTop:22,color:'#9a3412',lineHeight:1.5}}>{children}</div> }
