import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IVA 2026: calculadora, saldo y vencimientos",
  description:
    "Calculá el IVA del mes y entendé de forma simple débito fiscal, crédito fiscal, retenciones, saldo a favor, IVA Simple y vencimientos por CUIT.",

  keywords: [
    "calcular IVA argentina",
    "cuánto IVA tengo que pagar",
    "IVA ARCA 2026",
    "IVA Simple",
    "débito fiscal crédito fiscal",
    "saldo a favor IVA",
    "vencimiento IVA CUIT"
  ],

  openGraph: {
    title: "IVA 2026: calculá cuánto pagar | Fácil Fiscal",
    description:
      "Ingresá tus ventas y compras, estimá el IVA y entendé qué cambia el resultado y cuándo vence.",
    url: "https://www.facilfiscal.com.ar/iva",
    siteName: "Fácil Fiscal",
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
    title: "IVA 2026: calculadora y vencimientos | Fácil Fiscal",
    description:
      "Calculá el IVA del mes y entendé retenciones, saldo a favor e IVA Simple.",
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
  children: React.ReactNode
}) {
  return children
}
