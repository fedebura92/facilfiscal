import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculadora de Ganancias 2026: estimá cuánto pagás",
  description:
    "Ingresá cuánto ganás y respondé preguntas simples para estimar Ganancias 2026. Calculadora gratuita para personas en Argentina.",

  keywords: [
    "impuesto a las ganancias argentina",
    "calcular ganancias argentina",
    "cuanto pago de ganancias",
    "ganancias personas humanas argentina",
    "impuesto ganancias AFIP"
  ],

  openGraph: {
    title: "Calculadora de Ganancias 2026 simple y gratis",
    description:
      "Calculá cuánto pagás de Impuesto a las Ganancias en segundos.",
    url: "/impuesto-ganancias",
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
    title: "Calculadora de Ganancias 2026 simple y gratis",
    description:
      "Estimá tu Impuesto a las Ganancias de forma rápida y simple.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "/impuesto-ganancias",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function GananciasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
