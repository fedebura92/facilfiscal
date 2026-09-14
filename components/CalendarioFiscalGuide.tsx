import Link from 'next/link'

const section = { maxWidth: 960, margin: '0 auto', padding: '0 24px 48px' } as const
const card = { background: '#fff', border: '1px solid #e2e8ed', borderRadius: 16, padding: 'clamp(20px,4vw,30px)', boxShadow: '0 2px 12px rgba(13,92,120,.06)' } as const
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 12, marginTop: 18 } as const
const item = { background: '#f4f7f9', borderRadius: 11, padding: 16, lineHeight: 1.6 } as const

export default function CalendarioFiscalGuide() {
  return <section style={{ background: '#f4f7f9', paddingTop: 4 }}>
    <div style={section}>
      <div style={card}>
        <h2 style={{ margin: '0 0 10px', fontSize: 25, color: '#0f2733' }}>Cómo usar este calendario sin complicarte</h2>
        <p style={{ margin: 0, color: '#3d5a6b', lineHeight: 1.7 }}>Elegí tu situación fiscal y el mes. Si una obligación cambia según tu CUIT, abrí el vencimiento para ver qué fecha corresponde a cada terminación. La idea es que puedas saber <strong>qué vence, cuándo y qué tenés que hacer</strong> sin leer un calendario técnico.</p>
        <div style={grid}>
          <div style={item}><strong>1. Filtrá tu situación</strong><br/>Monotributo, Responsable Inscripto, Autónomo o Empleador.</div>
          <div style={item}><strong>2. Mirá tu CUIT</strong><br/>IVA, Autónomos y otras obligaciones pueden vencer en días distintos según su terminación.</div>
          <div style={item}><strong>3. Revisá el estado</strong><br/><strong>✓ Verificada</strong> significa que la fecha fue contrastada con información oficial. <strong>~ Orientativa</strong> todavía puede cambiar.</div>
        </div>
      </div>

      <div style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 23, color: '#0f2733' }}>¿Qué significa “fecha verificada”?</h2>
        <p style={{ margin: 0, color: '#3d5a6b', lineHeight: 1.7 }}>Fácil Fiscal usa como referencia principal la <strong>agenda de vencimientos de ARCA</strong> y los micrositios o resoluciones oficiales cuando existe una prórroga o una fecha excepcional. Una fecha futura no se presenta como definitiva hasta contar con respaldo suficiente.</p>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 11, background: '#fff8ec', lineHeight: 1.65, color: '#6b4a16' }}><strong>¿Por qué algunas fechas son aproximadas?</strong><br/>Porque conocer el patrón habitual no garantiza la fecha definitiva: feriados, días inhábiles y prórrogas pueden mover un vencimiento. Preferimos avisarte que falta confirmar antes que mostrar una fecha como segura cuando todavía no lo es.</div>
        <p style={{ margin: '16px 0 0', color: '#3d5a6b', lineHeight: 1.7 }}><strong>Importante:</strong> “presentación” y “pago” no siempre vencen el mismo día. Cuando ARCA los separa, Fácil Fiscal debe mostrarlos como obligaciones distintas.</p>
      </div>

      <div style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 23, color: '#0f2733' }}>Un ejemplo rápido</h2>
        <p style={{ margin: 0, color: '#3d5a6b', lineHeight: 1.7 }}>En septiembre de 2026, el IVA del período agosto vence entre el <strong>18 y el 24 de septiembre</strong> según la terminación de CUIT. El Monotributo, cuyo vencimiento habitual es el día 20, vence el <strong>21 de septiembre</strong> porque el 20 cae domingo. Es justamente por estas diferencias que no alcanza con memorizar “IVA vence cerca del 20”.</p>
      </div>

      <div style={{ ...card, marginTop: 18 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 23, color: '#0f2733' }}>¿Qué pasa si ARCA cambia una fecha?</h2>
        <p style={{ margin: 0, color: '#3d5a6b', lineHeight: 1.7 }}>Las prórrogas existen y pueden publicarse después del calendario original. Por eso las fechas se revisan y el calendario distingue lo confirmado de lo orientativo. Para una obligación crítica, también podés comprobarla directamente en ARCA.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <a href="https://www.arca.gob.ar/vencimientos/" target="_blank" rel="noopener noreferrer" style={{ background: '#0d5c78', color: '#fff', padding: '11px 16px', borderRadius: 9, fontWeight: 800, textDecoration: 'none' }}>Ver vencimientos oficiales en ARCA ↗</a>
          <Link href="/" style={{ border: '1px solid #1a7fa8', color: '#0d5c78', padding: '11px 16px', borderRadius: 9, fontWeight: 800, textDecoration: 'none' }}>🔔 Activar recordatorios</Link>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 13, color: '#64748b', lineHeight: 1.65 }}>
        <strong>Fuentes:</strong> agenda y micrositios oficiales de ARCA y normativa vigente cuando corresponde. Última revisión editorial: 13/09/2026. Fácil Fiscal es una herramienta independiente y no reemplaza las notificaciones ni constancias del organismo recaudador.
      </div>
    </div>
  </section>
}
