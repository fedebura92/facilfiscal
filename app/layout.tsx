import type { Metadata } from 'next'
import './globals.css'
import { FiscalDataProvider } from '@/components/FiscalDataProvider'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.facilfiscal.com.ar'),

  title: {
    default: 'Monotributo 2026: categorías, cuotas y vencimientos | Fácil Fiscal',
    template: '%s | Fácil Fiscal',
  },

  description:
    'Calculá tu categoría y cuota de Monotributo 2026, consultá vencimientos y aprendé a facturar. Información fiscal argentina explicada fácil.',

  keywords: [
    'monotributo argentina',
    'categorias monotributo 2026',
    'como facturar monotributo',
    'vencimientos AFIP',
    'ARCA Argentina',
    'factura C',
    'recategorizacion monotributo',
    'crear negocio argentina',
    'administrar impuestos negocio',
    'obligaciones fiscales argentina',
  ],

  authors: [{ name: 'Fácil Fiscal' }],

  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.facilfiscal.com.ar',
    siteName: 'Fácil Fiscal',

    title: 'Monotributo 2026: categorías, cuotas y vencimientos',
    description:
      'Calculá tu categoría y cuota, consultá vencimientos y entendé el Monotributo con explicaciones simples.',

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
    title: 'Monotributo 2026: categorías, cuotas y vencimientos',
    description:
      'Calculá tu categoría y cuota, consultá vencimientos y entendé el Monotributo con explicaciones simples.',
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
      <body>
        <StructuredData data={[
          {
            '@context':'https://schema.org', '@type':'Organization',
            name:'Fácil Fiscal', url:'https://www.facilfiscal.com.ar',
            logo:'https://www.facilfiscal.com.ar/icon.png',
          },
          {
            '@context':'https://schema.org', '@type':'WebSite',
            name:'Fácil Fiscal', url:'https://www.facilfiscal.com.ar',
            inLanguage:'es-AR',
          },
        ]} />
        <FiscalDataProvider>{children}</FiscalDataProvider>
      </body>
    </html>
  )
}
