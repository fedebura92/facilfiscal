"use client";

import { useState, useMemo } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Categoria =
  | "monotributo"
  | "responsable"
  | "autonomo"
  | "empleador"
  | "todos";

interface Vencimiento {
  dia: number;
  titulo: string;
  descripcion: string;
  categoria: Categoria[];
  urgente?: boolean; // vence en ≤5 días
  tipo: "pago" | "presentacion" | "recategorizacion" | "declaracion";
}

interface MesData {
  mes: number; // 1-12
  nombre: string;
  vencimientos: Vencimiento[];
}

// ─── Datos fiscales 2025 ──────────────────────────────────────────────────────

const CALENDARIO_2025: MesData[] = [
  {
    mes: 1,
    nombre: "Enero",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo (componentes impositivo, jubilatorio y obra social).",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 21,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA correspondiente al período fiscal anterior (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 22,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 27,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 28,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales de empleados en relación de dependencia.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 2,
    nombre: "Febrero",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 21,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 27,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 3,
    nombre: "Marzo",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 21,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 27,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
      {
        dia: 31,
        titulo: "Recategorización Monotributo",
        descripcion: "Primer cuatrimestre: recategorización obligatoria si tus ventas o alquileres superaron los parámetros de tu categoría actual.",
        categoria: ["monotributo"],
        tipo: "recategorizacion",
        urgente: false,
      },
    ],
  },
  {
    mes: 4,
    nombre: "Abril",
    vencimientos: [
      {
        dia: 22,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 28,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 28,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 29,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
      {
        dia: 30,
        titulo: "Ganancias — Personas humanas (anticipo)",
        descripcion: "Vencimiento del 1° anticipo de Impuesto a las Ganancias para personas humanas y sucesiones.",
        categoria: ["autonomo", "responsable"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 5,
    nombre: "Mayo",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 21,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 22,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 27,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 6,
    nombre: "Junio",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 27,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
      {
        dia: 30,
        titulo: "Recategorización Monotributo",
        descripcion: "Segundo cuatrimestre: revisá tus ventas acumuladas. Si superaste los parámetros de tu categoría, debés recategorizarte antes de esta fecha.",
        categoria: ["monotributo"],
        tipo: "recategorizacion",
      },
      {
        dia: 30,
        titulo: "Ganancias — DJ anual personas humanas",
        descripcion: "Presentación de la declaración jurada anual del Impuesto a las Ganancias para personas humanas (período fiscal anterior).",
        categoria: ["autonomo", "responsable"],
        tipo: "presentacion",
      },
    ],
  },
  {
    mes: 7,
    nombre: "Julio",
    vencimientos: [
      {
        dia: 22,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 28,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 28,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 29,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 8,
    nombre: "Agosto",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 21,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 22,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 27,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 9,
    nombre: "Septiembre",
    vencimientos: [
      {
        dia: 22,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 29,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
      {
        dia: 30,
        titulo: "Recategorización Monotributo",
        descripcion: "Tercer cuatrimestre: última recategorización del año. Revisá ventas de los últimos 12 meses para determinar si tu categoría es correcta.",
        categoria: ["monotributo"],
        tipo: "recategorizacion",
      },
    ],
  },
  {
    mes: 10,
    nombre: "Octubre",
    vencimientos: [
      {
        dia: 22,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 27,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 28,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 28,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 29,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 11,
    nombre: "Noviembre",
    vencimientos: [
      {
        dia: 20,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 21,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 25,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 27,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
  {
    mes: 12,
    nombre: "Diciembre",
    vencimientos: [
      {
        dia: 22,
        titulo: "Monotributo — cuota mensual",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"],
        tipo: "pago",
      },
      {
        dia: 23,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 0-1).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 24,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 2-3).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 26,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 4-5).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 29,
        titulo: "IVA — Declaración jurada mensual",
        descripcion: "Presentación y pago del IVA (CUIT terminado en 6-7).",
        categoria: ["responsable"],
        tipo: "declaracion",
      },
      {
        dia: 29,
        titulo: "Autónomos — cuota mensual",
        descripcion: "Pago de los aportes al sistema previsional para trabajadores autónomos.",
        categoria: ["autonomo"],
        tipo: "pago",
      },
      {
        dia: 30,
        titulo: "Cargas sociales empleados",
        descripcion: "Presentación F931 y pago de cargas sociales.",
        categoria: ["empleador"],
        tipo: "pago",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIPO_CONFIG = {
  pago: { label: "Pago", color: "bg-red-100 text-red-700" },
  presentacion: { label: "Presentación", color: "bg-blue-100 text-blue-700" },
  recategorizacion: { label: "Recategorización", color: "bg-amber-100 text-amber-700" },
  declaracion: { label: "DJ", color: "bg-purple-100 text-purple-700" },
};

const CAT_CONFIG: Record<Categoria, { label: string; color: string; bg: string }> = {
  todos: { label: "Todos", color: "text-gray-700", bg: "bg-gray-100" },
  monotributo: { label: "Monotributo", color: "text-teal-700", bg: "bg-teal-50" },
  responsable: { label: "Resp. Inscripto", color: "text-blue-700", bg: "bg-blue-50" },
  autonomo: { label: "Autónomo", color: "text-violet-700", bg: "bg-violet-50" },
  empleador: { label: "Empleador", color: "text-orange-700", bg: "bg-orange-50" },
};

function getDiasRestantes(mes: number, dia: number): number {
  const hoy = new Date();
  const fechaVenc = new Date(hoy.getFullYear(), mes - 1, dia);
  const diff = fechaVenc.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CalendarioFiscalClient() {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;

  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria>("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  const mesData = useMemo(
    () => CALENDARIO_2025.find((m) => m.mes === mesSeleccionado)!,
    [mesSeleccionado]
  );

  const vencimientosFiltrados = useMemo(() => {
    const items = mesData.vencimientos
      .map((v) => ({
        ...v,
        diasRestantes: getDiasRestantes(mesSeleccionado, v.dia),
      }))
      .sort((a, b) => a.dia - b.dia);

    if (categoriaFiltro === "todos") return items;
    return items.filter((v) => v.categoria.includes(categoriaFiltro));
  }, [mesData, mesSeleccionado, categoriaFiltro]);

  // Próximos vencimientos globales (todos los meses)
  const proximosGlobales = useMemo(() => {
    const todos: Array<{ titulo: string; mes: string; dia: number; diasRestantes: number; tipo: Vencimiento["tipo"]; categoria: Categoria[] }> = [];
    for (const m of CALENDARIO_2025) {
      for (const v of m.vencimientos) {
        const dias = getDiasRestantes(m.mes, v.dia);
        if (dias >= 0 && dias <= 30) {
          todos.push({ ...v, mes: m.nombre, diasRestantes: dias });
        }
      }
    }
    return todos
      .filter((v) => categoriaFiltro === "todos" || v.categoria.includes(categoriaFiltro))
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 5);
  }, [categoriaFiltro]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-teal-200 text-sm font-medium uppercase tracking-widest mb-3">
            Argentina · 2025
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Calendario Fiscal
          </h1>
          <p className="text-teal-100 text-lg max-w-2xl">
            Todos los vencimientos impositivos del año en un solo lugar. Filtrá por tu situación y nunca más te olvidés de una fecha clave.
          </p>
        </div>
      </section>

      {/* Filtro categoría */}
      <section className="bg-teal-700 border-b border-teal-600 px-4 py-3">
        <div className="max-w-5xl mx-auto flex gap-2 flex-wrap">
          {(Object.keys(CAT_CONFIG) as Categoria[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaFiltro(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                categoriaFiltro === cat
                  ? "bg-white text-teal-700 shadow"
                  : "bg-teal-600 text-teal-100 hover:bg-teal-500"
              }`}
            >
              {CAT_CONFIG[cat].label}
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: navegación de meses */}
        <aside>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Meses
          </h2>
          <nav className="flex flex-col gap-1">
            {CALENDARIO_2025.map((m) => {
              const cantFiltrada =
                categoriaFiltro === "todos"
                  ? m.vencimientos.length
                  : m.vencimientos.filter((v) =>
                      v.categoria.includes(categoriaFiltro)
                    ).length;
              const esActual = m.mes === mesActual;
              const esSeleccionado = m.mes === mesSeleccionado;
              return (
                <button
                  key={m.mes}
                  onClick={() => setMesSeleccionado(m.mes)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-all ${
                    esSeleccionado
                      ? "bg-teal-600 text-white font-semibold shadow"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {esActual && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    )}
                    {m.nombre}
                  </span>
                  {cantFiltrada > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        esSeleccionado
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cantFiltrada}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Próximos vencimientos */}
          {proximosGlobales.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Próximos 30 días
              </h2>
              <div className="flex flex-col gap-2">
                {proximosGlobales.map((v, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-sm ${
                      v.diasRestantes <= 5
                        ? "border-red-200 bg-red-50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <p className="font-medium text-gray-800 leading-snug text-xs">
                      {v.titulo}
                    </p>
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        v.diasRestantes === 0
                          ? "text-red-600"
                          : v.diasRestantes <= 5
                          ? "text-red-500"
                          : "text-teal-600"
                      }`}
                    >
                      {v.diasRestantes === 0
                        ? "¡Vence hoy!"
                        : v.diasRestantes === 1
                        ? "Vence mañana"
                        : `${v.mes} ${v.dia} · en ${v.diasRestantes} días`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Columna derecha: vencimientos del mes */}
        <main className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mesData.nombre}
              {mesSeleccionado === mesActual && (
                <span className="ml-3 text-sm font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Mes actual
                </span>
              )}
            </h2>
            <span className="text-sm text-gray-400">
              {vencimientosFiltrados.length} vencimiento
              {vencimientosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {vencimientosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🎉</p>
              <p className="font-medium">Sin vencimientos para este filtro</p>
              <p className="text-sm mt-1">
                No tenés obligaciones de {CAT_CONFIG[categoriaFiltro].label} en {mesData.nombre}.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {vencimientosFiltrados.map((v, i) => {
                const key = `${mesSeleccionado}-${i}`;
                const abierto = expandido === key;
                const esCritico = v.diasRestantes >= 0 && v.diasRestantes <= 5;
                const yaVencio = v.diasRestantes < 0;

                return (
                  <article
                    key={key}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      esCritico
                        ? "border-red-300 shadow-sm"
                        : yaVencio
                        ? "border-gray-200 opacity-60"
                        : "border-gray-200 hover:border-teal-300 hover:shadow-sm"
                    }`}
                  >
                    <button
                      onClick={() => setExpandido(abierto ? null : key)}
                      className="w-full flex items-start gap-4 p-4 text-left"
                    >
                      {/* Día */}
                      <div
                        className={`min-w-[52px] text-center rounded-lg py-2 ${
                          esCritico
                            ? "bg-red-100"
                            : yaVencio
                            ? "bg-gray-100"
                            : "bg-teal-50"
                        }`}
                      >
                        <p
                          className={`text-2xl font-bold leading-none ${
                            esCritico
                              ? "text-red-600"
                              : yaVencio
                              ? "text-gray-400"
                              : "text-teal-700"
                          }`}
                        >
                          {v.dia}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {mesData.nombre.slice(0, 3)}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              TIPO_CONFIG[v.tipo].color
                            }`}
                          >
                            {TIPO_CONFIG[v.tipo].label}
                          </span>
                          {v.categoria.map((cat) => (
                            <span
                              key={cat}
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_CONFIG[cat].bg} ${CAT_CONFIG[cat].color}`}
                            >
                              {CAT_CONFIG[cat].label}
                            </span>
                          ))}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm leading-snug">
                          {v.titulo}
                        </p>
                        {esCritico && !yaVencio && (
                          <p className="text-xs text-red-500 font-medium mt-0.5">
                            ⚠{" "}
                            {v.diasRestantes === 0
                              ? "¡Vence hoy!"
                              : `Vence en ${v.diasRestantes} día${v.diasRestantes !== 1 ? "s" : ""}`}
                          </p>
                        )}
                        {yaVencio && (
                          <p className="text-xs text-gray-400 mt-0.5">Ya venció</p>
                        )}
                      </div>

                      {/* Toggle */}
                      <span className="text-gray-300 text-lg mt-1">
                        {abierto ? "−" : "+"}
                      </span>
                    </button>

                    {abierto && (
                      <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed mt-3">
                          {v.descripcion}
                        </p>
                        {v.tipo === "recategorizacion" && (
                          <a
                            href="/mi-categoria"
                            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
                          >
                            Verificar mi categoría →
                          </a>
                        )}
                        {v.tipo === "pago" && v.categoria.includes("monotributo") && (
                          <a
                            href="https://serviciosweb.afip.gob.ar/genericos/guiaPasoPaso/VerGuia.aspx?id=129"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-teal-600 hover:text-teal-700"
                          >
                            Pagar en AFIP →
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

      {/* CTA inferior */}
      <section className="border-t bg-gray-50 px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Recibí alertas antes de cada vencimiento
          </h2>
          <p className="text-gray-500 mb-6">
            Activá las notificaciones por email y nunca más te lleguen multas por olvido.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-colors"
          >
            Activar alertas gratis
          </a>
        </div>
      </section>
    </div>
  );
}
