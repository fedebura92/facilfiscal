import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, calculatorJsonLd, faqJsonLd } from '@/components/StructuredData'
import { IVACalculator } from '@/components/calculadoras/Calculadoras2026'
import { IVASEOBlock } from '@/components/SEOContent/CalculatorSEOBlocks'

export default function Page(){
  const faq=[
    {question:'¿Cómo se calcula el IVA a pagar?',answer:'Se parte del débito fiscal de las ventas y se resta el crédito fiscal computable de las compras. Después pueden descontarse retenciones, percepciones, pagos a cuenta y saldos admitidos.'},
    {question:'¿Qué pasa si ese mes no tuve ventas ni compras?',answer:'La registración mensual sigue siendo obligatoria. En IVA Simple puede informarse el período como SIN MOVIMIENTO cuando no hubo operaciones.'},
    {question:'¿Todas mis compras generan crédito fiscal?',answer:'No. Como regla práctica, el comprobante debe estar vinculado con tu actividad y cumplir las condiciones para que el crédito resulte computable.'},
    {question:'¿Cuándo vence el IVA?',answer:'El vencimiento mensual depende de la terminación del CUIT y puede modificarse por feriados o disposiciones especiales. Conviene revisar el calendario fiscal del período.'},
    {question:'¿Cómo se presenta el IVA en 2026?',answer:'Desde el período noviembre de 2025 los Responsables Inscriptos presentan obligatoriamente mediante IVA Simple desde Portal IVA.'}
  ]
  return <>
    <StructuredData data={[
      breadcrumbJsonLd([{name:'Inicio',url:'https://www.facilfiscal.com.ar'},{name:'Calculadora de IVA',url:'https://www.facilfiscal.com.ar/iva'}]),
      calculatorJsonLd('Calculadora de IVA 2026','Estimá débito fiscal, crédito fiscal y saldo de IVA con una explicación simple de retenciones, percepciones y vencimientos.','/iva'),
      faqJsonLd(faq)
    ]}/>
    <SiteHeader currentPath="/iva"/>
    <div className="ff-page-content">
      <IVACalculator/>
      <IVASEOBlock/>
    </div>
  </>
}
