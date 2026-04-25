import type { Metadata } from "next";
import CalendarioFiscalClient from "./CalendarioFiscalClient";

export const metadata: Metadata = {
  title: "Calendario Fiscal 2025 Argentina | Vencimientos AFIP - Fácil Fiscal",
  description:
    "Calendario completo de vencimientos impositivos 2025 para monotributistas, responsables inscriptos y autónomos en Argentina. IVA, cargas sociales, recategorización y más.",
  keywords: [
    "calendario fiscal 2025 argentina",
    "vencimientos afip 2025",
    "fechas vencimiento monotributo 2025",
    "vencimiento iva 2025",
    "vencimientos impositivos argentina",
    "recategorización monotributo 2025",
    "calendario impositivo argentina",
    "fechas afip 2025",
  ],
  openGraph: {
    title: "Calendario Fiscal 2025 — Todos los vencimientos AFIP",
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
