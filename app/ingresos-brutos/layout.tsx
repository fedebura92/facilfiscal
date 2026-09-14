import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresos Brutos 2026: guía por provincia y régimen",
  description:
    "Entendé cómo funciona Ingresos Brutos según provincia, actividad y régimen. Fácil Fiscal evita usar alícuotas genéricas cuando no corresponden.",
  keywords: [
    "ingresos brutos argentina",
    "ingresos brutos por provincia",
    "alicuota ingresos brutos",
    "impuesto ingresos brutos provincias",
    "convenio multilateral"
  ],
  openGraph: {
    title: "Ingresos Brutos 2026 por provincia | Fácil Fiscal",
    description:
      "Orientación simple según jurisdicción y régimen, sin inventar una alícuota única para todos.",
    url: "/ingresos-brutos",
    siteName: "Fácil Fiscal",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ingresos Brutos 2026 por provincia | Fácil Fiscal",
    description:
      "Entendé qué régimen provincial puede corresponderte y de qué depende el cálculo.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "/ingresos-brutos" },
  robots: { index: true, follow: true },
};

export default function IngresosBrutosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
