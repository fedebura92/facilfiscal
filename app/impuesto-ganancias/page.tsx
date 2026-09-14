import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, calculatorJsonLd, faqJsonLd } from '@/components/StructuredData'
import { GananciasCalculator } from '@/components/calculadoras/Calculadoras2026'

const faq = [
  {
    question: '¿Qué dato tengo que ingresar?',
    answer: 'Si trabajás en relación de dependencia, ingresá tu sueldo bruto mensual antes de descuentos. Si trabajás por tu cuenta, ingresá tus ingresos o facturación mensual y, si los conocés, los gastos vinculados con tu actividad.',
  },
  {
    question: '¿El resultado es el importe definitivo?',
    answer: 'No. Es una estimación orientativa. El cálculo definitivo puede cambiar por deducciones, retenciones, percepciones, anticipos, otros ingresos y tu situación particular informada ante ARCA.',
  },
  {
    question: '¿Qué cosas pueden reducir Ganancias?',
    answer: 'Según tu situación pueden computarse deducciones personales y generales, por ejemplo determinadas cargas de familia y algunos gastos admitidos por la normativa. Cada concepto tiene requisitos y, en muchos casos, topes.',
  },
  {
    question: '¿Cuándo vence Ganancias?',
    answer: 'No hay una única fecha para todos los casos. Las fechas dependen del tipo de contribuyente, período y obligación. Fácil Fiscal mantiene un calendario para consultar los próximos vencimientos y activar recordatorios.',
  },
]

export default function Page() {
  return <>
    <StructuredData data={[
      breadcrumbJsonLd([
        { name: 'Inicio', url: 'https://www.facilfiscal.com.ar' },
        { name: 'Ganancias', url: 'https://www.facilfiscal.com.ar/impuesto-ganancias' },
      ]),
      calculatorJsonLd('Calculadora de Ganancias 2026', 'Estimá Ganancias a partir de cuánto ganás y preguntas simples sobre tu situación.', '/impuesto-ganancias'),
      faqJsonLd(faq),
    ]} />
    <SiteHeader currentPath="/impuesto-ganancias" />
    <div className="ff-page-content">
      <GananciasCalculator />

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '8px 20px 64px', color: '#183744', lineHeight: 1.65 }}>
        <section style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 16, padding: 22, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Ganancias, explicado fácil</h2>
          <p>El Impuesto a las Ganancias no se calcula simplemente aplicando un porcentaje a todo lo que cobrás. Primero se determina qué ingresos están alcanzados, se descuentan los conceptos admitidos y luego se aplica la escala que corresponda.</p>
          <p style={{ marginBottom: 0 }}><strong>La calculadora de arriba sirve para orientarte.</strong> Si tu situación tiene otros ingresos, deducciones, retenciones, percepciones o anticipos, el resultado definitivo puede ser distinto.</p>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2>¿A quién puede corresponderle?</h2>
          <p>Ganancias puede alcanzar distintas clases de ingresos. Entre otros casos, ARCA incluye dentro de las rentas del trabajo a empleados en relación de dependencia y a quienes ejercen profesiones liberales. También existen reglas específicas para otras rentas, actividades empresarias y sociedades.</p>
          <p>Por eso, dos personas que cobran lo mismo pueden terminar con resultados diferentes: importan el origen de los ingresos y las deducciones que correspondan en cada caso.</p>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2>¿Cómo se llega al impuesto?</h2>
          <ol style={{ paddingLeft: 22 }}>
            <li><strong>Se consideran los ingresos alcanzados.</strong></li>
            <li><strong>Se restan los gastos y deducciones admitidos</strong> que correspondan a tu situación.</li>
            <li><strong>Se obtiene la ganancia neta sujeta a impuesto</strong> y se aplica la escala vigente.</li>
            <li><strong>Se descuentan pagos computables</strong>, como retenciones, percepciones o anticipos cuando corresponda, para determinar el saldo final.</li>
          </ol>
          <p>Las deducciones personales y la escala se actualizan. Fácil Fiscal usa valores 2026 en su estimación y evita mostrar tablas históricas como si fueran actuales.</p>
        </section>

        <section style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 16, padding: 22, marginBottom: 30 }}>
          <h2 style={{ marginTop: 0 }}>📅 ¿Cuándo vence?</h2>
          <p>Ganancias no tiene una sola fecha universal. El vencimiento depende de si sos persona humana o sociedad, del período y de la obligación que corresponda: declaración jurada, saldo o anticipos.</p>
          <p>Además, ARCA puede modificar o prorrogar fechas durante el año. Por eso no dejamos una fecha fija en esta guía.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/calendario-fiscal" style={{ display: 'inline-block', background: '#183744', color: 'white', padding: '11px 16px', borderRadius: 9, fontWeight: 800, textDecoration: 'none' }}>Ver próximos vencimientos →</Link>
            <Link href="/alertas" style={{ display: 'inline-block', background: '#d4a017', color: '#102a36', padding: '11px 16px', borderRadius: 9, fontWeight: 800, textDecoration: 'none' }}>🔔 Recibir recordatorios</Link>
          </div>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2>Deducciones: qué significa en la práctica</h2>
          <p>Una deducción es un concepto que, si cumple los requisitos establecidos, puede reducir la base utilizada para calcular el impuesto. ARCA contempla deducciones personales y generales.</p>
          <p>Entre los conceptos que pueden resultar relevantes, según cada caso, están determinadas cargas de familia, medicina prepaga, alquiler, personal de casas particulares y otros gastos admitidos. <strong>No significa que todo lo que pagues pueda descontarse:</strong> existen condiciones y topes.</p>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2>Ejemplo simple</h2>
          <p>Supongamos que una persona cobra un sueldo bruto todos los meses. Para estimar Ganancias no alcanza con multiplicar ese sueldo por una alícuota. Primero hay que considerar el ingreso anual, las deducciones que correspondan y recién después aplicar la escala vigente. Si durante el año ya hubo retenciones, también deben considerarse al analizar el resultado final.</p>
          <p>Por eso nuestra calculadora pregunta primero <strong>cómo trabajás, cuánto cobrás y algunos datos personales relevantes</strong>, en lugar de pedirte términos contables difíciles de interpretar.</p>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2>Anticipos de Ganancias</h2>
          <p>Para personas humanas y sucesiones indivisas, ARCA prevé anticipos que funcionan como pagos a cuenta del impuesto del período siguiente. No son un impuesto adicional: cuando se determina la obligación principal, los pagos computables se descuentan.</p>
          <p>Las fechas pueden cambiar por disposiciones de ARCA, así que conviene consultar el calendario actualizado en lugar de guardar una fecha fija.</p>
        </section>

        <section style={{ marginBottom: 30 }}>
          <h2>Preguntas frecuentes</h2>
          {faq.map((item) => <details key={item.question} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 800 }}>{item.question}</summary>
            <p style={{ marginBottom: 0 }}>{item.answer}</p>
          </details>)}
        </section>

        <section style={{ borderTop: '1px solid #e2e8f0', paddingTop: 22, fontSize: 14, color: '#526675' }}>
          <h2 style={{ fontSize: 20, color: '#183744' }}>Fuentes y actualización</h2>
          <p>Información contrastada con ARCA: conceptos básicos del Impuesto a las Ganancias, deducciones personales y generales, escala del artículo 94 y régimen de anticipos. Los valores y vencimientos pueden modificarse, por eso las herramientas de Fácil Fiscal se presentan como orientación y enlazamos el calendario para las fechas vigentes.</p>
          <p><a href="https://www.arca.gob.ar/gananciasYBienes/" target="_blank" rel="noopener noreferrer">Consultar información oficial de Ganancias en ARCA →</a></p>
        </section>
      </main>
    </div>
  </>
}
