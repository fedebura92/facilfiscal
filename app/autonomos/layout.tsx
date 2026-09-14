import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autónomos 2026: aportes, categorías y vencimientos',
  description:
    'Entendé fácil si te corresponde Autónomos, cuánto se paga según categoría, cuándo vence y qué otras obligaciones como IVA y Ganancias pueden aplicar.',

  keywords: [
    'autonomos argentina 2026',
    'aportes autonomos 2026',
    'vencimientos autonomos',
    'categorias autonomos',
    'ARCA autonomos',
    'cuanto paga un autonomo',
  ],

  alternates: {
    canonical: '/autonomos',
  },

  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.facilfiscal.com.ar/autonomos',
    siteName: 'Fácil Fiscal',
    title: 'Autónomos 2026 — Aportes y Vencimientos | Fácil Fiscal',
    description:
      'Consultá aportes, categorías y vencimientos de Autónomos 2026 explicados de forma simple.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Autónomos 2026 — Aportes y Vencimientos | Fácil Fiscal',
    description: 'Cuánto paga un autónomo, cómo se determina la categoría y cuándo vence.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
  },
}

export default function AutonomosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
