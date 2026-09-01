import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impuestos provinciales en Argentina — IIBB, Sellos y más por provincia",
  description:
    "Consultá los principales impuestos de cada provincia argentina: Ingresos Brutos (IIBB), Sellos, Inmobiliario y tasas municipales. Guía orientativa 2026.",

  keywords: [
    "impuestos provinciales argentina",
    "ingresos brutos por provincia",
    "alicuota IIBB argentina 2026",
    "impuesto de sellos provincia",
    "cuanto se paga de ingresos brutos",
    "impuestos municipales argentina",
    "provincia con mas impuestos argentina",
    "IIBB ARBA AGIP DGR",
    "cuantos impuestos se pagan en argentina",
    "impuesto ingresos brutos todas las provincias",
  ],

  openGraph: {
    title: "Impuestos por provincia en Argentina | FácilFiscal",
    description:
      "IIBB, Sellos, Inmobiliario y tasas municipales de las 24 jurisdicciones argentinas. Guía 2026.",
    url: "/impuestos-por-provincia",
    siteName: "FácilFiscal",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Impuestos por provincia en Argentina | FácilFiscal",
    description: "IIBB, Sellos e Inmobiliario de las 24 jurisdicciones. Guía orientativa 2026.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "/impuestos-por-provincia",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function ImpuestosPorProvinciaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
