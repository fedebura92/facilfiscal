import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Fácil Fiscal — Vencimientos AFIP/ARCA Argentina',
    template: '%s | Fácil Fiscal',
  },
  description: 'Consultá vencimientos de monotributo, IVA y autónomos en Argentina. Calculadora, guías y alertas por email. Actualizado 2026.',
  keywords: ['vencimientos AFIP', 'monotributo 2026', 'vencimiento IVA', 'ARCA Argentina', 'calendario fiscal'],
  authors: [{ name: 'Fácil Fiscal' }],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://facilfiscal.com.ar',
    siteName: 'Fácil Fiscal',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
