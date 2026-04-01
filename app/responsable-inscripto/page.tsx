'use client'

export default function ResponsableInscriptoPage() {

  const V={
    tealDark:'#0d5c78',teal:'#1a7fa8',tealMid:'#2490bc',tealLight:'#e8f6fb',tealRing:'#a8ddf0',
    gold:'#f5a623',goldLight:'#fff8ec',goldRing:'#fde4a0',
    red:'#e53535',redBg:'#fff1f1',redRing:'#ffc8c8',
    bg:'#f4f7f9',surface:'#fff',border:'#e2e8ed',
    ink:'#0f2733',ink2:'#3d5a6b',ink3:'#7a9aaa',
  }

  return (
    <main style={{background:V.bg,minHeight:'100vh'}}>

      {/* HEADER SIMPLE */}
      <div style={{
        background:V.surface,
        borderBottom:`1px solid ${V.border}`,
        padding:'14px 20px',
        fontWeight:900,
        color:V.tealDark
      }}>
        Fácil Fiscal
      </div>

      {/* CONTENIDO */}
      <div style={{
        maxWidth:900,
        margin:'0 auto',
        padding:'30px 20px'
      }}>

        <h1 style={{fontSize:28,fontWeight:900,color:V.ink,marginBottom:10}}>
          Responsable Inscripto: qué tenés que pagar y cuándo
        </h1>

        <p style={{color:V.ink3,fontWeight:600,marginBottom:20}}>
          Si no sabés cuánto pagar de IVA, Ganancias o cuándo vence cada cosa, es normal.
          Acá te lo explicamos simple y además te avisamos antes de cada vencimiento.
        </p>

        {/* CTA */}
        <button style={{
          background:V.gold,
          border:'none',
          padding:'12px 20px',
          borderRadius:8,
          fontWeight:800,
          cursor:'pointer',
          marginBottom:25
        }}>
          🔔 Recibir alertas de vencimientos
        </button>

        {/* BLOQUE */}
        <div style={{
          background:V.surface,
          border:`1px solid ${V.border}`,
          borderRadius:12,
          padding:20,
          marginBottom:20
        }}>
          <h2 style={{fontWeight:800,marginBottom:10}}>¿Te pasa esto?</h2>
          <ul style={{color:V.ink2,fontWeight:600,lineHeight:1.6}}>
            <li>No sabés cuánto pagar de IVA cada mes</li>
            <li>Tenés miedo de olvidarte una declaración</li>
            <li>No entendés qué impuestos te corresponden</li>
            <li>Dependés siempre del contador</li>
          </ul>
        </div>

        {/* BLOQUE */}
        <div style={{
          background:V.surface,
          border:`1px solid ${V.border}`,
          borderRadius:12,
          padding:20,
          marginBottom:20
        }}>
          <h2 style={{fontWeight:800,marginBottom:10}}>¿Qué tenés que pagar?</h2>
          <ul style={{color:V.ink2,fontWeight:600,lineHeight:1.6}}>
            <li><strong>IVA:</strong> mensual</li>
            <li><strong>Ganancias:</strong> anual</li>
            <li><strong>Ingresos Brutos:</strong> según provincia</li>
            <li><strong>Autónomos:</strong> si corresponde</li>
          </ul>
        </div>

      </div>
    </main>
  )
}