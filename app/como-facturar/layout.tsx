import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cómo facturar siendo monotributista | FácilFiscal",
  description:
    "Aprendé paso a paso cómo emitir factura C en AFIP/ARCA. Guía simple para monotributistas en Argentina con ejemplos claros.",
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
    title: "Cómo facturar siendo monotributista | FácilFiscal",
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