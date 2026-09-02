import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de IVA 2026: cuánto pagar en Argentina",
  description:
    "Ingresá tus ventas y compras del mes y estimá cuánto IVA tenés que pagar. Calculadora simple, gratuita y actualizada para Argentina.",

  keywords: [
    "calcular IVA argentina",
    "cuánto IVA tengo que pagar",
    "IVA AFIP argentina",
    "calculadora IVA online",
    "IVA débito crédito fiscal"
  ],

  openGraph: {
    title: "Calculadora de IVA 2026: estimá cuánto pagar",
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
    title: "Calculadora de IVA 2026: estimá cuánto pagar",
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
