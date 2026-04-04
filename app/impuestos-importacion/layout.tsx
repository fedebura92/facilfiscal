import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculá impuestos de importación",
  description:
    "Calculá cuánto tenés que pagar al importar productos en Argentina. Incluye aranceles, IVA, percepciones y costos totales de importación.",

  keywords: [
    "impuestos importacion argentina",
    "calcular impuestos importacion",
    "arancel importacion argentina",
    "cuanto pago al importar argentina",
    "aduana argentina impuestos"
  ],

  openGraph: {
    title: "Calculá impuestos de importación | FacilFiscal",
    description:
      "Calculá el costo total de importar productos en Argentina en segundos.",
    url: "/impuestos-importacion",
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
    title: "Calculá impuestos de importación | FacilFiscal",
    description:
      "Calculá cuánto pagás al importar productos en Argentina.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "/impuestos-importacion",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ImportacionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}