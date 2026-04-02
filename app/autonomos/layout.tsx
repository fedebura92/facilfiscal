import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autónomos — Aportes y Vencimientos AFIP | FacilFiscal',
  description: 'Controlá tus aportes mensuales como autónomo, vencimientos de IVA y Ganancias. Alertas automáticas antes de cada fecha límite en AFIP / ARCA.',
  keywords: ['autonomos argentina', 'aportes autonomos', 'vencimientos autonomos AFIP', 'categorias autonomos', 'ARCA autonomos'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://facilfiscal.com.ar/autonomos',
    siteName: 'FacilFiscal',
    title: 'Autónomos — Aportes y Vencimientos | FacilFiscal',
    description: 'Seguí tus aportes y vencimientos como autónomo. Sin multas, sin sorpresas.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function AutonomosLayout({ children }: { children: React.ReactNode }) {
  return children
}
