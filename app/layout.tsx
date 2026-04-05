import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.facilfiscal.com.ar'),

  alternates: {
    canonical: '/',
  },

  title: {
    default: 'FacilFiscal — Monotributo fácil en Argentina',
    template: '%s | FacilFiscal',
  },

  description:
    'Calculá tu categoría de monotributo, aprendé a facturar correctamente y evitá errores con AFIP. Recordatorios automáticos de vencimientos.',

  keywords: [
    'monotributo argentina',
    'categorias monotributo 2026',
    'como facturar monotributo',
    'vencimientos AFIP',
    'ARCA Argentina',
    'factura C',
    'recategorizacion monotributo',
  ],

  authors: [{ name: 'FacilFiscal' }],

  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.facilfiscal.com.ar',
    siteName: 'FacilFiscal',

    title: 'FacilFiscal — Monotributo fácil en Argentina',
    description:
      'Calculá tu categoría, aprendé a facturar y recibí alertas automáticas de vencimientos.',

    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'FacilFiscal — Monotributo fácil en Argentina',
    description:
      'Calculá tu categoría, aprendé a facturar y recibí alertas automáticas de vencimientos.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}