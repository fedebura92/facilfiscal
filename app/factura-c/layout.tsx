import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Factura C: qué es, quién la emite y cómo hacerla',
  description: 'Guía simple y actualizada sobre la Factura C: quién debe emitirla, cuándo corresponde, qué datos necesitás y cómo generarla en ARCA.',
  alternates: { canonical: '/factura-c' },
  openGraph: {
    title: 'Factura C: guía simple y actualizada',
    description: 'Entendé cuándo corresponde y cómo emitir una Factura C electrónica en ARCA.',
    url: '/factura-c',
    type: 'article',
    locale: 'es_AR',
    siteName: 'Fácil Fiscal',
  },
  robots: { index: true, follow: true },
}

export default function FacturaCLayout({ children }: { children: React.ReactNode }) {
  return children
}
