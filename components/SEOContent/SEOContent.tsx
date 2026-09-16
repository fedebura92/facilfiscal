const V = {
  tealDark:'#0d5c78', tealLight:'#e8f6fb', tealRing:'#a8ddf0', goldLight:'#fff8ec', goldRing:'#fde4a0',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed', ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa', redBg:'#fff1f1', redRing:'#ffc8c8',
}
const sectionStyle={background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:14,overflow:'hidden' as const,marginBottom:20,boxShadow:'0 1px 4px rgba(13,92,120,.07)'}
const headerStyle={padding:'13px 16px',borderBottom:`1px solid ${V.border}`,fontSize:15,fontWeight:900 as const,color:V.ink}
const bodyStyle={padding:'16px'}
const paraStyle={fontSize:13,color:V.ink2,fontWeight:600 as const,lineHeight:1.75,marginBottom:12}

export function SEOAutonomos(){
  const cards=[
    {icon:'⚡',title:'Aporte mensual',desc:'Pagás el aporte previsional correspondiente a tu categoría de revista.'},
    {icon:'🧾',title:'Régimen general',desc:'Además pueden corresponder IVA, Ganancias y otros tributos según tu actividad.'},
    {icon:'🔄',title:'Recategorización',desc:'Se realiza en mayo, considerando los ingresos brutos del año anterior.'},
    {icon:'📅',title:'Vencimiento por CUIT',desc:'El pago mensual de Autónomos se escalona según la terminación de CUIT.'},
  ]
  const faqs=[
    {q:'¿Cuál es la diferencia entre Autónomos y Monotributo?',a:'Autónomos es un régimen previsional para personas que realizan actividad económica por cuenta propia dentro del régimen general. Quien cumple las condiciones del Monotributo puede optar por el régimen simplificado y queda eximido de inscribirse como autónomo por esa actividad.'},
    {q:'¿Cómo se determina mi categoría de Autónomos?',a:'ARCA la determina según la actividad desarrollada y los ingresos brutos del año calendario anterior. Al iniciar actividades corresponde la categoría inferior de la tabla aplicable a la actividad.'},
    {q:'¿Cuándo se recategoriza un autónomo?',a:'La recategorización anual se realiza en mayo y toma en cuenta los ingresos brutos obtenidos durante el año anterior.'},
    {q:'¿Autónomos incluye IVA y Ganancias?',a:'No. Autónomos es previsional. En paralelo, dentro del régimen general pueden corresponder IVA, Ganancias y otros tributos, que se determinan y pagan por separado.'},
    {q:'¿Qué pasa si no pago un aporte?',a:'La obligación queda adeudada y puede generar intereses. Conviene revisar la cuenta corriente y regularizar los períodos pendientes en los servicios oficiales de ARCA.'},
  ]
  return <>
    <section style={sectionStyle}><div style={headerStyle}>⚡ ¿Qué significa estar en Autónomos?</div><div style={bodyStyle}>
      <p style={paraStyle}>El régimen de <strong>Autónomos</strong> es el régimen previsional para personas que realizan una actividad económica por cuenta propia dentro del régimen general. El aporte jubilatorio se paga por separado de los impuestos.</p>
      <p style={paraStyle}>ARCA publicó nuevos valores de aportes personales vigentes desde el <strong>15 de septiembre de 2026</strong>. La categoría no se elige solamente por “tamaño”: depende de la actividad y, cuando corresponde, de los ingresos brutos del año anterior.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>{cards.map(i=><div key={i.title} style={{background:V.tealLight,border:`1px solid ${V.tealRing}`,borderRadius:10,padding:12}}><div style={{fontSize:18}}>{i.icon}</div><div style={{fontSize:12,fontWeight:800,color:V.tealDark,margin:'4px 0 3px'}}>{i.title}</div><div style={{fontSize:11,color:V.ink3,fontWeight:600,lineHeight:1.5}}>{i.desc}</div></div>)}</div>
    </div></section>
    <section style={sectionStyle}><div style={headerStyle}>📊 Categorías I a V</div><div style={bodyStyle}>
      <p style={paraStyle}>Las categorías I a V representan distintas situaciones previstas por la tabla de Autónomos. Para actividades de servicios y para el resto de las actividades existen reglas de categorización propias; quienes ejercen dirección o administración de sociedades tienen otra escala.</p>
      <div style={{background:V.goldLight,border:`1px solid ${V.goldRing}`,borderRadius:10,padding:'12px 14px',fontSize:12,fontWeight:700,color:'#7a4f00',lineHeight:1.6}}>💡 <strong>No conviene elegir la categoría por intuición.</strong> Si no sabés cuál te corresponde, verificá tu actividad y tu categoría de revista en ARCA antes de pagar.</div>
    </div></section>
    <section style={sectionStyle}><div style={headerStyle}>❓ Preguntas frecuentes</div>{faqs.map((i,n)=><div key={i.q} style={{padding:'12px 16px',borderBottom:n===faqs.length-1?'none':`1px solid ${V.border}`}}><div style={{fontSize:13,fontWeight:800,color:V.ink,marginBottom:6}}>▸ {i.q}</div><div style={{fontSize:12,color:V.ink2,fontWeight:600,lineHeight:1.7}}>{i.a}</div></div>)}</section>
    <section style={sectionStyle}><div style={headerStyle}>🔎 Fuente y revisión</div><div style={bodyStyle}><p style={{...paraStyle,marginBottom:0}}>Revisado el 16/09/2026 con información oficial de ARCA sobre definición del régimen, categorización, recategorización anual y aportes vigentes desde el 15/09/2026.</p></div></section>
  </>
}

export function SEOComoFacturar(){
  const tipos=[
    {tipo:'Factura A',desc:'Un Responsable Inscripto la emite a otro Responsable Inscripto y también a un Monotributista. Puede ser A común o una variante autorizada por ARCA.'},
    {tipo:'Factura B',desc:'Un Responsable Inscripto la emite, entre otros casos, a consumidores finales y sujetos exentos en IVA.'},
    {tipo:'Factura C',desc:'La emiten monotributistas y sujetos exentos. No discrimina IVA. Para una exportación corresponde comprobante E.'},
    {tipo:'Factura E',desc:'Se utiliza para operaciones de exportación cuando corresponde.'},
  ]
  const faqs=[
    {q:'¿Cuándo tengo que emitir la factura?',a:'Depende del tipo de operación. Para servicios u obras, en general la fecha límite es cuando termina la prestación o cuando se cobra total o parcialmente, lo que ocurra antes. Para ventas de cosas muebles y servicios continuos existen reglas específicas.'},
    {q:'¿Cómo corrijo una factura ya emitida?',a:'Las correcciones se documentan mediante notas de crédito o débito relacionadas con uno o más comprobantes emitidos previamente, según el motivo y las reglas aplicables. No conviene asumir que una factura autorizada se “borra”.'},
    {q:'¿Qué es el CAE?',a:'Es el Código de Autorización Electrónica que valida el comprobante electrónico emitido. Verificá que el comprobante quede autorizado antes de entregarlo.'},
    {q:'¿Cuánto tiempo debo conservar la documentación?',a:'ARCA informa que los comprobantes, libros y registros vinculados con obligaciones impositivas deben conservarse por un plazo mínimo de 10 años, sin perjuicio de reglas especiales.'},
    {q:'¿Un Responsable Inscripto hace Factura B a un monotributista?',a:'No. La tabla vigente de ARCA indica comprobante clase A cuando un Responsable Inscripto factura a un Monotributista.'},
  ]
  return <>
    <section style={sectionStyle}><div style={headerStyle}>📄 Tipos de comprobantes</div><div style={bodyStyle}>
      <p style={paraStyle}>El comprobante depende de la condición fiscal del emisor, la del receptor y el tipo de operación. Estas son las reglas generales publicadas por ARCA:</p>
      {tipos.map(i=><div key={i.tipo} style={{background:V.bg,border:`1px solid ${V.border}`,borderRadius:10,padding:'12px 14px',marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:V.ink,marginBottom:4}}>{i.tipo}</div><div style={{fontSize:12,color:V.ink2,fontWeight:600,lineHeight:1.6}}>{i.desc}</div></div>)}
      <div style={{background:V.goldLight,border:`1px solid ${V.goldRing}`,borderRadius:10,padding:'12px 14px',fontSize:12,fontWeight:700,color:'#7a4f00',lineHeight:1.6}}>📌 Las variantes “A con leyenda Pago en CBU informada” y “A Operación sujeta a retención” dependen de la autorización del emisor. No toda Factura A requiere esa leyenda.</div>
    </div></section>
    <section style={sectionStyle}><div style={headerStyle}>⏱️ ¿Cuándo se emite?</div><div style={bodyStyle}>
      <p style={paraStyle}><strong>Servicios y obras:</strong> al concluir la prestación o al cobrar total o parcialmente, lo que ocurra antes.</p>
      <p style={paraStyle}><strong>Venta de cosas muebles:</strong> como fecha límite, el último día del mes en que se entregó o puso a disposición el bien, lo que ocurra primero.</p>
      <p style={paraStyle}><strong>Servicios continuos:</strong> en general el último día de cada mes, salvo que antes se cobre o concluya la operación.</p>
      <p style={{...paraStyle,marginBottom:0}}><strong>Anticipos que fijan precio:</strong> al momento de percibir total o parcialmente el anticipo.</p>
    </div></section>
    <section style={sectionStyle}><div style={headerStyle}>❓ Preguntas frecuentes</div>{faqs.map((i,n)=><div key={i.q} style={{padding:'12px 16px',borderBottom:n===faqs.length-1?'none':`1px solid ${V.border}`}}><div style={{fontSize:13,fontWeight:800,color:V.ink,marginBottom:6}}>▸ {i.q}</div><div style={{fontSize:12,color:V.ink2,fontWeight:600,lineHeight:1.7}}>{i.a}</div></div>)}</section>
    <section style={sectionStyle}><div style={headerStyle}>🔎 Fuente y revisión</div><div style={bodyStyle}><p style={{...paraStyle,marginBottom:0}}>Revisado con las páginas oficiales de ARCA sobre clases de comprobantes, momento de emisión, notas de crédito/débito y conservación de documentación.</p></div></section>
  </>
}
