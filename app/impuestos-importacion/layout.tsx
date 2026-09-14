import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Importaciones 2026: Courier, Puerta a Puerta e impuestos",
  description:
    "Entendé de forma simple qué impuestos pueden corresponder al importar en Argentina por Courier, Correo Argentino o Régimen General. Reglas 2026 verificadas con ARCA.",

  keywords: [
    "importaciones argentina 2026",
    "courier argentina impuestos",
    "puerta a puerta argentina 2026",
    "franquicia 400 dolares argentina",
    "impuestos importacion argentina",
    "ARCA importaciones"
  ],

  openGraph: {
    title: "Importaciones 2026 — Courier, Puerta a Puerta e impuestos | FácilFiscal",
    description:
      "Descubrí qué régimen corresponde, qué impuestos pueden aparecer y cuándo necesitás consultar el arancel exacto del producto.",
    url: "https://www.facilfiscal.com.ar/impuestos-importacion",
    siteName: "FácilFiscal",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "es_AR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Importaciones 2026 | FácilFiscal",
    description: "Courier, Puerta a Puerta, franquicia de USD 400 y tributos explicados fácil.",
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
