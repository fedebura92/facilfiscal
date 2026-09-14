import type { Metadata } from "next";
import CalendarioFiscalClient from "./CalendarioFiscalClient";
import CalendarioFiscalGuide from "@/components/CalendarioFiscalGuide";
import StructuredData, { breadcrumbJsonLd, faqJsonLd } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: "Calendario Fiscal 2026: vencimientos ARCA por CUIT",
  description:
    "Consultá vencimientos ARCA 2026 de Monotributo, IVA, Autónomos y empleadores. Fechas por CUIT, estado de verificación y recordatorios.",
  keywords: [
    "calendario fiscal 2026 argentina",
    "vencimientos ARCA 2026",
    "vencimientos por CUIT",
    "vencimiento monotributo 2026",
    "vencimiento IVA 2026",
    "vencimiento autonomos 2026",
    "calendario impositivo argentina 2026",
  ],
  openGraph: {
    title: "Calendario Fiscal 2026 — Vencimientos ARCA por CUIT",
    description:
      "Filtrá por tu situación fiscal y distinguí fechas verificadas de fechas todavía orientativas.",
    url: "https://www.facilfiscal.com.ar/calendario-fiscal",
    siteName: "Fácil Fiscal",
    locale: "es_AR",
    type: "website",
  },
  alternates: {
    canonical: "https://www.facilfiscal.com.ar/calendario-fiscal",
  },
};

export default function CalendarioFiscalPage() {
  const faq = [
    { question: '¿Los vencimientos son iguales para todos los CUIT?', answer: 'No. Algunas obligaciones tienen una fecha única y otras se escalonan según la terminación de CUIT. El calendario muestra esa diferencia dentro de cada vencimiento.' },
    { question: '¿Qué significa que una fecha sea orientativa?', answer: 'Significa que todavía no se presenta como fecha definitiva. Puede basarse en el patrón habitual, pero feriados, días inhábiles o prórrogas pueden modificarla.' },
    { question: '¿ARCA puede prorrogar un vencimiento?', answer: 'Sí. Cuando existe una prórroga o fecha excepcional, Fácil Fiscal busca reflejar la fecha oficial vigente y no solamente la del calendario original.' },
  ];
  return <>
    <StructuredData data={[breadcrumbJsonLd([{name:'Inicio',url:'https://www.facilfiscal.com.ar'},{name:'Calendario Fiscal',url:'https://www.facilfiscal.com.ar/calendario-fiscal'}]),faqJsonLd(faq)]}/>
    <CalendarioFiscalClient />
    <CalendarioFiscalGuide />
  </>;
}
