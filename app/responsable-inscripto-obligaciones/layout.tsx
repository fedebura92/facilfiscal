import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Obligaciones del Responsable Inscripto 2026: checklist',
  description: 'Checklist simple y actualizado de las obligaciones de un Responsable Inscripto: IVA Simple, Ganancias, facturación, IIBB y vencimientos.',
  alternates: { canonical: '/responsable-inscripto-obligaciones' },
  openGraph: {
    title: 'Obligaciones del Responsable Inscripto 2026',
    description: 'Checklist claro para entender IVA, Ganancias, facturación y obligaciones provinciales.',
    url: '/responsable-inscripto-obligaciones',
    type: 'article',
    locale: 'es_AR',
    siteName: 'Fácil Fiscal',
  },
  robots: { index: true, follow: true },
}

export default function ResponsableObligacionesLayout({ children }: { children: React.ReactNode }) {
  return children
}
