import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Responsable Inscripto: obligaciones, IVA y vencimientos',
  description: 'Entendé de forma simple qué debe hacer un Responsable Inscripto: IVA, Ganancias, facturación, vencimientos y recordatorios actualizados.',
  keywords: ['responsable inscripto', 'vencimientos IVA', 'ganancias argentina', 'AFIP responsable inscripto', 'factura A factura B', 'ARCA'],

  alternates: {
    canonical: '/responsable-inscripto',
  },

  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.facilfiscal.com.ar/responsable-inscripto',
    siteName: 'FacilFiscal',
    title: 'Responsable Inscripto — Vencimientos y Alertas | FacilFiscal',
    description: 'Controlá tus vencimientos de IVA, Ganancias y más. Recordatorios automáticos para Responsables Inscriptos.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },

  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function ResponsableInscriptoLayout({ children }: { children: React.ReactNode }) {
  return children
}
