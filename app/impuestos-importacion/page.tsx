import SiteHeader from '@/components/SiteHeader'
import StructuredData,{breadcrumbJsonLd} from '@/components/StructuredData'
import Importaciones2026 from '@/components/Importaciones2026'

export default function Page(){
  return <>
    <StructuredData data={breadcrumbJsonLd([
      {name:'Inicio',url:'https://www.facilfiscal.com.ar'},
      {name:'Importaciones',url:'https://www.facilfiscal.com.ar/impuestos-importacion'}
    ])}/>
    <SiteHeader currentPath="/impuestos-importacion"/>
    <div className="ff-page-content"><Importaciones2026/></div>
  </>
}
