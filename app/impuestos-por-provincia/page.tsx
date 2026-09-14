import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd } from '@/components/StructuredData'
import ProvincialGuide from '@/components/ProvincialGuide'

export default function Page(){
  return <>
    <StructuredData data={breadcrumbJsonLd([
      {name:'Inicio',url:'https://www.facilfiscal.com.ar'},
      {name:'Impuestos por provincia',url:'https://www.facilfiscal.com.ar/impuestos-por-provincia'},
    ])}/>
    <SiteHeader currentPath="/impuestos-por-provincia"/>
    <div className="ff-page-content"><ProvincialGuide/></div>
  </>
}
