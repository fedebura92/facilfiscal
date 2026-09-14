import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Responsable Inscripto 2026: IVA, Ganancias y vencimientos',
  description: 'Entendé de forma simple qué debe hacer un Responsable Inscripto en 2026: IVA Simple, Ganancias, facturación, vencimientos y recordatorios actualizados.',
  keywords: ['responsable inscripto', 'vencimientos IVA', 'ganancias argentina', 'ARCA responsable inscripto', 'factura A factura B', 'IVA Simple'],

  alternates: {
    canonical: '/responsable-inscripto',
  },

  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.facilfiscal.com.ar/responsable-inscripto',
    siteName: 'FacilFiscal',
    title: 'Responsable Inscripto 2026 — IVA, Ganancias y vencimientos | FacilFiscal',
    description: 'Controlá IVA, Ganancias, facturación y próximos vencimientos. Fácil Fiscal te ayuda a entender qué hacer y cuándo hacerlo.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },

  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function ResponsableInscriptoLayout({ children }: { children: React.ReactNode }) {
  return children
}
