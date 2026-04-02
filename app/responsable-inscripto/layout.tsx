import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Responsable Inscripto — Vencimientos IVA y Ganancias | FacilFiscal',
  description: 'Seguí tus vencimientos de IVA, Ganancias y Bienes Personales como Responsable Inscripto. Alertas automáticas antes de cada fecha límite.',
  keywords: ['responsable inscripto', 'vencimientos IVA', 'ganancias argentina', 'AFIP responsable inscripto', 'factura A factura B', 'ARCA'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://facilfiscal.com.ar/responsable-inscripto',
    siteName: 'FacilFiscal',
    title: 'Responsable Inscripto — Vencimientos y Alertas | FacilFiscal',
    description: 'Controlá tus vencimientos de IVA, Ganancias y más. Recordatorios automáticos para Responsables Inscriptos.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function ResponsableInscriptoLayout({ children }: { children: React.ReactNode }) {
  return children
}
