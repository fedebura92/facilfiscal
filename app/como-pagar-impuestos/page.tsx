import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, faqJsonLd } from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'Cómo pagar impuestos en Argentina: guía práctica 2026 | Fácil Fiscal',
  description: 'Guía para revisar obligaciones, generar pagos y comprobar pagos de Monotributo, Autónomos, IVA, Ganancias e Ingresos Brutos.',
  alternates: { canonical: 'https://www.facilfiscal.com.ar/como-pagar-impuestos' },
}

const style = { maxWidth: 860, margin: '0 auto', padding: '34px 22px 72px', color: '#183744', lineHeight: 1.75 } as const
const card = { border: '1px solid #dce7ed', borderRadius: 12, padding: 18, marginBottom: 14, background: '#fff' } as const
const linkStyle = { color: '#0d6687', fontWeight: 700 } as const

const faq = [
 { question: '¿Presentar una declaración jurada significa que ya pagué?', answer: 'No necesariamente. Presentar o enviar una declaración y cancelar el saldo son acciones distintas. Revisá el estado de presentación y el estado del pago por separado.' },
 { question: '¿Puedo usar el mismo medio de pago para todos los impuestos?', answer: 'No siempre. El medio depende del tributo, el régimen y la jurisdicción. Seguí las opciones que habilite el organismo correspondiente para tu obligación.' },
 { question: '¿Qué hago si el pago no aparece?', answer: 'Conservá el comprobante, verificá período, CUIT, impuesto y fecha, y consultá el estado en el servicio oficial. Si persiste la diferencia, contactá al organismo o a tu entidad de pago antes de duplicar el pago.' },
]

export default function ComoPagarImpuestosPage() {
 return <>
  <StructuredData data={[
   breadcrumbJsonLd([{ name: 'Inicio', url: 'https://www.facilfiscal.com.ar' }, { name: 'Cómo pagar impuestos', url: 'https://www.facilfiscal.com.ar/como-pagar-impuestos' }]),
   faqJsonLd(faq),
  ]} />
  <SiteHeader currentPath="/como-pagar-impuestos" />
  <main className="ff-page-content" style={style}>
   <p style={{ color: '#0d6687', fontWeight: 800, fontSize: 13 }}>GUÍA PRÁCTICA · ARGENTINA · 2026</p>
   <h1 style={{ fontSize: 32, lineHeight: 1.2, marginBottom: 12 }}>Cómo pagar tus impuestos y comprobar que quedaron cancelados</h1>
   <p>El trámite cambia según el impuesto, tu régimen y la jurisdicción. Esta guía te ayuda a identificar el camino y a evitar confundir una declaración presentada con un pago realizado. No reemplaza el detalle de deuda ni los servicios oficiales.</p>
   <section style={card}>
    <h2>Antes de empezar: identificá qué obligación tenés</h2>
    <ol>
     <li>Confirmá tu CUIT y condición fiscal.</li>
     <li>Identificá el impuesto, período y vencimiento que querés cancelar.</li>
     <li>Revisá si corresponde presentar una declaración, generar un volante de pago o abonar un importe fijo.</li>
     <li>Usá el servicio oficial del organismo que administra esa obligación.</li>
    </ol>
    <p><strong>Importante:</strong> no pagues un importe estimado como si fuera una deuda confirmada. Contrastá período, concepto y saldo en el sistema oficial.</p>
   </section>
   <section style={card}>
    <h2>Monotributo</h2>
    <ol>
     <li>Ingresá al portal de <a style={linkStyle} href="https://www.arca.gob.ar/monotributo/" target="_blank" rel="noopener noreferrer">Monotributo de ARCA</a> y accedé con tu CUIT y clave fiscal.</li>
     <li>Consultá la cuota del período y las opciones de pago habilitadas para tu situación.</li>
     <li>Realizá el pago y conservá el comprobante.</li>
     <li>Volvé a consultar el estado para confirmar que se registró.</li>
    </ol>
    <p>Si tenés deuda de períodos anteriores, revisá el detalle por período y los intereses que informe el sistema antes de generar el pago.</p>
   </section>
   <section style={card}>
    <h2>Autónomos</h2>
    <ol>
     <li>Ingresá a los servicios de <a style={linkStyle} href="https://www.arca.gob.ar/" target="_blank" rel="noopener noreferrer">ARCA</a> y consultá tu situación previsional y los períodos pendientes.</li>
     <li>Verificá categoría, período e importe vigente.</li>
     <li>Generá el pago mediante el mecanismo habilitado para la obligación.</li>
     <li>Comprobá luego que el pago se haya imputado al período correcto.</li>
    </ol>
    <p>Autónomos es un aporte previsional; no reemplaza las obligaciones de IVA o Ganancias que pudieran corresponder por separado.</p>
   </section>
   <section style={card}>
    <h2>IVA y Ganancias — Régimen General</h2>
    <ol>
     <li>Prepará y presentá la declaración jurada correspondiente en el servicio oficial. Para IVA, verificá el procedimiento vigente de IVA Simple.</li>
     <li>Revisá el saldo determinado, anticipos, retenciones, percepciones y compensaciones que correspondan.</li>
     <li>Si queda un importe a pagar, generá el volante o medio de pago desde el servicio oficial habilitado.</li>
     <li>Guardá el acuse de presentación y el comprobante de pago: son constancias diferentes.</li>
    </ol>
    <p>Consultá el <Link href="/calendario-fiscal" style={linkStyle}>calendario fiscal</Link> para ubicar vencimientos. Los plazos dependen del impuesto, período y, en ciertos casos, de la terminación de CUIT.</p>
    <p><a style={linkStyle} href="https://www.arca.gob.ar/iva/" target="_blank" rel="noopener noreferrer">Información oficial de IVA en ARCA</a> · <a style={linkStyle} href="https://www.arca.gob.ar/gananciasYBienes/" target="_blank" rel="noopener noreferrer">Ganancias y Bienes Personales en ARCA</a></p>
   </section>
   <section style={card}>
    <h2>Ingresos Brutos</h2>
    <p>El pago depende de la provincia, el régimen y la actividad. Si estás en un esquema unificado, el componente provincial puede integrarse al pago nacional. En el régimen general, normalmente se presenta o determina la obligación en el sistema provincial correspondiente.</p>
    <p>Identificá primero tu jurisdicción y régimen en la guía de <Link href="/impuestos-por-provincia" style={linkStyle}>impuestos por provincia</Link>. Para actividad en más de una jurisdicción, verificá si corresponde Convenio Multilateral y sus servicios oficiales.</p>
   </section>
   <section style={card}>
    <h2>Si el pago no figura o aparece una deuda</h2>
    <ul>
     <li>Compará CUIT, impuesto, período, concepto e importe con el comprobante.</li>
     <li>Verificá la fecha de acreditación y el estado en el portal oficial.</li>
     <li>No repitas automáticamente el pago si ya tenés un comprobante válido; primero consultá el estado y el canal de soporte.</li>
     <li>Si pagaste un período o concepto incorrecto, seguí el procedimiento oficial de imputación o reimputación aplicable.</li>
    </ul>
   </section>
   <section style={card}>
    <h2>Preguntas frecuentes</h2>
    {faq.map((item) => <div key={item.question} style={{ marginBottom: 12 }}><h3 style={{ fontSize: 16, marginBottom: 4 }}>{item.question}</h3><p style={{ margin: 0 }}>{item.answer}</p></div>)}
   </section>
   <p style={{ fontSize: 13, color: '#64748b' }}>Guía general revisada el 28/09/2026. Los servicios, medios de pago y procedimientos pueden cambiar; confirmá siempre la instrucción vigente en el organismo oficial antes de operar.</p>
   <p><Link href="/metodologia" style={linkStyle}>Cómo verificamos la información</Link> · <Link href="/contacto" style={linkStyle}>Informar un dato para revisar</Link></p>
  </main>
 </>
}
