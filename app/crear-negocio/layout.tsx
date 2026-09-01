import type { Metadata } from 'next'
import StructuredData, { breadcrumbJsonLd } from '@/components/StructuredData'

export const metadata: Metadata = {
  title:'Cómo crear un negocio en Argentina: comparador fiscal',
  description:'Evaluá cómo crear tu negocio en Argentina. Compará Monotributo, Responsable Inscripto y sociedad según facturación, socios, empleados y actividad.',
  alternates:{ canonical:'/crear-negocio' },
  openGraph:{
    title:'Crear un negocio en Argentina | Fácil Fiscal',
    description:'Compará alternativas fiscales y societarias según las necesidades de tu proyecto.',
    url:'https://www.facilfiscal.com.ar/crear-negocio', type:'website', locale:'es_AR',
  },
}

export default function CrearNegocioLayout({ children }:{ children:React.ReactNode }) {
  return <><StructuredData data={breadcrumbJsonLd([
    { name:'Inicio', url:'https://www.facilfiscal.com.ar' },
    { name:'Crear mi negocio', url:'https://www.facilfiscal.com.ar/crear-negocio' },
  ])} />{children}</>
}
