import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, faqJsonLd } from '@/components/StructuredData'

const sections = [
  { id: 'antes', title: 'Antes de pagar: identificá la obligación', body: 'Primero confirmá qué impuesto o aporte estás cancelando, el período, el concepto, el importe y la fecha de vencimiento. No uses un volante viejo ni copies datos de otro período. La obligación exacta puede depender de tu régimen, actividad, jurisdicción y CUIT.' },
  { id: 'mono', title: 'Monotributo: pagar la cuota mensual', steps: ['Ingresá a ARCA con CUIT y clave fiscal y consultá tu estado y credencial de pago.', 'Revisá período, categoría e importe vigente. Si tenés deuda, consultá los períodos pendientes antes de generar pagos.', 'Elegí un medio de pago habilitado para tu situación (por ejemplo, pago electrónico o débito automático, si está disponible).', 'Guardá el comprobante y volvé a consultar el estado de cuenta para confirmar que el pago se imputó.'] , link: ['ARCA: Monotributo', 'https://www.arca.gob.ar/monotributo/'] },
  { id: 'autonomos', title: 'Autónomos: aporte previsional', steps: ['Verificá tu categoría de revista y el importe que corresponde al período.', 'Consultá la Cuenta Corriente de Monotributistas y Autónomos (CCMA) para revisar obligaciones, pagos y deuda.', 'Generá el volante electrónico de pago (VEP) u otro medio habilitado para la obligación y cancelalo desde el banco o billetera disponible.', 'Guardá el comprobante y revisá luego en CCMA que el pago figure aplicado al período correcto.'] , link: ['ARCA: Autónomos', 'https://www.arca.gob.ar/autonomos/'] , note: 'Autónomos es un aporte previsional. No reemplaza IVA, Ganancias ni Ingresos Brutos: si también te corresponden, se presentan y pagan por separado.' },
  { id: 'iva', title: 'IVA: presentar la declaración y pagar el saldo', steps: ['Ingresá a ARCA y abrí Portal IVA / IVA Simple.', 'Revisá la registración de operaciones y los datos disponibles: comprobantes, créditos fiscales, retenciones, percepciones y saldos.', 'Completá la determinación y presentá la declaración jurada del período. Presentar no significa que el saldo esté pagado.', 'Si queda un importe a ingresar, generá el medio de pago indicado por ARCA (habitualmente VEP), pagalo por un canal habilitado y conservá el comprobante.', 'Consultá después la cuenta tributaria para verificar la imputación.'] , link: ['ARCA: IVA Simple', 'https://www.arca.gob.ar/iva/iva-simple/'] , note: 'Si no hubo operaciones, verificá cómo informar el período sin movimiento; no supongas que la falta de facturación elimina la obligación de presentar.' },
  { id: 'ganancias', title: 'Ganancias: saldo anual y anticipos', steps: ['Determiná qué obligación estás pagando: saldo de una declaración jurada anual o anticipo a cuenta de un período futuro.', 'Consultá en ARCA el período, concepto, importe y vencimiento que aparecen para tu CUIT.', 'Para el saldo anual, presentá primero la declaración jurada correspondiente y luego cancelá el saldo que resulte, si lo hay.', 'Para anticipos, verificá el anticipo específico y su vencimiento. No lo confundas con una cuota mensual ni con el saldo anual.', 'Pagá por un medio habilitado, guardá el comprobante y verificá la imputación.'] , link: ['ARCA: Ganancias personas humanas', 'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/'] , note: 'La presentación y el pago pueden tener vencimientos distintos. Si el vencimiento ya pasó, consultá la deuda e intereses actualizados en ARCA antes de generar el pago.' },
  { id: 'iibb', title: 'Ingresos Brutos: depende de la jurisdicción', steps: ['Identificá si estás en un régimen simplificado/unificado, en el régimen local de una jurisdicción o en Convenio Multilateral.', 'Ingresá al portal oficial del organismo que administra tu obligación y seleccioná el período correcto.', 'En régimen general, revisá la declaración, base imponible, alícuota aplicable, retenciones, percepciones y saldos antes de presentar.', 'Presentá la declaración cuando corresponda y generá el volante o medio de pago que indique el organismo.', 'Conservá el comprobante y verificá luego el estado de la obligación.'] , note: 'No existe un único portal ni una única forma de pago para todo el país. En Monotributo Unificado, el componente provincial puede integrarse al pago unificado si la jurisdicción y el contribuyente están adheridos.' },
]
const faqs = [
  { question: '¿Pagar un VEP significa que ya presenté la declaración jurada?', answer: 'No. Presentar la declaración y pagar el saldo son acciones distintas. Verificá por separado el acuse de presentación y el comprobante de pago.' },
  { question: '¿Qué hago si pagué y todavía aparece deuda?', answer: 'Guardá el comprobante y revisá que coincidan CUIT, impuesto, concepto y período. Algunos medios pueden demorar en acreditarse. Si el pago no se imputa después del plazo informado por el organismo, consultá el servicio oficial con el comprobante.' },
  { question: '¿Cómo pago una obligación vencida?', answer: 'Consultá la deuda actualizada en el organismo correspondiente. Los intereses y opciones de regularización dependen del impuesto, período y situación. No reutilices un VEP anterior sin confirmar que sigue vigente.' },
  { question: '¿Puedo pagar todos los impuestos desde un solo lugar?', answer: 'No necesariamente. ARCA administra obligaciones nacionales; Ingresos Brutos y tasas locales pueden depender de organismos provinciales, de Convenio Multilateral o municipales.' },
]
const card = { border: '1px solid #dbe5eb', borderRadius: 14, padding: 20, background: '#fff', marginBottom: 16 }
const linkStyle = { color: '#0d5c78', fontWeight: 800, textDecoration: 'none' as const }
export default function ComoPagarImpuestosPage() {
  return <>
    <StructuredData data={[
      breadcrumbJsonLd([{ name: 'Inicio', url: 'https://www.facilfiscal.com.ar' }, { name: 'Cómo pagar impuestos', url: 'https://www.facilfiscal.com.ar/como-pagar-impuestos' }]),
      faqJsonLd(faqs),
    ]} />
    <SiteHeader currentPath="/como-pagar-impuestos" />
    <div className="ff-page-content">
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '34px 18px 60px', fontFamily: 'Nunito, sans-serif', color: '#0f2733', lineHeight: 1.7 }}>
        <div style={{ color: '#0d5c78', fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>Guía práctica · Argentina</div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,42px)', lineHeight: 1.15, margin: '8px 0 14px' }}>Cómo pagar tus impuestos, paso a paso</h1>
        <p style={{ fontSize: 17, color: '#3d5a6b', marginTop: 0 }}>Una guía para identificar la obligación, presentar lo que corresponda, pagar por un canal habilitado y comprobar que quedó registrado. Los portales y medios disponibles pueden variar según tu situación.</p>
        <div style={{ ...card, background: '#e8f6fb', borderColor: '#a8ddf0' }}>
          <strong>Regla útil:</strong> no confundas <strong>presentar</strong> una declaración jurada con <strong>pagar</strong> el saldo. Guardá el acuse de presentación y el comprobante de pago por separado.
        </div>
        <h2>Elegí tu obligación</h2>
        <nav aria-label="Índice de guías de pago" style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 24 }}>
          {sections.map(s => <a key={s.id} href={'#' + s.id} style={{ ...linkStyle, background: '#f4f7f9', border: '1px solid #dbe5eb', borderRadius: 30, padding: '7px 13px', fontSize: 13 }}>{s.title.split(':')[0]}</a>)}
        </nav>
        <section id="antes" style={card}>
          <h2 style={{ marginTop: 0 }}>Antes de pagar: identificá la obligación</h2>
          <p>{sections[0].body}</p>
          <ol style={{ paddingLeft: 22 }}>
            <li>Confirmá impuesto/aporte y período.</li>
            <li>Verificá CUIT, concepto, importe y vencimiento en el portal oficial.</li>
            <li>Comprobá si primero tenés que presentar una declaración jurada.</li>
            <li>Usá el medio de pago habilitado y conservá el comprobante.</li>
          </ol>
        </section>
        {sections.slice(1).map(s => <section id={s.id} key={s.id} style={card}>
          <h2 style={{ marginTop: 0 }}>{s.title}</h2>
          <ol style={{ paddingLeft: 22 }}>{s.steps?.map(step => <li key={step} style={{ marginBottom: 7 }}>{step}</li>)}</ol>
          {s.note && <p style={{ background: '#fff8ec', border: '1px solid #fde4a0', borderRadius: 9, padding: 12, fontSize: 14 }}>{s.note}</p>}
          {s.link && <p style={{ marginBottom: 0 }}><a href={s.link[1]} target="_blank" rel="noopener noreferrer" style={linkStyle}>{s.link[0]}: sitio oficial →</a></p>}
        </section>)}
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Ingresos Brutos: portales oficiales frecuentes</h2>
          <ul style={{ paddingLeft: 22 }}>
            <li><a href="https://www.arba.gov.ar/" target="_blank" rel="noopener noreferrer" style={linkStyle}>ARBA</a> — Provincia de Buenos Aires.</li>
            <li><a href="https://www.agip.gob.ar/" target="_blank" rel="noopener noreferrer" style={linkStyle}>AGIP</a> — Ciudad Autónoma de Buenos Aires.</li>
            <li><a href="https://www.ca.gob.ar/" target="_blank" rel="noopener noreferrer" style={linkStyle}>Comisión Arbitral</a> — información y servicios de Convenio Multilateral.</li>
          </ul>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 0 }}>Si tu jurisdicción es otra, ingresá al sitio oficial de su administración tributaria. Verificá siempre el portal y el régimen que te corresponde.</p>
        </section>
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Si tenés deuda, pagaste y no se acreditó, o aparece un error</h2>
          <ul style={{ paddingLeft: 22 }}>
            <li><strong>Deuda vencida:</strong> consultá el detalle actualizado y los intereses en el organismo; evaluá las opciones de regularización vigentes para tu caso.</li>
            <li><strong>Pago no registrado:</strong> guardá el comprobante y cotejá CUIT, período y concepto. Considerá los plazos de acreditación del medio utilizado.</li>
            <li><strong>Datos incorrectos:</strong> no generes pagos duplicados a ciegas. Revisá la obligación y consultá al organismo con el comprobante.</li>
            <li><strong>Plan de facilidades:</strong> verificá condiciones, cuotas y estado del plan directamente en el organismo; no todos los conceptos son siempre elegibles.</li>
          </ul>
        </section>
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Ejemplo ilustrativo: responsable inscripto</h2>
          <p>Una persona revisa las operaciones del mes en IVA Simple, presenta la declaración jurada y obtiene un saldo a pagar. Luego genera el medio de pago indicado por ARCA, lo cancela desde un canal habilitado y guarda dos comprobantes: el acuse de presentación y el pago. Finalmente vuelve a consultar su cuenta tributaria para comprobar la imputación. El importe y las fechas reales dependen de su situación.</p>
        </section>
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Preguntas frecuentes</h2>
          {faqs.map(f => <details key={f.question} style={{ borderTop: '1px solid #e2e8ed', padding: '12px 0' }}><summary style={{ cursor: 'pointer', fontWeight: 800 }}>{f.question}</summary><p style={{ marginBottom: 0 }}>{f.answer}</p></details>)}
        </section>
        <p style={{ fontSize: 13, color: '#64748b' }}>Guía general revisada en septiembre de 2026. Los procedimientos, servicios, vencimientos y medios de pago pueden cambiar. Confirmá los datos de tu obligación en el organismo oficial antes de pagar. Fácil Fiscal es un sitio independiente y no reemplaza asesoramiento profesional.</p>
        <p><Link href="/calendario-fiscal" style={linkStyle}>Consultar calendario fiscal →</Link> · <Link href="/responsable-inscripto-obligaciones" style={linkStyle}>Ver obligaciones del Responsable Inscripto →</Link></p>
      </main>
    </div>
  </>
}
