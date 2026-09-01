import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, calculatorJsonLd } from '@/components/StructuredData'
import { ImportCalculator } from '@/components/calculadoras/Calculadoras2026'
export default function Page(){return <><StructuredData data={[breadcrumbJsonLd([{name:'Inicio',url:'https://www.facilfiscal.com.ar'},{name:'Importaciones',url:'https://www.facilfiscal.com.ar/impuestos-importacion'}]),calculatorJsonLd('Calculadora de importación Argentina','Estima CIF, derechos, IVA y percepciones con tasas NCM oficiales.','/impuestos-importacion')]}/><SiteHeader currentPath="/impuestos-importacion"/><div className="ff-page-content"><ImportCalculator/></div></>}
