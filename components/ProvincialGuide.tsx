'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type Regimen = 'mono' | 'general' | 'sociedad' | 'sin-alta'
type Provincia = {
  nombre: string
  organismo: string
  unificado: boolean
  nota?: string
  beneficio?: string
}

const PROVINCIAS: Provincia[] = [
  { nombre:'Buenos Aires', organismo:'ARBA', unificado:true, nota:'El Régimen Simplificado de Ingresos Brutos puede integrarse con el Monotributo nacional.', beneficio:'En el régimen simplificado no presentás las DDJJ mensuales y anuales de IIBB del régimen general y se simplifica el tratamiento de retenciones y percepciones.' },
  { nombre:'CABA', organismo:'AGIP', unificado:true, nota:'CABA integra el Monotributo Unificado desde 2026.' },
  { nombre:'Catamarca', organismo:'ARCA Catamarca', unificado:true },
  { nombre:'Chaco', organismo:'ATP Chaco', unificado:true },
  { nombre:'Chubut', organismo:'DGR Chubut', unificado:false, nota:'La tributación local requiere revisar también la relación con los municipios; no usamos una tasa provincial genérica.' },
  { nombre:'Córdoba', organismo:'Rentas Córdoba', unificado:true },
  { nombre:'Corrientes', organismo:'DGR Corrientes', unificado:false },
  { nombre:'Entre Ríos', organismo:'ATER', unificado:true },
  { nombre:'Formosa', organismo:'DGR Formosa', unificado:false },
  { nombre:'Jujuy', organismo:'Rentas Jujuy', unificado:true, nota:'La provincia utiliza el Sistema Único Tributario (SUT).' },
  { nombre:'La Pampa', organismo:'DGR La Pampa', unificado:false },
  { nombre:'La Rioja', organismo:'DGIP La Rioja', unificado:false, nota:'La Ley Impositiva 2026 remite a los contribuyentes alcanzados al régimen general; no mostramos un supuesto Monotributo provincial simplificado.' },
  { nombre:'Mendoza', organismo:'ATM Mendoza', unificado:true, nota:'Funciona el Monotributo Unificado Mendoza (MUM).' },
  { nombre:'Misiones', organismo:'ATM Misiones', unificado:false, nota:'Para contribuyentes directos el régimen general contempla declaraciones juradas de Ingresos Brutos.' },
  { nombre:'Neuquén', organismo:'Rentas Neuquén', unificado:true },
  { nombre:'Río Negro', organismo:'Agencia de Recaudación Tributaria', unificado:true, beneficio:'Existen beneficios específicos para determinados nuevos emprendedores; hay que verificar los requisitos antes de aplicarlos.' },
  { nombre:'Salta', organismo:'DGR Salta', unificado:true, beneficio:'Durante 2026 existen beneficios para determinados nuevos contribuyentes que se inscriben espontáneamente. Verificá requisitos y vigencia antes de contar con la exención.' },
  { nombre:'San Juan', organismo:'DGR San Juan', unificado:true },
  { nombre:'San Luis', organismo:'DPIP San Luis', unificado:false, nota:'En el régimen general el impuesto depende de la actividad, base imponible y alícuota aplicable.' },
  { nombre:'Santa Cruz', organismo:'ASIP', unificado:true },
  { nombre:'Santa Fe', organismo:'API Santa Fe', unificado:false, nota:'Tiene un Régimen Simplificado provincial propio, pero no figura entre las jurisdicciones adheridas al Monotributo Unificado nacional de ARCA.' },
  { nombre:'Santiago del Estero', organismo:'DGR Santiago del Estero', unificado:false },
  { nombre:'Tierra del Fuego', organismo:'AREF', unificado:true },
  { nombre:'Tucumán', organismo:'DGR Tucumán', unificado:false, nota:'La alícuota se consulta según actividad y normativa provincial; no usamos un porcentaje único.' },
]

const box = { border:'1px solid #dbe4ea', borderRadius:14, padding:20, background:'#fff' } as const
const primaryButton = { background:'#0d5c78', color:'#fff', padding:'11px 15px', borderRadius:9, textDecoration:'none', fontWeight:800 } as const
const secondaryButton = { background:'#eef7fb', color:'#0d5c78', padding:'11px 15px', borderRadius:9, textDecoration:'none', fontWeight:800, border:'1px solid #b9dce9' } as const

export default function ProvincialGuide(){
  const [provincia,setProvincia] = useState('Buenos Aires')
  const [regimen,setRegimen] = useState<Regimen>('mono')
  const [varias,setVarias] = useState(false)
  const p = useMemo(()=>PROVINCIAS.find(x=>x.nombre===provincia)!,[provincia])

  return <main style={{fontFamily:'Nunito, sans-serif',color:'#102a36',background:'#f8fafc',minHeight:'100vh'}}>
    <header style={{background:'linear-gradient(135deg,#0d5c78,#176f8f)',color:'#fff',padding:'44px 20px',textAlign:'center'}}>
      <h1 style={{fontSize:'clamp(30px,5vw,44px)',margin:'0 0 12px',fontWeight:900}}>Impuestos provinciales 2026</h1>
      <p style={{maxWidth:740,margin:'0 auto',fontSize:18,lineHeight:1.5}}>Elegí tu provincia y tu situación fiscal. Primero te mostramos cómo puede afectarte <strong>Ingresos Brutos</strong> y después otros impuestos que podrían corresponderte.</p>
    </header>

    <section style={{maxWidth:860,margin:'0 auto',padding:'30px 18px 64px'}}>
      <div style={{...box,boxShadow:'0 4px 24px #0f172a12'}}>
        <h2 style={{marginTop:0}}>Contanos tu situación</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
          <label><strong>¿En qué provincia trabajás?</strong><select value={provincia} onChange={e=>setProvincia(e.target.value)} style={{width:'100%',padding:12,border:'2px solid #dbe4ea',borderRadius:9,marginTop:7,font:'inherit'}}>{PROVINCIAS.map(x=><option key={x.nombre}>{x.nombre}</option>)}</select></label>
          <label><strong>¿Cómo estás inscripto?</strong><select value={regimen} onChange={e=>setRegimen(e.target.value as Regimen)} style={{width:'100%',padding:12,border:'2px solid #dbe4ea',borderRadius:9,marginTop:7,font:'inherit'}}><option value="mono">Monotributo</option><option value="general">Responsable Inscripto / Autónomo</option><option value="sociedad">Sociedad</option><option value="sin-alta">Todavía no estoy inscripto</option></select></label>
        </div>
        <label style={{display:'flex',gap:10,alignItems:'flex-start',marginTop:18,lineHeight:1.4}}><input type="checkbox" checked={varias} onChange={e=>setVarias(e.target.checked)} style={{marginTop:4}}/><span><strong>También vendo o presto servicios en otras provincias</strong><br/><small>Marcá esto aunque no tengas un local en la otra provincia.</small></span></label>
      </div>

      {varias && <div style={{...box,marginTop:18,background:'#fff7ed',borderColor:'#fed7aa'}}><h2 style={{marginTop:0,fontSize:21}}>⚠️ Puede corresponderte Convenio Multilateral</h2><p>Si desarrollás actividad en más de una jurisdicción, Ingresos Brutos puede tener que distribuirse entre ellas. En ese caso no sería correcto calcular todo como si fueras contribuyente local de {p.nombre}.</p><Link href="/ingresos-brutos" style={{fontWeight:800,color:'#0d5c78'}}>Entender Ingresos Brutos y Convenio Multilateral →</Link></div>}

      <div style={{...box,marginTop:18,borderColor:'#b9dce9',boxShadow:'0 3px 18px #0d5c780d'}}>
        <div style={{fontSize:13,fontWeight:800,color:'#64748b'}}>TU PRINCIPAL IMPUESTO PROVINCIAL</div>
        <h2 style={{fontSize:28,margin:'5px 0 8px'}}>Ingresos Brutos en {p.nombre}</h2>
        <p style={{marginTop:0,lineHeight:1.6}}>Si realizás una actividad económica, este es el impuesto provincial que normalmente tenés que revisar primero. El organismo que lo administra en {p.nombre} es <strong>{p.organismo}</strong>.</p>

        {regimen==='mono' && <>
          {p.unificado ? <div style={{background:'#ecfdf5',border:'1px solid #a7f3d0',padding:16,borderRadius:12}}><strong>🟢 Podés estar dentro de Monotributo Unificado</strong><p style={{marginBottom:0}}>Si cumplís las condiciones del régimen provincial, el componente de Ingresos Brutos puede integrarse con el Monotributo nacional. Eso simplifica el pago y varias obligaciones provinciales.</p></div> : <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',padding:16,borderRadius:12}}><strong>🔵 Ingresos Brutos se maneja por separado</strong><p style={{marginBottom:0}}>{p.nombre} no figura en el Monotributo Unificado nacional. Eso no significa que no pagues IIBB: puede existir un régimen provincial propio o corresponder el régimen general.</p></div>}
        </>}

        {(regimen==='general'||regimen==='sociedad') && <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',padding:16,borderRadius:12}}><strong>📊 Ingresos Brutos se calcula según tu actividad</strong><p style={{marginBottom:0}}>No existe un porcentaje único para {p.nombre}. La alícuota puede cambiar por actividad, ingresos, padrón, exenciones y régimen. Si operás en varias provincias también puede intervenir Convenio Multilateral.</p></div>}

        {regimen==='sin-alta' && <div style={{background:'#f5f3ff',border:'1px solid #ddd6fe',padding:16,borderRadius:12}}><strong>🌱 Primero conviene definir cómo vas a inscribirte</strong><p style={{marginBottom:0}}>El régimen elegido puede cambiar cómo pagás Ingresos Brutos y qué declaraciones tenés que presentar.</p></div>}

        {p.nota && <p style={{background:'#f8fafc',padding:14,borderRadius:10,marginTop:16}}><strong>Dato importante:</strong> {p.nota}</p>}
        {p.beneficio && <p style={{background:'#fffbeb',border:'1px solid #fde68a',padding:14,borderRadius:10}}><strong>🎁 Beneficio para revisar:</strong> {p.beneficio}</p>}

        <div style={{marginTop:18,paddingTop:18,borderTop:'1px solid #e2e8f0'}}>
          <h3 style={{margin:'0 0 8px',fontSize:19}}>¿Cuánto tengo que pagar?</h3>
          <p style={{margin:'0 0 14px',lineHeight:1.6}}>{regimen==='mono' ? 'Si estás en un régimen simplificado, el importe puede ser fijo según tu categoría y jurisdicción. Si no, el cálculo depende de tu actividad y situación.' : regimen==='sin-alta' ? 'Todavía no conviene estimar un importe: primero hay que definir el régimen en el que vas a quedar inscripto.' : 'El importe depende de la base imponible y de la alícuota que corresponda a tu actividad. No usamos un porcentaje provincial genérico porque podría darte un resultado incorrecto.'}</p>
          <Link href="/ingresos-brutos" style={primaryButton}>Calcular / entender Ingresos Brutos →</Link>
        </div>
      </div>

      <div style={{...box,marginTop:18,background:'#f0f9ff'}}>
        <h2 style={{marginTop:0}}>📅 ¿Cuándo vence?</h2>
        <p>La fecha depende de la provincia, el régimen y, muchas veces, la terminación del CUIT. Por eso no mostramos un “día universal” que pueda inducirte a error.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Link href="/calendario-fiscal" style={primaryButton}>Ver calendario fiscal →</Link><Link href="/" style={secondaryButton}>🔔 Activar recordatorios →</Link></div>
      </div>

      <div style={{...box,marginTop:18}}>
        <h2 style={{marginTop:0}}>Otros impuestos que podrían corresponderte</h2>
        <p style={{lineHeight:1.6}}>Ingresos Brutos suele ser el principal impuesto provincial relacionado con una actividad. Además pueden aparecer otros, pero sólo según lo que tengas o hagas:</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
          <div style={{background:'#f8fafc',padding:14,borderRadius:10}}>🏠 <strong>Inmobiliario</strong><br/><small>Si sos titular de un inmueble alcanzado.</small></div>
          <div style={{background:'#f8fafc',padding:14,borderRadius:10}}>🚗 <strong>Automotor</strong><br/><small>Si tenés un vehículo alcanzado.</small></div>
          <div style={{background:'#f8fafc',padding:14,borderRadius:10}}>📝 <strong>Sellos</strong><br/><small>Puede corresponder en determinados actos o contratos.</small></div>
          <div style={{background:'#f8fafc',padding:14,borderRadius:10}}>🏪 <strong>Tasas municipales</strong><br/><small>Un local o actividad puede generar obligaciones municipales.</small></div>
        </div>
      </div>

      <section style={{marginTop:32}}>
        <h2>En pocas palabras</h2>
        <p><strong>Si tenés una actividad, empezá por Ingresos Brutos.</strong> Después revisá si por tu situación también aparecen otros impuestos provinciales o municipales.</p>
        <p>No se calcula igual en todo el país. Algunas jurisdicciones integran el pago con el Monotributo, otras tienen un simplificado propio y otras requieren liquidarlo según actividad. Por eso Fácil Fiscal evita mostrar un porcentaje genérico cuando puede ser incorrecto.</p>
      </section>

      <section style={{borderTop:'1px solid #dbe4ea',marginTop:30,paddingTop:22,fontSize:14,color:'#526675'}}>
        <h2 style={{fontSize:20,color:'#183744'}}>Fuentes y actualización</h2>
        <p>Revisado el 13/09/2026. La adhesión al Monotributo Unificado se contrasta con ARCA. Las particularidades provinciales se revisan contra los organismos tributarios y normativa de cada jurisdicción. Los beneficios, montos y vencimientos pueden cambiar durante el año.</p>
        <p><a href="https://www.arca.gob.ar/monotributo/ayuda/monotributo-unificado.asp" target="_blank" rel="noopener noreferrer">ARCA — Monotributo Unificado</a> · <a href="https://www.comarb.gob.ar/convenio-multilateral" target="_blank" rel="noopener noreferrer">COMARB — Convenio Multilateral</a></p>
      </section>
    </section>
  </main>
}
