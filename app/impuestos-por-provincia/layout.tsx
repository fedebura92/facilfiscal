import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculá Ingresos Brutos",
  description:
    "Calculá cuánto tenés que pagar de Ingresos Brutos en Argentina según tu actividad y provincia. Simple, rápido y sin errores.",

  keywords: [
    "ingresos brutos argentina",
    "calcular ingresos brutos",
    "alicuota ingresos brutos",
    "impuesto ingresos brutos provincias",
    "cuánto pagar ingresos brutos"
  ],

  openGraph: {
    title: "Calculá Ingresos Brutos | FacilFiscal",
    description:
      "Calculá fácilmente cuánto pagar de Ingresos Brutos según tu actividad y provincia.",
    url: "/ingresos-brutos",
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
    title: "Calculá Ingresos Brutos | FacilFiscal",
    description:
      "Calculá cuánto pagar de Ingresos Brutos en segundos.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "/ingresos-brutos",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function IngresosBrutosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}