import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculá Impuesto a las Ganancias",
  description:
    "Calculá cuánto tenés que pagar de Impuesto a las Ganancias en Argentina. Estimá tu impuesto de forma simple y evitá errores con AFIP.",

  keywords: [
    "impuesto a las ganancias argentina",
    "calcular ganancias argentina",
    "cuanto pago de ganancias",
    "ganancias personas humanas argentina",
    "impuesto ganancias AFIP"
  ],

  openGraph: {
    title: "Calculá Impuesto a las Ganancias | FacilFiscal",
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
    title: "Calculá Impuesto a las Ganancias | FacilFiscal",
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