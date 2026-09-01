import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, calculatorJsonLd } from '@/components/StructuredData'
import { IIBBCalculator } from '@/components/calculadoras/Calculadoras2026'
export default function Page(){return <><StructuredData data={[breadcrumbJsonLd([{name:'Inicio',url:'https://www.facilfiscal.com.ar'},{name:'Ingresos Brutos',url:'https://www.facilfiscal.com.ar/ingresos-brutos'}]),calculatorJsonLd('Calculadora de Ingresos Brutos 2026','Estima Ingresos Brutos con la alícuota oficial de la actividad y jurisdicción.','/ingresos-brutos')]}/><SiteHeader currentPath="/ingresos-brutos"/><div className="ff-page-content"><IIBBCalculator/></div></>}
