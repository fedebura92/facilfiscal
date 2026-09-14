import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impuestos por provincia 2026: qué pagar y cómo | Fácil Fiscal',
  description: 'Elegí tu provincia y situación fiscal. Entendé Ingresos Brutos, Monotributo Unificado, Convenio Multilateral, otros impuestos y vencimientos sin porcentajes genéricos.',
  keywords: [
    'impuestos provinciales argentina 2026',
    'ingresos brutos por provincia',
    'monotributo unificado',
    'regimen simplificado ingresos brutos',
    'convenio multilateral',
    'vencimientos ingresos brutos',
  ],
  alternates: { canonical: '/impuestos-por-provincia' },
  openGraph: {
    title: 'Impuestos por provincia 2026 | Fácil Fiscal',
    description: 'Descubrí qué obligaciones provinciales pueden corresponderte según dónde y cómo trabajás.',
    url: '/impuestos-por-provincia',
    siteName: 'Fácil Fiscal',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: { card:'summary_large_image', title:'Impuestos por provincia 2026 | Fácil Fiscal', description:'Ingresos Brutos y obligaciones provinciales explicados fácil.', images:['/og-image.png'] },
  robots: { index:true, follow:true },
}

export default function ImpuestosPorProvinciaLayout({children}:{children:React.ReactNode}){ return children }
