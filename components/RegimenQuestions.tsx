import Link from 'next/link'

const questions = [
  {
    q: '¿Qué me conviene: Monotributo o Responsable Inscripto?',
    a: 'No depende solamente de cuánto facturás. También importan tu actividad, gastos, tipo de clientes y cómo funciona el negocio. El Monotributo simplifica obligaciones mientras cumplas sus condiciones; el régimen general separa IVA, Ganancias y, cuando corresponde, aportes previsionales.',
  },
  {
    q: '¿Cuál es la diferencia entre Monotributo y Autónomos?',
    a: 'No son dos nombres para lo mismo. El Monotributo es un régimen simplificado impositivo y previsional. Autónomos es un régimen previsional que suele aparecer cuando una persona trabaja por cuenta propia dentro del régimen general.',
  },
  {
    q: '¿Responsable Inscripto y Autónomo son lo mismo?',
    a: 'No. Responsable Inscripto describe principalmente la situación frente al IVA. Autónomos corresponde al régimen previsional. Una misma persona puede ser Responsable Inscripto y además aportar como autónomo.',
  },
  {
    q: '¿Cuándo tengo que pasar de Monotributo a Responsable Inscripto?',
    a: 'Puede ocurrir si dejás de cumplir las condiciones del Monotributo, por ejemplo por superar parámetros o quedar alcanzado por una causal de exclusión. No conviene mirar únicamente la facturación: hay otros requisitos que también deben revisarse.',
  },
  {
    q: '¿Puedo ser empleado y monotributista al mismo tiempo?',
    a: 'Sí, pueden coexistir una relación de dependencia y una actividad independiente encuadrada en Monotributo si se cumplen sus requisitos. La situación previsional y las obligaciones deben analizarse considerando ambas actividades.',
  },
  {
    q: '¿Cuándo me conviene abrir una sociedad?',
    a: 'No existe un monto de facturación que por sí solo haga conveniente una sociedad. Hay que evaluar si habrá socios, responsabilidad patrimonial, inversiones, empleados, crecimiento esperado, relación con clientes y proveedores, costos administrativos y efecto impositivo. Una sociedad puede ser conveniente por organización y separación patrimonial aunque no sea la alternativa de menor costo fiscal.',
  },
  {
    q: '¿Una sociedad paga menos impuestos que una persona?',
    a: 'No necesariamente. La comparación depende de la forma societaria, resultado del negocio, distribución de utilidades y situación de los socios. Crear una sociedad solamente para “pagar menos” sin comparar el costo total puede terminar siendo más caro.',
  },
  {
    q: '¿Puedo empezar como monotributista y después crear una sociedad?',
    a: 'Sí. La estructura del negocio puede cambiar a medida que crece. Lo importante es evaluar cuándo deja de ser conveniente o posible el esquema actual y qué obligaciones aparecen con la nueva estructura.',
  },
]

export default function RegimenQuestions(){
  return <section style={{background:'#fff',border:'1.5px solid #e2e8ed',borderRadius:14,overflow:'hidden',margin:'20px 0',boxShadow:'0 1px 4px rgba(13,92,120,.07)'}}>
    <div style={{padding:'15px 16px',borderBottom:'1px solid #e2e8ed'}}>
      <h2 style={{fontSize:18,margin:0,color:'#0f2733'}}>Preguntas comunes antes de elegir un régimen</h2>
      <p style={{fontSize:12,color:'#3d5a6b',margin:'5px 0 0',lineHeight:1.6}}>Respuestas rápidas para entender las diferencias. Si querés comparar tu caso, podés simularlo con los datos de tu negocio.</p>
    </div>
    {questions.map((item,i)=><details key={item.q} style={{padding:'13px 16px',borderBottom:i===questions.length-1?'none':'1px solid #e2e8ed'}}>
      <summary style={{cursor:'pointer',fontSize:13,fontWeight:800,color:'#0f2733'}}>{item.q}</summary>
      <p style={{fontSize:12,color:'#3d5a6b',fontWeight:600,lineHeight:1.75,margin:'9px 0 0'}}>{item.a}</p>
    </details>)}
    <div style={{padding:16,background:'#e8f6fb',borderTop:'1px solid #a8ddf0'}}>
      <strong style={{display:'block',fontSize:14,color:'#0d5c78'}}>¿Querés saber qué podría convenirte a vos?</strong>
      <p style={{fontSize:12,color:'#3d5a6b',lineHeight:1.6,margin:'5px 0 12px'}}>Compará alternativas según tu actividad, facturación, gastos, socios y forma de operar.</p>
      <Link href="/crear-negocio" style={{display:'inline-block',background:'#0d5c78',color:'#fff',padding:'10px 14px',borderRadius:9,fontSize:13,fontWeight:800,textDecoration:'none'}}>Evaluar mi negocio →</Link>
    </div>
  </section>
}
