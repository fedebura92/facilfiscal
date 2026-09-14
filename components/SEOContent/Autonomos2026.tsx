import Link from 'next/link'

const V = {
  tealDark: '#0d5c78', tealLight: '#e8f6fb', tealRing: '#a8ddf0',
  goldLight: '#fff8ec', goldRing: '#fde4a0', redBg: '#fff1f1', redRing: '#ffc8c8',
  border: '#e2e8ed', ink: '#0f2733', ink2: '#3d5a6b', ink3: '#6b7f8a',
}

const section = { background:'#fff', border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden' as const, marginBottom:20, boxShadow:'0 1px 4px rgba(13,92,120,.07)' }
const title = { padding:'14px 16px', borderBottom:`1px solid ${V.border}`, fontSize:16, fontWeight:900 as const, color:V.ink }
const body = { padding:'16px' }
const p = { fontSize:13, color:V.ink2, fontWeight:600 as const, lineHeight:1.75, margin:'0 0 12px' }

const aportes = [
  ['I', '$75.402,48'],
  ['II', '$105.561,86'],
  ['III', '$150.803,64'],
  ['IV', '$241.285,70'],
  ['V', '$331.766,54'],
]

export default function Autonomos2026() {
  return (
    <section style={{ maxWidth:860, margin:'0 auto', padding:'0 16px 48px' }}>
      <div style={{ ...section, background:'#f8fbfc' }}>
        <div style={title}>⚡ Autónomos 2026, explicado fácil</div>
        <div style={body}>
          <p style={p}>El régimen de <strong>trabajadores autónomos</strong> es el régimen previsional para personas que realizan una actividad económica por cuenta propia. El aporte mensual financia la seguridad social y no reemplaza a los impuestos del régimen general.</p>
          <p style={{ ...p, marginBottom:0 }}>Si sos autónomo, además del aporte previsional pueden corresponderte <strong>IVA, Ganancias, Ingresos Brutos y otras obligaciones</strong> según tu actividad y situación.</p>
        </div>
      </div>

      <div style={section}>
        <div style={title}>✅ ¿Cuándo puede corresponderte Autónomos?</div>
        <div style={body}>
          <p style={p}>En términos simples, suele corresponder cuando trabajás por cuenta propia dentro del régimen general. También puede ser obligatorio cuando no podés permanecer en Monotributo por los parámetros o por el tipo de actividad.</p>
          <p style={p}>ARCA aclara que quien cumple las condiciones del Monotributo puede optar por ese régimen y quedar eximido de la inscripción como autónomo. En cambio, ciertas actividades —por ejemplo dirección o administración de sociedades— no son compatibles con Monotributo y deben ir al régimen general.</p>
          <div style={{ background:V.goldLight, border:`1px solid ${V.goldRing}`, borderRadius:10, padding:'12px 14px', fontSize:12, color:'#76510a', fontWeight:700, lineHeight:1.6 }}>
            💡 <strong>Importante:</strong> “Autónomo” describe el régimen previsional. No significa que IVA o Ganancias estén incluidos en ese pago mensual.
          </div>
        </div>
      </div>

      <div style={section}>
        <div style={title}>💰 ¿Cuánto paga un autónomo en 2026?</div>
        <div style={body}>
          <p style={p}>El importe depende de la categoría. ARCA determina la categoría considerando principalmente la <strong>actividad desarrollada</strong> y los <strong>ingresos brutos del año calendario anterior</strong>. Si recién empezás, la categorización inicial se hace según la actividad.</p>
          <p style={p}>Valores generales vigentes desde el <strong>15 de agosto de 2026</strong>:</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))', gap:10, marginTop:12 }}>
            {aportes.map(([cat, monto]) => (
              <div key={cat} style={{ background:V.tealLight, border:`1px solid ${V.tealRing}`, borderRadius:10, padding:12, textAlign:'center' }}>
                <div style={{ fontSize:12, color:V.ink3, fontWeight:800 }}>Categoría {cat}</div>
                <div style={{ fontSize:18, color:V.tealDark, fontWeight:900, marginTop:4 }}>{monto}</div>
                <div style={{ fontSize:11, color:V.ink3, marginTop:2 }}>aporte mensual</div>
              </div>
            ))}
          </div>
          <p style={{ ...p, marginTop:12, marginBottom:0 }}>Estos importes corresponden a las categorías mínimas generales. Existen importes distintos para actividades penosas o riesgosas, jubilados que continúan en actividad, afiliaciones voluntarias y otros casos especiales.</p>
        </div>
      </div>

      <div style={section}>
        <div style={title}>📅 ¿Cuándo vence el aporte?</div>
        <div style={body}>
          <p style={p}>El aporte de Autónomos es mensual y el vencimiento depende de la terminación de tu CUIT. No conviene guardar una única fecha fija porque ARCA puede trasladarla por feriados o disposiciones especiales.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
            <div style={{ background:'#f8fafc', border:`1px solid ${V.border}`, borderRadius:10, padding:12 }}><strong>CUIT 0, 1, 2 y 3</strong><br/><span style={{ fontSize:12, color:V.ink3 }}>vencimiento general según agenda vigente</span></div>
            <div style={{ background:'#f8fafc', border:`1px solid ${V.border}`, borderRadius:10, padding:12 }}><strong>CUIT 4, 5 y 6</strong><br/><span style={{ fontSize:12, color:V.ink3 }}>vencimiento general según agenda vigente</span></div>
            <div style={{ background:'#f8fafc', border:`1px solid ${V.border}`, borderRadius:10, padding:12 }}><strong>CUIT 7, 8 y 9</strong><br/><span style={{ fontSize:12, color:V.ink3 }}>vencimiento general según agenda vigente</span></div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:14 }}>
            <Link href="/calendario-fiscal" style={{ background:V.tealDark, color:'#fff', textDecoration:'none', padding:'10px 14px', borderRadius:9, fontWeight:900, fontSize:13 }}>Ver mi próximo vencimiento →</Link>
            <Link href="/alertas" style={{ background:'#f5a623', color:'#102a36', textDecoration:'none', padding:'10px 14px', borderRadius:9, fontWeight:900, fontSize:13 }}>🔔 Recibir recordatorios</Link>
          </div>
        </div>
      </div>

      <div style={section}>
        <div style={title}>🧾 ¿Autónomos incluye IVA y Ganancias?</div>
        <div style={body}>
          <p style={p}><strong>No.</strong> El aporte de Autónomos es previsional. ARCA indica que, paralelamente, el trabajador autónomo queda comprendido en el régimen general impositivo y debe darse de alta, como mínimo, en <strong>IVA y Ganancias</strong>, además de los demás tributos que correspondan.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:10 }}>
            <div style={{ background:V.tealLight, border:`1px solid ${V.tealRing}`, borderRadius:10, padding:12 }}><strong>⚡ Autónomos</strong><div style={{ fontSize:12, color:V.ink2, marginTop:4 }}>Aporte previsional mensual.</div></div>
            <div style={{ background:V.tealLight, border:`1px solid ${V.tealRing}`, borderRadius:10, padding:12 }}><strong>🧾 IVA</strong><div style={{ fontSize:12, color:V.ink2, marginTop:4 }}>Declaración mensual si corresponde.</div></div>
            <div style={{ background:V.tealLight, border:`1px solid ${V.tealRing}`, borderRadius:10, padding:12 }}><strong>💼 Ganancias</strong><div style={{ fontSize:12, color:V.ink2, marginTop:4 }}>Declaración anual y anticipos cuando correspondan.</div></div>
          </div>
        </div>
      </div>

      <div style={section}>
        <div style={title}>🔄 ¿Cuándo se revisa la categoría?</div>
        <div style={body}>
          <p style={p}>ARCA informa que la <strong>recategorización de Autónomos se realiza en mayo de cada año</strong>, tomando en cuenta los ingresos brutos obtenidos durante el año anterior.</p>
          <p style={{ ...p, marginBottom:0 }}>Si cambió tu actividad o tus ingresos, conviene revisar la categoría para evitar pagar un aporte incorrecto.</p>
        </div>
      </div>

      <div style={section}>
        <div style={title}>📝 Ejemplo simple</div>
        <div style={body}>
          <p style={p}>Una persona que presta servicios por su cuenta y está en régimen general puede tener, por un lado, su <strong>aporte mensual de Autónomos</strong> y, por otro, sus obligaciones de IVA y Ganancias. El aporte previsional no se calcula como un porcentaje de cada factura: se paga el importe correspondiente a la categoría en la que está inscripta.</p>
          <p style={{ ...p, marginBottom:0 }}>Por eso Fácil Fiscal separa cada obligación y muestra los vencimientos por tipo, en lugar de mezclar todo en un único monto.</p>
        </div>
      </div>

      <div style={{ ...section, borderColor:V.redRing }}>
        <div style={title}>⚠️ Casos en los que conviene revisar tu situación</div>
        <div style={body}>
          <ul style={{ margin:0, paddingLeft:20, color:V.ink2, fontSize:13, lineHeight:1.8, fontWeight:600 }}>
            <li>Pasaste del Monotributo al régimen general.</li>
            <li>Sos director, administrador o socio con funciones alcanzadas por Autónomos.</li>
            <li>Cambiaste de actividad durante el año.</li>
            <li>No sabés qué categoría tenés registrada.</li>
            <li>Hace meses que pagás siempre el mismo importe y no verificaste actualizaciones.</li>
          </ul>
        </div>
      </div>

      <div style={section}>
        <div style={title}>❓ Preguntas frecuentes</div>
        <div style={body}>
          <details style={{ marginBottom:10 }}><summary style={{ fontWeight:900, cursor:'pointer' }}>¿Autónomo y Responsable Inscripto son lo mismo?</summary><p style={{ ...p, marginTop:8 }}>No exactamente. Autónomos es el régimen previsional. “Responsable Inscripto” se usa habitualmente para referirse a la situación frente al IVA dentro del régimen general. Una persona puede tener aporte de Autónomos y, al mismo tiempo, estar inscripta en IVA y Ganancias.</p></details>
          <details style={{ marginBottom:10 }}><summary style={{ fontWeight:900, cursor:'pointer' }}>¿Puedo ser monotributista y autónomo a la vez por la misma actividad?</summary><p style={{ ...p, marginTop:8 }}>Si cumplís las condiciones para adherir al Monotributo, ese régimen incorpora el componente previsional y, en general, te exime de la obligación de inscribirte como autónomo por esa actividad. Hay situaciones particulares que deben revisarse según la actividad.</p></details>
          <details><summary style={{ fontWeight:900, cursor:'pointer' }}>¿Dónde veo mi categoría?</summary><p style={{ ...p, marginTop:8, marginBottom:0 }}>La inscripción y categorización se gestiona desde Sistema Registral de ARCA, en “Registro Tributario” → “Empadronamiento Autónomos”.</p></details>
        </div>
      </div>

      <div style={{ fontSize:12, color:V.ink3, lineHeight:1.65 }}>
        <strong style={{ color:V.ink }}>Fuentes y actualización.</strong> Contenido revisado con información oficial de ARCA sobre definición del régimen, inscripción, categorización y valores de aportes vigentes desde el 15/08/2026. Los importes y fechas pueden cambiar; por eso el calendario y las alertas deben prevalecer sobre fechas guardadas manualmente. <a href="https://www.arca.gob.ar/autonomos/" target="_blank" rel="noopener noreferrer">Ver Autónomos en ARCA →</a>
      </div>
    </section>
  )
}
