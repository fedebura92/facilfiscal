import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autónomos 2026: categorías y aportes ARCA',
  description:
    'Guía actualizada para identificar categoría y consultar el aporte mensual vigente de Autónomos 2026 en la tabla oficial de ARCA.',

  keywords: [
    'autonomos argentina',
    'aportes autonomos',
    'vencimientos autonomos AFIP',
    'categorias autonomos',
    'ARCA autonomos',
  ],

  alternates: {
    canonical: '/autonomos',
  },

  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.facilfiscal.com.ar/autonomos',
    siteName: 'FacilFiscal',
    title: 'Autónomos — Aportes y Vencimientos | FacilFiscal',
    description:
      'Seguí tus aportes y vencimientos como autónomo. Sin multas, sin sorpresas.',
  },

  twitter: {
    card: 'summary_large_image',
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
