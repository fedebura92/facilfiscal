import type { Metadata } from 'next'
import StructuredData, { breadcrumbJsonLd } from '@/components/StructuredData'

export const metadata: Metadata = {
  title:'Categorías Monotributo 2026: calculadora y valores vigentes',
  description:'Calculá gratis tu categoría de Monotributo con los límites y cuotas vigentes desde agosto de 2026, verificados contra la fuente oficial de ARCA.',
  alternates:{ canonical:'/mi-categoria' },
  openGraph:{
    title:'Calculadora de categoría de Monotributo 2026',
    description:'Límites y cuotas vigentes de ARCA. Calculá tu categoría gratis.',
    url:'https://www.facilfiscal.com.ar/mi-categoria', type:'website', locale:'es_AR',
  },
}

export default function MiCategoriaLayout({ children }:{ children:React.ReactNode }) {
  return <><StructuredData data={breadcrumbJsonLd([
    { name:'Inicio', url:'https://www.facilfiscal.com.ar' },
    { name:'Categorías de Monotributo', url:'https://www.facilfiscal.com.ar/mi-categoria' },
  ])} />{children}</>
}
