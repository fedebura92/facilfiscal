import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, calculatorJsonLd, faqJsonLd } from '@/components/StructuredData'
import { IIBBCalculator } from '@/components/calculadoras/Calculadoras2026'
import IIBB2026 from '@/components/SEOContent/IIBB2026'

export default function Page(){
  const faq=[
    {question:'¿Cómo se calcula Ingresos Brutos?',answer:'Depende del régimen. En algunos regímenes simplificados se paga un importe fijo según categoría. En el régimen general, el cálculo parte de la base imponible y de la alícuota que corresponda a la actividad y jurisdicción, considerando además retenciones, percepciones, saldos y exenciones.'},
    {question:'¿Cada cuánto se paga Ingresos Brutos?',answer:'En general, la obligación es mensual. Según la jurisdicción y el régimen puede existir además una declaración anual u otras presentaciones.'},
    {question:'¿Cómo se paga Ingresos Brutos?',answer:'Depende de la jurisdicción y el régimen. En Monotributo Unificado el componente provincial puede pagarse junto con el Monotributo nacional. En régimen general, normalmente se determina o presenta el período en el sistema del organismo provincial y luego se genera el medio de pago habilitado.'},
    {question:'¿La alícuota es igual en todas las provincias?',answer:'No. Puede variar por jurisdicción, actividad, padrón, nivel de ingresos, régimen y beneficios fiscales.'}
  ]
  return <>
    <StructuredData data={[
      breadcrumbJsonLd([{name:'Inicio',url:'https://www.facilfiscal.com.ar'},{name:'Ingresos Brutos',url:'https://www.facilfiscal.com.ar/ingresos-brutos'}]),
      calculatorJsonLd('Calculadora de Ingresos Brutos 2026','Estima Ingresos Brutos según actividad y jurisdicción.','/ingresos-brutos'),
      faqJsonLd(faq)
    ]}/>
    <SiteHeader currentPath="/ingresos-brutos"/>
    <div className="ff-page-content">
      <IIBBCalculator/>
      <IIBB2026/>
    </div>
  </>
}
