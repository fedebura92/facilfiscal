import SiteHeader from '@/components/SiteHeader'
import StructuredData,{breadcrumbJsonLd,calculatorJsonLd} from '@/components/StructuredData'
import {ProvinceCalculatorPage} from '@/components/calculadoras/Calculadoras2026'
export default function Page(){return <><StructuredData data={[breadcrumbJsonLd([{name:'Inicio',url:'https://www.facilfiscal.com.ar'},{name:'Impuestos por provincia',url:'https://www.facilfiscal.com.ar/impuestos-por-provincia'}]),calculatorJsonLd('Calculadora de impuestos por provincia 2026','Calcula Ingresos Brutos según provincia, actividad y facturación.','/impuestos-por-provincia')]}/><SiteHeader currentPath="/impuestos-por-provincia"/><div className="ff-page-content"><ProvinceCalculatorPage/></div></>}
