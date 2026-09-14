'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

const PROVINCIAS = ['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']
const ACTIVIDADES = ['Servicios','Venta de productos','Actividad profesional','Industria / fabricación','Construcción','Alquileres','Actividad agropecuaria','Otra']

type Regimen = 'mono' | 'general' | 'sociedad'

const input = {width:'100%',minHeight:48,padding:'11px 13px',border:'2px solid #e2e8f0',borderRadius:9,fontFamily:'inherit',fontSize:16,lineHeight:1.4,boxSizing:'border-box' as const,marginTop:7}
const card = {background:'#fff',padding:'clamp(22px,4vw,34px)',borderRadius:16,boxShadow:'0 4px 24px #0f172a14'} as const

const money=(n:number)=>n.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0})

export default function IIBBCalculator2026(){
  const [provincia,setProvincia]=useState('Buenos Aires')
  const [regimen,setRegimen]=useState<Regimen>('mono')
  const [actividad,setActividad]=useState('Servicios')
  const [facturacion,setFacturacion]=useState('')
  const [varias,setVarias]=useState(false)
  const [alicuota,setAlicuota]=useState('')

  const monto=useMemo(()=>{
    const base=Number(facturacion)||0
    const tasa=Number(alicuota)||0
    return base*tasa/100
  },[facturacion,alicuota])

  const puedeCalcular = !varias && regimen!=='mono' && Number(facturacion)>0 && Number(alicuota)>0

  return <main style={{background:'#f8fafc',fontFamily:'Nunito, sans-serif',color:'#102a36'}}>
    <header style={{background:'linear-gradient(135deg,#059669,#065f46)',color:'#fff',padding:'clamp(36px,6vw,52px) 20px',textAlign:'center'}}>
      <h1 style={{fontSize:'clamp(30px,5vw,46px)',lineHeight:1.15,margin:'0 0 12px',fontWeight:900}}>Ingresos Brutos 2026</h1>
      <p style={{maxWidth:720,margin:'0 auto',fontSize:'clamp(16px,2vw,18px)',lineHeight:1.5}}>Decinos dónde trabajás, cómo estás inscripto y qué hacés. Calculamos sólo cuando tenemos datos suficientes para no darte un número engañoso.</p>
    </header>

    <section style={{maxWidth:820,margin:'0 auto',padding:'clamp(24px,4vw,36px) 18px 28px'}}>
      <div style={card}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:16}}>
          <label><strong>Provincia</strong><select style={input} value={provincia} onChange={e=>setProvincia(e.target.value)}>{PROVINCIAS.map(p=><option key={p}>{p}</option>)}</select></label>
          <label><strong>¿Cómo estás inscripto?</strong><select style={input} value={regimen} onChange={e=>setRegimen(e.target.value as Regimen)}><option value="mono">Monotributo</option><option value="general">Responsable Inscripto / Autónomo</option><option value="sociedad">Sociedad</option></select></label>
          <label><strong>¿A qué te dedicás?</strong><select style={input} value={actividad} onChange={e=>setActividad(e.target.value)}>{ACTIVIDADES.map(a=><option key={a}>{a}</option>)}</select></label>
        </div>

        <label style={{display:'flex',gap:10,alignItems:'flex-start',marginTop:18,lineHeight:1.45}}><input type="checkbox" checked={varias} onChange={e=>setVarias(e.target.checked)} style={{marginTop:4}}/><span><strong>También trabajo o vendo en otras provincias</strong><br/><small>Marcá esto aunque no tengas un local allí.</small></span></label>

        {varias ? <div style={{marginTop:20,padding:16,borderRadius:11,background:'#fff7ed',border:'1px solid #fed7aa',lineHeight:1.6}}><strong>⚠️ Puede corresponder Convenio Multilateral</strong><p style={{marginBottom:0}}>No sería correcto calcular todo como si la actividad perteneciera sólo a {provincia}. Primero hay que determinar cómo se distribuyen los ingresos entre jurisdicciones.</p></div> : regimen==='mono' ? <div style={{marginTop:20,padding:16,borderRadius:11,background:'#ecfdf5',border:'1px solid #a7f3d0',lineHeight:1.6}}><strong>Monotributo: no usamos una alícuota genérica</strong><p style={{marginBottom:0}}>En varias jurisdicciones podés estar dentro de un régimen simplificado con un importe fijo vinculado a tu categoría. Para decirte cuánto corresponde necesitamos identificar el régimen provincial, no multiplicar tu facturación por un porcentaje inventado.</p></div> : <>
          <label style={{display:'block',marginTop:20}}><strong>¿Cuánto facturaste este mes?</strong><input style={input} type="number" min="0" value={facturacion} onChange={e=>setFacturacion(e.target.value)} placeholder="Ej.: 1500000"/></label>
          <label style={{display:'block',marginTop:16}}><strong>Alícuota de tu actividad (%)</strong><input style={input} type="number" min="0" step="0.01" value={alicuota} onChange={e=>setAlicuota(e.target.value)} placeholder="Ej.: 3"/><small style={{display:'block',marginTop:6,color:'#64748b'}}>Usá la alícuota de tu padrón, actividad o normativa de {provincia}. Si no la conocés, no la adivinamos.</small></label>
        </>}

        {puedeCalcular && <div style={{marginTop:22,padding:18,borderRadius:11,background:'#ecfdf5',border:'2px solid #86efac'}}><div style={{fontSize:13,color:'#475569'}}>Ingresos Brutos estimado antes de retenciones, percepciones y otros ajustes</div><strong style={{display:'block',fontSize:28,color:'#166534',marginTop:4}}>{money(monto)}</strong><p style={{margin:'8px 0 0',lineHeight:1.55}}>Cálculo: {money(Number(facturacion)||0)} × {alicuota}%. El saldo final puede cambiar por retenciones, percepciones, exenciones, saldos anteriores o tratamientos especiales.</p></div>}

        {!varias && regimen!=='mono' && !puedeCalcular && <div style={{marginTop:20,padding:16,borderRadius:11,background:'#f8fafc',lineHeight:1.6}}><strong>Para calcular falta tu alícuota</strong><p style={{marginBottom:0}}>Eso es intencional: una misma provincia puede aplicar distintas alícuotas según actividad, padrón e ingresos. Preferimos pedirte ese dato antes que mostrarte un monto posiblemente incorrecto.</p></div>}

        <div style={{marginTop:22,display:'flex',gap:10,flexWrap:'wrap'}}><Link href="/impuestos-por-provincia" style={{background:'#0d5c78',color:'#fff',padding:'11px 15px',borderRadius:9,textDecoration:'none',fontWeight:800}}>Analizar mi situación provincial →</Link><Link href="/calendario-fiscal" style={{background:'#eef7fb',color:'#0d5c78',padding:'11px 15px',borderRadius:9,textDecoration:'none',fontWeight:800,border:'1px solid #b9dce9'}}>Ver vencimientos →</Link></div>
      </div>
      <p style={{margin:'12px 2px 0',fontSize:13,color:'#64748b',lineHeight:1.6}}>La determinación definitiva depende del organismo provincial o, si corresponde, de Convenio Multilateral. Fácil Fiscal evita asignar una tasa genérica cuando no puede verificar que sea la aplicable a tu caso.</p>
    </section>
  </main>
}
