"use client";

import { useState, useMemo, useEffect } from "react";

type Categoria = "monotributo" | "responsable" | "autonomo" | "empleador" | "todos";

interface Vencimiento {
  dia: number;
  titulo: string;
  descripcion: string;
  categoria: Categoria[];
  tipo: "pago" | "presentacion" | "recategorizacion" | "declaracion";
}

interface MesData {
  mes: number;
  nombre: string;
  vencimientos: Vencimiento[];
}

// ── Paleta y tokens ──────────────────────────────────────────────────────────
const C = {
  teal:       "#0f766e",
  tealDark:   "#0d5c56",
  tealLight:  "#e6f4f3",
  tealMid:    "#ccebe9",
  gold:       "#d97706",
  goldLight:  "#fef3c7",
  white:      "#ffffff",
  gray50:     "#f9fafb",
  gray100:    "#f3f4f6",
  gray200:    "#e5e7eb",
  gray400:    "#9ca3af",
  gray500:    "#6b7280",
  gray700:    "#374151",
  gray900:    "#111827",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  purple:     "#7c3aed",
  purpleLight:"#ede9fe",
  blue:       "#1d4ed8",
  blueLight:  "#dbeafe",
  amber:      "#d97706",
  amberLight: "#fef3c7",
};

const TIPO_CONFIG = {
  pago:            { label: "Pago",           bg: C.redLight,    color: C.red    },
  declaracion:     { label: "DJ",             bg: C.purpleLight, color: C.purple },
  presentacion:    { label: "Presentación",   bg: C.blueLight,   color: C.blue   },
  recategorizacion:{ label: "Recategorización",bg: C.amberLight, color: C.amber  },
};

const CAT_CONFIG: Record<Categoria, { label: string; bg: string; color: string }> = {
  todos:       { label: "Todos",          bg: C.gray100,    color: C.gray700 },
  monotributo: { label: "Monotributo",    bg: C.tealLight,  color: C.teal    },
  responsable: { label: "Resp. Inscripto",bg: C.blueLight,  color: C.blue    },
  autonomo:    { label: "Autónomo",       bg: C.purpleLight,color: C.purple  },
  empleador:   { label: "Empleador",      bg: C.amberLight, color: C.amber   },
};

// ── Datos 2026 ───────────────────────────────────────────────────────────────
const CALENDARIO_2026: MesData[] = [
  { mes: 1, nombre: "Enero", vencimientos: [
    { dia: 20, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo (componentes impositivo, jubilatorio y obra social). Abonás mediante VEP o débito automático.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 21, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período diciembre 2025 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos (categorías A a E según actividad e ingresos).", categoria: ["autonomo"], tipo: "pago" },
    { dia: 28, titulo: "Cargas sociales — F.931", descripcion: "Presentación del F.931 y pago de cargas sociales de empleados en relación de dependencia (período diciembre 2025).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 2, nombre: "Febrero", vencimientos: [
    { dia: 20, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período enero 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 27, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período enero 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 3, nombre: "Marzo", vencimientos: [
    { dia: 20, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período febrero 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 27, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período febrero 2026).", categoria: ["empleador"], tipo: "pago" },
    { dia: 31, titulo: "Recategorización Monotributo — 1° cuatrimestre", descripcion: "Si en los últimos 12 meses tus ingresos brutos, energía eléctrica consumida o superficie afectada superaron los parámetros de tu categoría actual, debés recategorizarte antes de esta fecha.", categoria: ["monotributo"], tipo: "recategorizacion" },
  ]},
  { mes: 4, nombre: "Abril", vencimientos: [
    { dia: 22, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período marzo 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 28, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período marzo 2026).", categoria: ["empleador"], tipo: "pago" },
    { dia: 30, titulo: "Ganancias — 1° anticipo personas humanas", descripcion: "Vencimiento del primer anticipo del Impuesto a las Ganancias para personas humanas y sucesiones indivisas.", categoria: ["autonomo", "responsable"], tipo: "pago" },
  ]},
  { mes: 5, nombre: "Mayo", vencimientos: [
    { dia: 20, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 21, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período abril 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 27, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período abril 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 6, nombre: "Junio", vencimientos: [
    { dia: 22, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período mayo 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 29, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 29, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período mayo 2026).", categoria: ["empleador"], tipo: "pago" },
    { dia: 30, titulo: "Recategorización Monotributo — 2° cuatrimestre", descripcion: "Revisá tus ventas acumuladas de los últimos 12 meses. Si superaste los parámetros de tu categoría actual, debés recategorizarte antes de esta fecha o ARCA lo hará de oficio.", categoria: ["monotributo"], tipo: "recategorizacion" },
    { dia: 30, titulo: "Ganancias — DJ anual personas humanas", descripcion: "Vencimiento de la declaración jurada anual del Impuesto a las Ganancias para personas humanas (período fiscal 2025). Verificá la fecha exacta según tu CUIT en el calendario ARCA.", categoria: ["autonomo", "responsable"], tipo: "presentacion" },
  ]},
  { mes: 7, nombre: "Julio", vencimientos: [
    { dia: 22, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período junio 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 28, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período junio 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 8, nombre: "Agosto", vencimientos: [
    { dia: 20, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 21, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período julio 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 27, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período julio 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 9, nombre: "Septiembre", vencimientos: [
    { dia: 22, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período agosto 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 29, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período agosto 2026).", categoria: ["empleador"], tipo: "pago" },
    { dia: 30, titulo: "Recategorización Monotributo — 3° cuatrimestre", descripcion: "Última recategorización obligatoria del año. Revisá tus ingresos brutos, energía eléctrica y superficie de los últimos 12 meses.", categoria: ["monotributo"], tipo: "recategorizacion" },
  ]},
  { mes: 10, nombre: "Octubre", vencimientos: [
    { dia: 22, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período septiembre 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 28, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período septiembre 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 11, nombre: "Noviembre", vencimientos: [
    { dia: 20, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período octubre 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 25, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 27, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 26, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 27, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período octubre 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
  { mes: 12, nombre: "Diciembre", vencimientos: [
    { dia: 22, titulo: "Monotributo — cuota mensual", descripcion: "Pago de la cuota mensual de monotributo.", categoria: ["monotributo"], tipo: "pago" },
    { dia: 22, titulo: "IVA — DJ mensual (CUIT 0-1)", descripcion: "Presentación y pago del IVA período noviembre 2026 para CUIT terminados en 0 y 1.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 23, titulo: "IVA — DJ mensual (CUIT 2-3)", descripcion: "Presentación y pago del IVA para CUIT terminados en 2 y 3.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 24, titulo: "IVA — DJ mensual (CUIT 4-5)", descripcion: "Presentación y pago del IVA para CUIT terminados en 4 y 5.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "IVA — DJ mensual (CUIT 6-7)", descripcion: "Presentación y pago del IVA para CUIT terminados en 6 y 7.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 29, titulo: "IVA — DJ mensual (CUIT 8-9)", descripcion: "Presentación y pago del IVA para CUIT terminados en 8 y 9.", categoria: ["responsable"], tipo: "declaracion" },
    { dia: 28, titulo: "Autónomos — cuota mensual", descripcion: "Pago de aportes previsionales para trabajadores autónomos.", categoria: ["autonomo"], tipo: "pago" },
    { dia: 29, titulo: "Cargas sociales — F.931", descripcion: "Presentación F.931 y pago de cargas sociales (período noviembre 2026).", categoria: ["empleador"], tipo: "pago" },
  ]},
];

function getDiasRestantes(mes: number, dia: number): number {
  const hoy = new Date();
  const fechaVenc = new Date(hoy.getFullYear(), mes - 1, dia);
  return Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CalendarioFiscalClient() {
  const [mounted, setMounted] = useState(false);
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;

  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria>("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const mesData = useMemo(
    () => CALENDARIO_2026.find((m) => m.mes === mesSeleccionado)!,
    [mesSeleccionado]
  );

  const vencimientosFiltrados = useMemo(() => {
    const items = mesData.vencimientos
      .map((v) => ({ ...v, diasRestantes: mounted ? getDiasRestantes(mesSeleccionado, v.dia) : 999 }))
      .sort((a, b) => a.dia - b.dia);
    if (categoriaFiltro === "todos") return items;
    return items.filter((v) => v.categoria.includes(categoriaFiltro));
  }, [mesData, mesSeleccionado, categoriaFiltro, mounted]);

  const proximosGlobales = useMemo(() => {
    if (!mounted) return [];
    const todos: Array<Vencimiento & { mes: string; diasRestantes: number }> = [];
    for (const m of CALENDARIO_2026) {
      for (const v of m.vencimientos) {
        const dias = getDiasRestantes(m.mes, v.dia);
        if (dias >= 0 && dias <= 30) todos.push({ ...v, mes: m.nombre, diasRestantes: dias });
      }
    }
    return todos
      .filter((v) => categoriaFiltro === "todos" || v.categoria.includes(categoriaFiltro))
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 5);
  }, [categoriaFiltro, mounted]);

  const font = "font-family: 'Nunito', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: C.white, fontFamily: "'Nunito', sans-serif" }}>

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{ background: C.teal, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <a href="/" style={{ color: C.white, fontWeight: 800, fontSize: 20, textDecoration: "none", letterSpacing: "-0.5px" }}>
          FácilFiscal
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { href: "/", label: "Inicio" },
            { href: "/calendario-fiscal", label: "Calendario" },
            { href: "/mi-categoria", label: "Mi Categoría" },
            { href: "/como-facturar", label: "Cómo Facturar" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                color: item.href === "/calendario-fiscal" ? C.gold : "rgba(255,255,255,0.85)",
                fontWeight: item.href === "/calendario-fiscal" ? 700 : 500,
                fontSize: 14,
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 8,
                background: item.href === "/calendario-fiscal" ? "rgba(255,255,255,0.12)" : "transparent",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, padding: "56px 24px 48px", color: C.white }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Argentina · 2026
          </p>
          <h1 style={{ fontSize: 42, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15 }}>
            Calendario Fiscal 2026
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", maxWidth: 560, margin: 0, lineHeight: 1.6 }}>
            Todos los vencimientos impositivos del año en un solo lugar. Filtrá por tu situación y nunca más te olvidés de una fecha clave.
          </p>
        </div>
      </section>

      {/* ── FILTROS ──────────────────────────────────────────────────── */}
      <section style={{ background: C.tealDark, padding: "12px 24px", borderBottom: `1px solid ${C.teal}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(Object.keys(CAT_CONFIG) as Categoria[]).map((cat) => {
            const activo = categoriaFiltro === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: activo ? 700 : 500,
                  background: activo ? C.white : "rgba(255,255,255,0.15)",
                  color: activo ? C.teal : "rgba(255,255,255,0.9)",
                  transition: "all 0.15s",
                }}
              >
                {CAT_CONFIG[cat].label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}>

        {/* ── SIDEBAR ── */}
        <aside>
          {/* Nav meses */}
          <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Meses
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {CALENDARIO_2026.map((m) => {
              const cant = categoriaFiltro === "todos"
                ? m.vencimientos.length
                : m.vencimientos.filter((v) => v.categoria.includes(categoriaFiltro)).length;
              const esSel = m.mes === mesSeleccionado;
              const esActual = m.mes === mesActual;
              return (
                <button
                  key={m.mes}
                  onClick={() => setMesSeleccionado(m.mes)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 14,
                    fontWeight: esSel ? 700 : 500,
                    background: esSel ? C.teal : "transparent",
                    color: esSel ? C.white : C.gray700,
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {esActual && (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block", flexShrink: 0 }} />
                    )}
                    {m.nombre}
                  </span>
                  {cant > 0 && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 20,
                      background: esSel ? "rgba(255,255,255,0.2)" : C.gray100,
                      color: esSel ? C.white : C.gray500,
                    }}>
                      {cant}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Próximos 30 días */}
          {proximosGlobales.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Próximos 30 días
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {proximosGlobales.map((v, i) => {
                  const critico = v.diasRestantes <= 5;
                  return (
                    <div key={i} style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${critico ? "#fca5a5" : C.gray200}`,
                      background: critico ? C.redLight : C.gray50,
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.gray700, margin: "0 0 4px", lineHeight: 1.4 }}>{v.titulo}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: critico ? C.red : C.teal, margin: 0 }}>
                        {v.diasRestantes === 0 ? "¡Vence hoy!" : v.diasRestantes === 1 ? "Vence mañana" : `${v.mes} ${v.dia} · en ${v.diasRestantes} días`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN ── */}
        <main>
          {/* Header del mes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: C.gray900, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
              {mesData.nombre}
              {mesSeleccionado === mesActual && (
                <span style={{ fontSize: 13, fontWeight: 600, color: C.gold, background: C.goldLight, padding: "3px 10px", borderRadius: 20 }}>
                  Mes actual
                </span>
              )}
            </h2>
            <span style={{ fontSize: 13, color: C.gray400 }}>
              {vencimientosFiltrados.length} vencimiento{vencimientosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Lista de vencimientos */}
          {vencimientosFiltrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: C.gray400 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <p style={{ fontWeight: 700, fontSize: 16, color: C.gray500, margin: "0 0 6px" }}>Sin vencimientos para este filtro</p>
              <p style={{ fontSize: 14, margin: 0 }}>No tenés obligaciones de {CAT_CONFIG[categoriaFiltro].label} en {mesData.nombre}.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vencimientosFiltrados.map((v, i) => {
                const key = `${mesSeleccionado}-${i}`;
                const abierto = expandido === key;
                const esCritico = mounted && v.diasRestantes >= 0 && v.diasRestantes <= 5;
                const yaVencio = mounted && v.diasRestantes < 0;

                return (
                  <article
                    key={key}
                    style={{
                      border: `1.5px solid ${esCritico ? "#fca5a5" : C.gray200}`,
                      borderRadius: 14,
                      overflow: "hidden",
                      opacity: yaVencio ? 0.55 : 1,
                      background: C.white,
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <button
                      onClick={() => setExpandido(abierto ? null : key)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 16,
                        padding: "16px 18px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Nunito', sans-serif",
                        textAlign: "left",
                      }}
                    >
                      {/* Día */}
                      <div style={{
                        minWidth: 56,
                        textAlign: "center",
                        background: esCritico ? C.redLight : yaVencio ? C.gray100 : C.tealLight,
                        borderRadius: 10,
                        padding: "8px 4px",
                      }}>
                        <p style={{ fontSize: 26, fontWeight: 800, color: esCritico ? C.red : yaVencio ? C.gray400 : C.teal, margin: 0, lineHeight: 1 }}>
                          {v.dia}
                        </p>
                        <p style={{ fontSize: 11, color: C.gray400, margin: "2px 0 0", fontWeight: 600 }}>
                          {mesData.nombre.slice(0, 3).toUpperCase()}
                        </p>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: TIPO_CONFIG[v.tipo].bg, color: TIPO_CONFIG[v.tipo].color }}>
                            {TIPO_CONFIG[v.tipo].label}
                          </span>
                          {v.categoria.map((cat) => (
                            <span key={cat} style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: CAT_CONFIG[cat].bg, color: CAT_CONFIG[cat].color }}>
                              {CAT_CONFIG[cat].label}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.gray900, margin: 0, lineHeight: 1.4 }}>
                          {v.titulo}
                        </p>
                        {esCritico && !yaVencio && (
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.red, margin: "4px 0 0" }}>
                            ⚠ {v.diasRestantes === 0 ? "¡Vence hoy!" : `Vence en ${v.diasRestantes} día${v.diasRestantes !== 1 ? "s" : ""}`}
                          </p>
                        )}
                        {yaVencio && <p style={{ fontSize: 12, color: C.gray400, margin: "4px 0 0" }}>Ya venció</p>}
                      </div>

                      <span style={{ color: C.gray400, fontSize: 20, fontWeight: 300, marginTop: 4 }}>{abierto ? "−" : "+"}</span>
                    </button>

                    {abierto && (
                      <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.gray100}` }}>
                        <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7, margin: "14px 0 0" }}>
                          {v.descripcion}
                        </p>
                        {v.tipo === "recategorizacion" && (
                          <a href="/mi-categoria" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 14, fontWeight: 700, color: C.teal, textDecoration: "none" }}>
                            Verificar mi categoría →
                          </a>
                        )}
                        {v.tipo === "pago" && v.categoria.includes("monotributo") && (
                          <a href="https://serviciosweb.afip.gob.ar/genericos/guiaPasoPaso/VerGuia.aspx?id=129" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 14, fontWeight: 700, color: C.teal, textDecoration: "none" }}>
                            Pagar en AFIP/ARCA →
                          </a>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ borderTop: `1px solid ${C.gray200}`, background: C.gray50, padding: "56px 24px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: C.gray900, margin: "0 0 12px" }}>
            Recibí alertas antes de cada vencimiento
          </h2>
          <p style={{ fontSize: 16, color: C.gray500, margin: "0 0 28px", lineHeight: 1.6 }}>
            Activá las notificaciones por email y nunca más te lleguen multas por olvido.
          </p>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: C.teal,
              color: C.white,
              padding: "14px 28px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Activar alertas gratis
          </a>
        </div>
      </section>

      {/* Responsive sidebar → stack en mobile */}
      <style>{`
        @media (max-width: 720px) {
          .cal-grid { grid-template-columns: 1fr !important; }
          .cal-sidebar { order: 2; }
          .cal-main { order: 1; }
        }
      `}</style>
    </div>
  );
}
