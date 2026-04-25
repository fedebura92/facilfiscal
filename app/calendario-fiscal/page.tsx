import type { Metadata } from "next";
import CalendarioFiscalClient from "./CalendarioFiscalClient";

export const metadata: Metadata = {
  title: "Calendario Fiscal 2026 Argentina | Vencimientos AFIP ARCA - Fácil Fiscal",
  description:
    "Calendario completo de vencimientos impositivos 2026 para monotributistas, responsables inscriptos y autónomos en Argentina. IVA, cargas sociales, recategorización y más.",
  keywords: [
    "calendario fiscal 2026 argentina",
    "vencimientos afip 2026",
    "vencimientos arca 2026",
    "fechas vencimiento monotributo 2026",
    "vencimiento iva 2026",
    "vencimientos impositivos argentina",
    "recategorización monotributo 2026",
    "calendario impositivo argentina 2026",
  ],
  openGraph: {
    title: "Calendario Fiscal 2026 — Todos los vencimientos AFIP/ARCA",
    description:
      "Vencimientos de monotributo, IVA, autónomos, cargas sociales y más. Filtrá por tu situación impositiva.",
    url: "https://facilfiscal.com.ar/calendario-fiscal",
    siteName: "Fácil Fiscal",
    locale: "es_AR",
    type: "website",
  },
  alternates: {
    canonical: "https://facilfiscal.com.ar/calendario-fiscal",
  },
};

export default function CalendarioFiscalPage() {
  return <CalendarioFiscalClient />;
}
