import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impuestos provinciales en Argentina — IIBB, Sellos y más por provincia",
  description:
    "Consultá los impuestos de cada provincia argentina: Ingresos Brutos (IIBB), Impuesto de Sellos, Inmobiliario y Tasas Municipales. Las 24 jurisdicciones actualizadas 2025.",

  keywords: [
    "impuestos provinciales argentina",
    "ingresos brutos por provincia",
    "alicuota IIBB argentina 2025",
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
      "IIBB, Sellos, Inmobiliario y Tasas Municipales de las 24 jurisdicciones argentinas. Datos actualizados 2025.",
    url: "/impuestos-por-provincia",
    siteName: "FácilFiscal",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Impuestos por provincia en Argentina | FácilFiscal",
    description: "IIBB, Sellos, Inmobiliario de las 24 jurisdicciones. Datos actualizados 2025.",
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
