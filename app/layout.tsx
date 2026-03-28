import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'FacilFiscal — Monotributo fácil en Argentina',
    template: '%s | FacilFiscal',
  },
  description: 'Calculá tu categoría de monotributo, aprendé a facturar correctamente y evitá errores con AFIP. Recordatorios automáticos de vencimientos.',
  keywords: ['monotributo argentina', 'categorias monotributo 2026', 'como facturar monotributo', 'vencimientos AFIP', 'ARCA Argentina', 'factura C', 'recategorizacion monotributo'],
  authors: [{ name: 'FacilFiscal' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://facilfiscal.com.ar',
    siteName: 'FacilFiscal',
    title: 'FacilFiscal — Monotributo fácil en Argentina',
    description: 'Calculá tu categoría, aprendé a facturar y recibí alertas automáticas de vencimientos.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://facilfiscal.com.ar'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
