import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cómo hacer una factura electrónica en ARCA paso a paso",
  description:
    "Guía 2026, simple y paso a paso, para emitir una Factura C electrónica en ARCA si sos monotributista. Con enlaces oficiales.",
  keywords: [
    "como facturar monotributo",
    "factura C AFIP",
    "como hacer factura electronica argentina",
    "facturacion ARCA",
  ],
  alternates: {
    canonical: "/como-facturar",
  },
  openGraph: {
    title: "Cómo hacer una factura electrónica en ARCA",
    description:
      "Guía paso a paso para emitir factura C en AFIP/ARCA.",
    url: "https://www.facilfiscal.com.ar/como-facturar",
  },
};

export default function ComoFacturarLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
