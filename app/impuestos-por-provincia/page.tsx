"use client";

import SiteHeader from '@/components/SiteHeader'
import AIConsulta from '@/components/AIConsulta'
import { useState } from "react";
import Link from "next/link";

// Datos actualizados julio 2025 — fuentes: BCRA/ADEBA, códigos fiscales provinciales
const PROVINCIAS_DATA: Record<string, {
  nombre: string;
  organo: string;
  sitio: string;
  color: string;
  iibb: { alicuota: number; descripcion: string };
  sellos: { alicuota: number; descripcion: string };
  inmobiliario: { descripcion: string };
  automotor: { descripcion: string };
  tasaMunicipal: { rango: string; descripcion: string };
  municipios: string[];
  vencimientoIIBB: string;
  exenciones: string;
}> = {
  buenos_aires: {
    nombre: "Buenos Aires",
    organo: "ARBA",
    sitio: "https://www.arba.gov.ar",
    color: "#1d4ed8",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general comercio y servicios. Actividad financiera: 9%. Industria manufacturera tiene beneficios. Se usa nomenclador NAIIB-18." },
    sellos: { alicuota: 2.0, descripcion: "Compraventa inmuebles: 2%. Exención para primera vivienda única hasta monto establecido anualmente. Tarjetas de crédito: 1,2%." },
    inmobiliario: { descripcion: "Proporcional al avalúo fiscal. Anual en cuotas. Coeficiente corrector 2026: 24,8370 planta urbana." },
    automotor: { descripcion: "Según valuación DNRPA. Aproximadamente 1% a 3% anual según modelo y año." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de Seguridad e Higiene sobre ingresos brutos. Varía por municipio." },
    municipios: ["La Plata", "Mar del Plata", "Quilmes", "Lanús", "Lomas de Zamora", "Tigre", "Bahía Blanca", "San Isidro"],
    vencimientoIIBB: "Mensual — días 10 al 25 según terminación de CUIT",
    exenciones: "Actividades primarias, educación, culto religioso, ciertas actividades industriales. Primera vivienda exenta de sellos.",
  },
  caba: {
    nombre: "CABA",
    organo: "AGIP",
    sitio: "https://www.agip.gob.ar",
    color: "#dc2626",
    iibb: { alicuota: 3.0, descripcion: "Alícuota general. Actividad financiera: 8%. Varía según código de actividad (1,5% a 5%). Bonificación hasta 10% por débito automático." },
    sellos: { alicuota: 2.7, descripcion: "Reducido a 2,7% en 2026 para transferencias de dominio (antes 3,5%). Exención para primera vivienda única y permanente hasta $226.100.000." },
    inmobiliario: { descripcion: "ABL (Alumbrado, Barrido y Limpieza) — bimestral según valuación fiscal AGIP." },
    automotor: { descripcion: "Patentes porteñas — según modelo, año y valuación fiscal AGIP." },
    tasaMunicipal: { rango: "N/A", descripcion: "En CABA el IIBB y tasas las gestiona AGIP. No hay municipios separados." },
    municipios: ["Ciudad Autónoma de Buenos Aires (jurisdicción única)"],
    vencimientoIIBB: "Mensual — días 10 al 20 según actividad y CUIT",
    exenciones: "Actividades culturales, educación, salud, exportaciones de servicios. Primera vivienda exenta de Sellos hasta ~USD 170.000.",
  },
  catamarca: {
    nombre: "Catamarca",
    organo: "DGR Catamarca",
    sitio: "https://www.catamarca.gov.ar/dgr",
    color: "#1e3a8a",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9%. Minería con tratamiento especial. Convenio COT con ARBA." },
    sellos: { alicuota: 1.0, descripcion: "Sobre instrumentos públicos y privados celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Contribución de habilitación. Varía por municipio." },
    municipios: ["San Fernando del Valle de Catamarca", "Andalgalá", "Belén", "Santa María", "Tinogasta"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Minería, actividades agropecuarias, artesanías regionales.",
  },
  chaco: {
    nombre: "Chaco",
    organo: "ATER Chaco",
    sitio: "https://www.ater.gov.ar",
    color: "#78350f",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 7,7%. Actividad agropecuaria con beneficios." },
    sellos: { alicuota: 1.5, descripcion: "Sobre instrumentos públicos y privados. Tarjetas de crédito: 1,5%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de comercio e industria. Varía por municipio." },
    municipios: ["Resistencia", "Barranqueras", "Fontana", "Presidencia Roque Sáenz Peña", "Villa Ángela"],
    vencimientoIIBB: "Mensual — según calendario ATER",
    exenciones: "Algodón, producción agropecuaria, actividades forestales.",
  },
  chubut: {
    nombre: "Chubut",
    organo: "DGR Chubut",
    sitio: "https://www.dgr.chubut.gov.ar",
    color: "#0f4c81",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9%. Pesca y petróleo con alícuotas especiales." },
    sellos: { alicuota: 1.2, descripcion: "Sobre instrumentos públicos y privados. Tarjetas de crédito: 1,2%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa comercial e industrial. Varía por municipio." },
    municipios: ["Rawson", "Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Esquel"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Pesca artesanal e industrial, petróleo, turismo patagónico.",
  },
  cordoba: {
    nombre: "Córdoba",
    organo: "DGR Córdoba",
    sitio: "https://www.dgr.cba.gov.ar",
    color: "#16a34a",
    iibb: { alicuota: 4.0, descripcion: "Alícuota general comercio y servicios. Actividad financiera: 9%. Industria manufacturera: 1,5%. Agropecuario: alícuota reducida." },
    sellos: { alicuota: 1.5, descripcion: "Tasa general sobre instrumentos públicos y privados otorgados en Córdoba." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — según valuación fiscal provincial. Coeficiente actualizado anualmente." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA. Anual en cuotas." },
    tasaMunicipal: { rango: "0,5% — 2%", descripcion: "Tasa de comercio e industria. Varía significativamente por municipio." },
    municipios: ["Córdoba capital", "Villa María", "Río Cuarto", "San Francisco", "Bell Ville", "Villa Carlos Paz"],
    vencimientoIIBB: "Mensual — días 12 al 16 según terminación de CUIT",
    exenciones: "Industria manufacturera con alícuota reducida al 1,5%. Actividades agropecuarias con beneficios específicos.",
  },
  corrientes: {
    nombre: "Corrientes",
    organo: "DGR Corrientes",
    sitio: "https://www.dgrcorrientes.gov.ar",
    color: "#0284c7",
    iibb: { alicuota: 3.0, descripcion: "Una de las alícuotas generales más bajas. Actividad financiera: 4,7% — la más baja del país. Actividad arrocera y citrícola con beneficios." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos. Actividades agropecuarias pueden tener exenciones." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Contribución de habilitación. Varía por municipio." },
    municipios: ["Corrientes capital", "Goya", "Curuzú Cuatiá", "Mercedes", "Santo Tomé"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Agricultura (arroz, tabaco, citrus), ganadería, actividades pesqueras.",
  },
  entre_rios: {
    nombre: "Entre Ríos",
    organo: "ATER Entre Ríos",
    sitio: "https://www.ater.gob.ar",
    color: "#15803d",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9%. Avicultura y citricultura con beneficios especiales." },
    sellos: { alicuota: 1.0, descripcion: "Sobre instrumentos públicos y privados con efectos en la provincia. Tarjetas de crédito: 1%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa comercial e industrial. Varía por municipio." },
    municipios: ["Paraná", "Concordia", "Gualeguaychú", "Colón", "Villaguay"],
    vencimientoIIBB: "Mensual — según calendario ATER",
    exenciones: "Avicultura, citricultura, actividades agropecuarias con régimen especial.",
  },
  formosa: {
    nombre: "Formosa",
    organo: "DGR Formosa",
    sitio: "https://www.formosa.gov.ar/dgr",
    color: "#065f46",
    iibb: { alicuota: 3.0, descripcion: "Alícuota general. Actividad financiera: 5,5%. Actividades fronterizas con Paraguay con tratamiento especial." },
    sellos: { alicuota: 0.3, descripcion: "Sobre instrumentos. Tarjetas de crédito: 0,3%. Una de las más bajas del país." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1%", descripcion: "Tasa de habilitación. Varía por municipio." },
    municipios: ["Formosa capital", "Clorinda", "El Colorado", "Pirané", "Ingeniero Juárez"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Actividades fronterizas, agropecuarias, artesanías indígenas.",
  },
  jujuy: {
    nombre: "Jujuy",
    organo: "DPR Jujuy",
    sitio: "https://www.rentasjujuy.gov.ar",
    color: "#065f46",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 8%. Minería con tratamiento especial." },
    sellos: { alicuota: 0.1, descripcion: "Una de las alícuotas más bajas del país para tarjetas de crédito. Alícuota general sobre instrumentos varía por tipo de acto." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal provincial." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación comercial. Varía por municipio." },
    municipios: ["San Salvador de Jujuy", "Palpalá", "San Pedro", "Libertador General San Martín", "Perico"],
    vencimientoIIBB: "Mensual — según calendario DPR",
    exenciones: "Minería, actividades agrícolas regionales, artesanías.",
  },
  la_pampa: {
    nombre: "La Pampa",
    organo: "DGR La Pampa",
    sitio: "https://www.lapampa.gov.ar/dgr",
    color: "#c2410c",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9,1% — la más alta del país (BCRA/ADEBA, julio 2025). El Banco Nación amenazó con cerrar sucursales ante un incremento al 15% que fue revertido." },
    sellos: { alicuota: 1.0, descripcion: "Sobre instrumentos públicos y privados celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación comercial. Varía por municipio." },
    municipios: ["Santa Rosa", "General Pico", "Toay", "Eduardo Castex", "Realicó"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Actividades agropecuarias, ganadería extensiva.",
  },
  la_rioja: {
    nombre: "La Rioja",
    organo: "DGRIP La Rioja",
    sitio: "https://www.larioja.gov.ar/dgrip",
    color: "#be123c",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9%. Grava créditos hipotecarios. Minería con tratamiento especial." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos. Tarjetas de crédito: 1%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de comercio. Varía por municipio." },
    municipios: ["La Rioja capital", "Chilecito", "Aimogasta", "Chamical", "Chepes"],
    vencimientoIIBB: "Mensual — según calendario DGRIP",
    exenciones: "Minería, vitivinicultura, actividades agropecuarias con beneficios.",
  },
  mendoza: {
    nombre: "Mendoza",
    organo: "ATM Mendoza",
    sitio: "https://atm.mendoza.gov.ar",
    color: "#b45309",
    iibb: { alicuota: 3.5, descripcion: "General. Actividad financiera: 7%. Vitivinicultura con beneficios especiales. Turismo: 3%." },
    sellos: { alicuota: 1.2, descripcion: "Sobre instrumentos públicos y privados con efectos en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de Inspección de Seguridad e Higiene. Varía por municipio." },
    municipios: ["Mendoza capital", "San Rafael", "Maipú", "Luján de Cuyo", "Guaymallén", "Godoy Cruz"],
    vencimientoIIBB: "Mensual — días 10 al 20",
    exenciones: "Vitivinicultura con beneficios especiales. Turismo en ciertos municipios.",
  },
  misiones: {
    nombre: "Misiones",
    organo: "DGR Misiones",
    sitio: "https://www.dgrmisiones.gov.ar",
    color: "#166534",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 7,8%. Grava títulos públicos. Actividad forestal con beneficios." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación e inspección. Varía por municipio." },
    municipios: ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú", "Apóstoles"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Actividad forestal, yerbatera, tealera. Turismo en ciertas zonas.",
  },
  neuquen: {
    nombre: "Neuquén",
    organo: "DPR Neuquén",
    sitio: "https://www.dpr.neuquen.gov.ar",
    color: "#0369a1",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9%. Hidrocarburos con alícuotas especiales. Vaca Muerta con régimen particular." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa comercial. Varía significativamente por municipio." },
    municipios: ["Neuquén capital", "Cipolletti", "Cutral Có", "Plaza Huincul", "Zapala", "San Martín de los Andes"],
    vencimientoIIBB: "Mensual — según calendario DPR",
    exenciones: "Hidrocarburos con régimen especial. Turismo de aventura con beneficios.",
  },
  rio_negro: {
    nombre: "Río Negro",
    organo: "ATR Río Negro",
    sitio: "https://www.atr.rionegro.gov.ar",
    color: "#0c4a6e",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 9%. Fruticultura con beneficios. Turismo con alícuota diferencial." },
    sellos: { alicuota: 1.0, descripcion: "Sobre instrumentos públicos y privados." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación comercial. Varía por municipio." },
    municipios: ["Viedma", "Bariloche", "Cipolletti", "General Roca", "El Bolsón", "Allen"],
    vencimientoIIBB: "Mensual — según calendario ATR",
    exenciones: "Fruticultura, actividades turísticas en patagonia, pesca artesanal.",
  },
  salta: {
    nombre: "Salta",
    organo: "DGR Salta",
    sitio: "https://www.dgrsalta.gov.ar",
    color: "#9f1239",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 8%. Grava títulos públicos. Actividades turísticas con beneficios." },
    sellos: { alicuota: 1.0, descripcion: "Sobre instrumentos públicos y privados celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Contribución de Comercio e Industria. Varía por municipio." },
    municipios: ["Salta capital", "San Ramón de la Nueva Orán", "Tartagal", "Cafayate", "Rosario de la Frontera"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Actividades turísticas, artesanías regionales, ciertas agroindustrias.",
  },
  san_juan: {
    nombre: "San Juan",
    organo: "DGR San Juan",
    sitio: "https://www.sanjuan.gov.ar/dgr",
    color: "#a16207",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 7,8%. Vitivinicultura y minería con tratamiento especial." },
    sellos: { alicuota: 0.56, descripcion: "Tarjetas de crédito: 0,56%. Alícuota general sobre instrumentos varía por tipo de acto." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de comercio e industria. Varía por departamento." },
    municipios: ["San Juan capital", "Rawson", "Rivadavia", "Pocito", "Santa Lucía"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Vitivinicultura, minería, actividades agrícolas regionales.",
  },
  san_luis: {
    nombre: "San Luis",
    organo: "DGR San Luis",
    sitio: "https://www.sanluis.gov.ar/dgr",
    color: "#7e22ce",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 6,5% sobre el spread (base reducida). Una de las más favorables para el sector financiero." },
    sellos: { alicuota: 1.2, descripcion: "Sobre instrumentos públicos y privados. Tarjetas de crédito: 1,2%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación comercial. Varía por municipio." },
    municipios: ["San Luis capital", "Villa Mercedes", "Merlo", "Villa Dolores", "Justo Daract"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Zona franca industrial. Actividades industriales con beneficios especiales.",
  },
  santa_cruz: {
    nombre: "Santa Cruz",
    organo: "SAT Santa Cruz",
    sitio: "https://www.santacruz.gob.ar/sat",
    color: "#1e40af",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 8%. Grava créditos hipotecarios. Petróleo con régimen especial." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación. Varía por municipio." },
    municipios: ["Río Gallegos", "Caleta Olivia", "Pico Truncado", "Puerto Deseado", "El Calafate"],
    vencimientoIIBB: "Mensual — según calendario SAT",
    exenciones: "Petróleo, pesca, turismo patagónico (El Calafate).",
  },
  santa_fe: {
    nombre: "Santa Fe",
    organo: "API Santa Fe",
    sitio: "https://www.santafe.gov.ar/api",
    color: "#7c3aed",
    iibb: { alicuota: 3.5, descripcion: "Tasa general. Actividad financiera: 9% (elevada en 2025 desde 5%). Construcción: 4%. Grava títulos públicos e hipotecarios." },
    sellos: { alicuota: 1.0, descripcion: "Tasa general sobre instrumentos. Compraventa de inmuebles: 2,5%. Tarjetas de crédito: 0,1%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal provincial." },
    automotor: { descripcion: "Impuesto a los Automotores — liquidado por CUIT del titular." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa General de Servicios sobre IIBB. Varía por municipio." },
    municipios: ["Rosario", "Santa Fe capital", "Rafaela", "Venado Tuerto", "Reconquista", "Villa Gobernador Gálvez"],
    vencimientoIIBB: "Mensual — días 10 al 20 según terminación de CUIT",
    exenciones: "Exportaciones, actividades culturales, ciertas agroindustrias.",
  },
  santiago_del_estero: {
    nombre: "Santiago del Estero",
    organo: "DGR Santiago",
    sitio: "https://www.dgrsantiago.gov.ar",
    color: "#92400e",
    iibb: { alicuota: 3.5, descripcion: "Alícuota general. Actividad financiera: 3% sobre el spread (base reducida). Una de las cargas más bajas para el sector financiero del país." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos celebrados en la provincia." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa de habilitación comercial. Varía por municipio." },
    municipios: ["Santiago del Estero capital", "La Banda", "Termas de Río Hondo", "Frías", "Añatuya"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Algodón, producción agropecuaria, actividades de subsistencia.",
  },
  tierra_del_fuego: {
    nombre: "Tierra del Fuego",
    organo: "DGR Tierra del Fuego",
    sitio: "https://www.tierradelfuego.gov.ar/dgr",
    color: "#1d4ed8",
    iibb: { alicuota: 3.0, descripcion: "Alícuota general. Actividad financiera: 9%. Industria electrónica de Ushuaia con régimen especial de exención (Zona Franca)." },
    sellos: { alicuota: 0.6, descripcion: "Sobre instrumentos. Tarjetas de crédito: 0,6%. Compraventa de inmuebles varía." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 1,5%", descripcion: "Tasa municipal. Varía por municipio." },
    municipios: ["Ushuaia", "Río Grande", "Tolhuin"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Industria electrónica (Zona Franca Ushuaia), turismo.",
  },
  tucuman: {
    nombre: "Tucumán",
    organo: "DGR Tucumán",
    sitio: "https://www.dgr.tucuman.gov.ar",
    color: "#0f766e",
    iibb: { alicuota: 4.0, descripcion: "Tasa general. Actividad financiera: 9%. Grava títulos públicos. Industria azucarera: 2%." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos. Tarjetas de crédito: 1%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — anual en cuotas según valuación." },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA." },
    tasaMunicipal: { rango: "0,5% — 2%", descripcion: "Tasa de comercio e industria. Varía por municipio." },
    municipios: ["San Miguel de Tucumán", "Tafí Viejo", "Banda del Río Salí", "Yerba Buena", "Concepción"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Agroindustria azucarera. Ciertas PyMEs industriales.",
  },
};

const PROVINCIAS_ORDENADAS = Object.entries(PROVINCIAS_DATA).sort((a, b) => a[1].nombre.localeCompare(b[1].nombre));

const FAQ = [
  {
    q: "¿Cuántos impuestos provinciales hay en Argentina?",
    a: "Cada una de las 24 jurisdicciones (23 provincias + CABA) tiene su propio sistema tributario. Los impuestos provinciales más comunes son: Ingresos Brutos (IIBB), Impuesto de Sellos, Impuesto Inmobiliario, Impuesto a los Automotores y Tasas Municipales. Además existen impuestos específicos como el de Transmisión Gratuita de Bienes en Buenos Aires."
  },
  {
    q: "¿Cuál es la provincia con más impuestos en Argentina?",
    a: "Depende del sector. Para actividad financiera, La Pampa lidera con 9,1% de IIBB (datos BCRA/ADEBA, julio 2025), seguida por Buenos Aires, Catamarca, Córdoba, Chubut, Entre Ríos, La Rioja, Neuquén, Río Negro, Santa Fe, Tierra del Fuego y Tucumán con 9%. En cambio, Corrientes (4,7%) y Formosa (5,5%) son las más bajas para ese sector."
  },
  {
    q: "¿Qué impuestos se pagan en cada provincia de Argentina?",
    a: "En todas las provincias se pagan: Ingresos Brutos (IIBB) sobre la actividad comercial, Impuesto de Sellos en contratos, Impuesto Inmobiliario sobre propiedades, Impuesto a los Automotores y Tasas Municipales según el municipio. Las alícuotas varían mucho: el IIBB general va del 3% al 4,5% según la provincia y la actividad."
  },
  {
    q: "¿Qué es el Impuesto sobre los Ingresos Brutos (IIBB)?",
    a: "Es el principal impuesto provincial en Argentina. Grava el ejercicio habitual de la actividad económica con carácter oneroso (comercio, servicios, industria). Lo recauda cada provincia y CABA a través de sus organismos fiscales (ARBA, AGIP, DGR, ATM, etc.). La alícuota varía según la actividad y la provincia, generalmente entre 1,5% y 9%."
  },
  {
    q: "¿Cómo se actualiza la información de impuestos provinciales?",
    a: "Las alícuotas se actualizan anualmente mediante las Leyes Impositivas provinciales, generalmente en diciembre para el año siguiente. También pueden modificarse durante el año. Las fuentes oficiales son los organismos fiscales provinciales (ARBA, AGIP, DGR de cada provincia) y ARCA a nivel nacional."
  },
  {
    q: "¿Qué es el Convenio Multilateral en IIBB?",
    a: "Si desarrollás actividad en más de una provincia, debés distribuir la base imponible de IIBB entre ellas según el Convenio Multilateral. La Comisión Arbitral (COMARB) establece los coeficientes de distribución. En ese caso, pagás IIBB en cada provincia donde tenés actividad, con alícuotas y organismos diferentes."
  },
  {
    q: "¿Los monotributistas pagan Ingresos Brutos?",
    a: "Sí, en la mayoría de las provincias los monotributistas también pagan IIBB. El monotributo nacional no reemplaza al IIBB provincial. Algunas provincias tienen exenciones o regímenes simplificados para pequeños contribuyentes, pero depende de cada jurisdicción. Es importante consultarlo con el organismo fiscal de tu provincia."
  },
  {
    q: "¿Qué es el Impuesto de Sellos?",
    a: "Es un tributo provincial que grava los actos, contratos y operaciones de carácter oneroso: compraventa de inmuebles, alquileres, hipotecas, prendas, etc. Se paga al momento de firmar el instrumento. Las alícuotas varían por provincia y tipo de acto. En operaciones inmobiliarias suele dividirse entre comprador y vendedor."
  },
];

export default function ImpuestosPorProvinciaPage() {
  const [provinciaKey, setProvinciaKey] = useState<string>("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const prov = provinciaKey ? PROVINCIAS_DATA[provinciaKey] : null;

  const rankingFinanciero = [...PROVINCIAS_ORDENADAS].sort((a, b) => b[1].iibb.alicuota - a[1].iibb.alicuota);

  return (
    <>
      <SiteHeader currentPath="/impuestos-por-provincia" />
      <div className="ff-page-content">
      <main style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #374151 0%, #111827 100%)",
        color: "#fff", padding: "64px 24px 48px", textAlign: "center"
      }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          🗺️ 24 jurisdicciones · IIBB · Sellos · Municipios
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          Impuestos provinciales en Argentina<br />por jurisdicción
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: "0 auto 28px" }}>
          Consultá los impuestos de cada provincia: Ingresos Brutos, Sellos, Inmobiliario, Automotor y Tasas Municipales. Datos actualizados según organismos fiscales y ARCA.
        </p>
        <a href="#selector" style={{
          background: "#fbbf24", color: "#1c1917", fontWeight: 700,
          padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 16, display: "inline-block",
        }}>
          Ver impuestos de mi provincia ↓
        </a>
      </section>

      {/* ASISTENTE IA */}
      <section style={{ background: "#f1f5f9", padding: "32px 24px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <AIConsulta placeholder="¿Cuánto pago de IIBB en Córdoba si facturé $5.000.000?" />
        </div>
      </section>

      {/* SELECTOR */}
      <section id="selector" style={{ padding: "40px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
            Seleccioná tu provincia
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
            Alícuotas actualizadas según Leyes Impositivas provinciales vigentes. Fuentes: ARBA, AGIP, DGR provinciales, BCRA/ADEBA (julio 2025). Para decisiones fiscales, consultá con un contador.
          </p>
          <select
            value={provinciaKey}
            onChange={e => setProvinciaKey(e.target.value)}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10,
              border: "2px solid #e5e7eb", fontSize: 16, fontWeight: 700,
              fontFamily: "Nunito, sans-serif", color: "#111827",
              background: "#fff", cursor: "pointer", marginBottom: 24,
            }}
          >
            <option value="">— Elegí una provincia —</option>
            {PROVINCIAS_ORDENADAS.map(([key, p]) => (
              <option key={key} value={key}>{p.nombre}</option>
            ))}
          </select>

          {prov && (
            <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
              <div style={{ background: prov.color, padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22 }}>{prov.nombre}</div>
                  <div style={{ opacity: 0.85, fontSize: 14 }}>Organismo: {prov.organo}</div>
                </div>
                <a href={prov.sitio} target="_blank" rel="noopener noreferrer"
                  style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                  Ir a {prov.organo} →
                </a>
              </div>

              <div style={{ background: "#fff" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {[
                    { emoji: "📊", titulo: "Ingresos Brutos (IIBB)", alicuota: `${prov.iibb.alicuota}% general`, desc: prov.iibb.descripcion, venc: prov.vencimientoIIBB },
                    { emoji: "📜", titulo: "Impuesto de Sellos", alicuota: `${prov.sellos.alicuota}% general`, desc: prov.sellos.descripcion, venc: "Al momento de firmar el instrumento" },
                    { emoji: "🏠", titulo: "Impuesto Inmobiliario", alicuota: "Variable", desc: prov.inmobiliario.descripcion, venc: "Anual en cuotas (generalmente)" },
                    { emoji: "🚗", titulo: "Impuesto Automotor", alicuota: "Variable", desc: prov.automotor.descripcion, venc: "Anual en cuotas" },
                    { emoji: "🏛️", titulo: "Tasas Municipales", alicuota: prov.tasaMunicipal.rango, desc: prov.tasaMunicipal.descripcion, venc: "Mensual (varía por municipio)" },
                  ].map((imp, i) => (
                    <div key={imp.titulo} style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", borderRight: i % 2 === 0 ? "1px solid #f3f4f6" : "none" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 28 }}>{imp.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{imp.titulo}</div>
                          <div style={{ background: `${prov.color}18`, color: prov.color, fontWeight: 700, fontSize: 13, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 8 }}>
                            {imp.alicuota}
                          </div>
                          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", lineHeight: 1.5 }}>{imp.desc}</p>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>📅 {imp.venc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "20px 24px", background: "#f8fafc" }}>
                  <h3 style={{ fontWeight: 700, color: "#374151", marginBottom: 12, fontSize: 16 }}>🏙️ Principales municipios</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {prov.municipios.map(m => (
                      <span key={m} style={{ background: "#fff", border: `1px solid ${prov.color}30`, borderRadius: 6, padding: "4px 10px", fontSize: 13, color: prov.color, fontWeight: 600 }}>
                        {m}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Cada municipio puede tener tasas adicionales. Consultá en el municipio correspondiente.</p>
                </div>

                <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6" }}>
                  <h3 style={{ fontWeight: 700, color: "#374151", marginBottom: 8, fontSize: 15 }}>✅ Exenciones y beneficios principales</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{prov.exenciones}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPARATIVA */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>📊 Comparativa de alícuotas de IIBB — todas las provincias</h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>Alícuota general de Ingresos Brutos. Hacé clic en una fila para ver el detalle completo. Datos 2025.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#374151", color: "#fff" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Provincia</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Organismo</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>IIBB general</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Sellos</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Sitio oficial</th>
                </tr>
              </thead>
              <tbody>
                {PROVINCIAS_ORDENADAS.map(([key, p], i) => (
                  <tr
                    key={key}
                    style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff", cursor: "pointer" }}
                    onClick={() => { setProvinciaKey(key); document.getElementById("selector")?.scrollIntoView({ behavior: "smooth" }); }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: p.color }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: p.color, marginRight: 8 }}></span>
                      {p.nombre}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{p.organo}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ background: `${p.color}15`, color: p.color, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                        {p.iibb.alicuota}%
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", color: "#374151" }}>{p.sellos.alicuota}%</td>
                    <td style={{ padding: "12px 16px" }}>
                      <a href={p.sitio} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#0d9488", fontSize: 12, fontWeight: 600 }}>
                        {p.organo} →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* RANKING FINANCIERO */}
      <section style={{ background: "#f8fafc", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 8 }}>🏆 ¿Cuál es la provincia con más IIBB en servicios financieros?</h2>
          <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
            Ranking de alícuota de Ingresos Brutos para actividad financiera (bancos, fintech, servicios financieros). Fuente: BCRA / ADEBA, julio 2025.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {rankingFinanciero.map(([key, p], i) => (
              <div key={key}
                onClick={() => { setProvinciaKey(key); document.getElementById("selector")?.scrollIntoView({ behavior: "smooth" }); }}
                style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", cursor: "pointer", border: `2px solid ${i < 3 ? p.color : "#e5e7eb"}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 16, color: i < 3 ? p.color : "#9ca3af", minWidth: 24 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{p.nombre}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: p.color }}>{p.iibb.alicuota}%</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>IIBB actividad financiera</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 16 }}>
            * La Pampa lidera con 9,1%. San Luis y Santiago del Estero usan base "spread" (diferencia entre tasas activas y pasivas), lo que reduce la carga efectiva respecto al resto.
          </p>
        </div>
      </section>

      {/* SEO CONTENT */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 16 }}>¿Qué impuestos se pagan en las provincias de Argentina?</h2>
          <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            En Argentina, cada una de las 24 jurisdicciones (23 provincias más la Ciudad Autónoma de Buenos Aires) tiene potestad para establecer sus propios impuestos provinciales. Los principales son el Impuesto sobre los Ingresos Brutos (IIBB), el Impuesto de Sellos, el Inmobiliario y el de Automotores.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>
            El <strong>Impuesto sobre los Ingresos Brutos</strong> es el más relevante para autónomos, monotributistas y empresas. Grava el ejercicio habitual de la actividad comercial y de servicios. La alícuota general varía entre el 3% (Corrientes, CABA, Formosa, Tierra del Fuego) y el 4% (Córdoba, Tucumán) para actividades comerciales ordinarias, pero puede llegar al 9,1% para servicios financieros en La Pampa.
          </p>
          <p style={{ color: "#374151", lineHeight: 1.8, marginBottom: 0 }}>
            El <strong>Impuesto de Sellos</strong> es otro tributo clave, especialmente en operaciones inmobiliarias y contractuales. CABA redujo su alícuota al 2,7% en 2026 (antes 3,5%) e incorporó exenciones para primera vivienda única. La Provincia de Buenos Aires aplica 2%. Estas diferencias hacen importante conocer la jurisdicción antes de firmar cualquier contrato. Formosa y Jujuy tienen las alícuotas más bajas del país para tarjetas de crédito (0,3% y 0,1% respectivamente).
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#f8fafc", padding: "48px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 24 }}>Preguntas frecuentes sobre impuestos provinciales</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: "100%", padding: "16px 20px", textAlign: "left", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: 15, color: "#111827",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  }}
                >
                  <span>{item.q}</span>
                  <span style={{ color: "#0d9488", fontSize: 20, flexShrink: 0 }}>{faqOpen === i ? "−" : "+"}</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 20px 16px", fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg, #374151, #111827)", borderRadius: 16, padding: "32px 24px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
            <h3 style={{ fontWeight: 700, fontSize: 22, margin: "0 0 8px" }}>¿No querés olvidarte de los vencimientos provinciales?</h3>
            <p style={{ opacity: 0.85, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>Te avisamos antes de cada vencimiento de IIBB, Sellos e Inmobiliario según tu provincia. Gratis.</p>
            <Link href="/" style={{ background: "#fbbf24", color: "#1c1917", fontWeight: 700, padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
              Activar alertas gratis →
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: "#111827", color: "#9ca3af", padding: "24px", textAlign: "center", fontSize: 14 }}>
        <p style={{ margin: "0 0 4px" }}>
          Datos actualizados según organismos fiscales provinciales y BCRA/ADEBA (julio 2025). Para decisiones fiscales, consultá con un contador matriculado.
        </p>
        <p style={{ margin: 0 }}>© 2025 FácilFiscal · <Link href="/" style={{ color: "#9ca3af" }}>Volver al inicio</Link></p>
      </footer>
    </main>
      </div>
    </>
  );
}
