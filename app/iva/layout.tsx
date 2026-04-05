import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculá tu IVA gratis",
  description:
    "Calculá cuánto IVA tenés que pagar en Argentina en segundos. Ingresá tus ventas y compras y obtené el resultado al instante. Gratis y sin registro.",

  keywords: [
    "calcular IVA argentina",
    "cuánto IVA tengo que pagar",
    "IVA AFIP argentina",
    "calculadora IVA online",
    "IVA débito crédito fiscal"
  ],

  openGraph: {
    title: "Calculá tu IVA gratis | FacilFiscal",
    description:
      "Calculá el IVA de tu negocio en segundos. Rápido, simple y gratis.",
    url: "/iva",
    siteName: "FacilFiscal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Calculá tu IVA gratis | FacilFiscal",
    description:
      "Calculá el IVA de tu negocio en segundos. Rápido, simple y gratis.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "/iva",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function IVALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}