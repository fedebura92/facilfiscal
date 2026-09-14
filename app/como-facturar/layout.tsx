import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cómo hacer una factura electrónica en ARCA paso a paso",
  description:
    "Guía 2026, simple y paso a paso, para emitir comprobantes electrónicos en ARCA, con foco en Factura C para monotributistas y reglas del Régimen General.",
  keywords: [
    "como facturar monotributo",
    "factura C ARCA",
    "como hacer factura electronica argentina",
    "facturacion ARCA",
  ],
  alternates: {
    canonical: "/como-facturar",
  },
  openGraph: {
    title: "Cómo hacer una factura electrónica en ARCA",
    description:
      "Guía 2026 paso a paso para emitir comprobantes electrónicos en ARCA.",
    url: "https://www.facilfiscal.com.ar/como-facturar",
    siteName: "Fácil Fiscal",
    locale: "es_AR",
    type: "article",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo hacer una factura electrónica en ARCA",
    description: "Guía 2026 paso a paso para emitir comprobantes electrónicos en ARCA.",
    images: ["/og-image.png"],
  },
};

export default function ComoFacturarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
