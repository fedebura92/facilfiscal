"use client";

import { useState, useMemo, useEffect } from "react";
import { useVencimientosFiscales } from "@/hooks/useVencimientosFiscales";
import SiteHeader from "@/components/SiteHeader";

type Categoria = "monotributo" | "responsable" | "autonomo" | "empleador" | "todos";

interface Vencimiento {
  // Si es undefined, el vencimiento no tiene fecha exacta confirmada aún
  dia?: number;
  // Rango de días cuando aplica (ej: autónomos por CUIT)
  rango?: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria[];
  tipo: "pago" | "presentacion" | "recategorizacion" | "declaracion";
  pendiente?: boolean; // true = fecha no confirmada aún por ARCA
}

interface MesData {
  mes: number;
  nombre: string;
  verificado: boolean; // true = fechas exactas confirmadas de ARCA
  vencimientos: Vencimiento[];
}

// ── Paleta ── igual al resto del sitio (azul oscuro)
const C = {
  teal:        "#1a7fa8",   // azul principal del sitio
  tealDark:    "#0d5c78",   // azul oscuro
  tealLight:   "#e8f6fb",   // azul muy claro
  gold:        "#f5a623",   // gold del sitio
  goldLight:   "#fff8ec",
  white:       "#ffffff",
  gray50:      "#f4f7f9",
  gray100:     "#f4f7f9",
  gray200:     "#e2e8ed",
  gray400:     "#7a9aaa",
  gray500:     "#7a9aaa",
  gray700:     "#3d5a6b",
  gray900:     "#0f2733",
  red:         "#e53535",
  redLight:    "#fff1f1",
  purple:      "#7c3aed",
  purpleLight: "#ede9fe",
  blue:        "#1a7fa8",
  blueLight:   "#e8f6fb",
  amber:       "#d97706",
  amberLight:  "#fef3c7",
  slate:       "#3d5a6b",
  slateLight:  "#f4f7f9",
};

const TIPO_CONFIG = {
  pago:             { label: "Pago",            bg: C.redLight,    color: C.red    },
  declaracion:      { label: "DJ",              bg: C.purpleLight, color: C.purple },
  presentacion:     { label: "Presentación",    bg: C.blueLight,   color: C.blue   },
  recategorizacion: { label: "Recategorización",bg: C.amberLight,  color: C.amber  },
};

const CAT_CONFIG: Record<Categoria, { label: string; bg: string; color: string }> = {
  todos:       { label: "Todos",           bg: C.gray100,     color: C.gray700 },
  monotributo: { label: "Monotributo",     bg: C.tealLight,   color: C.teal    },
  responsable: { label: "Resp. Inscripto", bg: C.blueLight,   color: C.blue    },
  autonomo:    { label: "Autónomo",        bg: C.purpleLight, color: C.purple  },
  empleador:   { label: "Empleador",       bg: C.amberLight,  color: C.amber   },
};

// ── Datos verificados ─────────────────────────────────────────────────────────
//
// FUENTES:
//   - Estudio Contable del Amo: estudiodelamo.com/vencimientos-autonomos
//   - MyContador Blog: blog.mycontador.com.ar/arca-publico-el-calendario-de-vencimientos-de-abril-de-2026
//   - El Cronista: cronista.com (calendario ARCA 2026)
//
// VERIFICADOS con fechas exactas: Enero, Febrero, Marzo, Abril, Mayo 2026
// PENDIENTES de publicación oficial ARCA: Junio a Diciembre 2026
//
// Autónomos: vence los primeros días hábiles de cada mes según terminación CUIT
//   CUIT 0-1-2-3 / CUIT 4-5-6 / CUIT 7-8-9
// Empleadores F.931: vence entre días 9 y 11 del mes siguiente según CUIT
// Monotributo: día 20 de cada mes (o siguiente hábil si cae finde/feriado)
// IVA: segunda quincena del mes siguiente, escalonado por terminación de CUIT
// Recategorización: enero, mayo y septiembre (cuatrimestres)

const CALENDARIO_2026: MesData[] = [
  // ── ENERO (verificado) ──────────────────────────────────────────────────
  {
    mes: 1, nombre: "Enero", verificado: true,
    vencimientos: [
      {
        rango: "5, 6 y 7",
        titulo: "Autónomos — cuota diciembre 2025",
        descripcion: "Pago de aportes previsionales (período diciembre 2025) según terminación de CUIT: día 5 para CUIT 0-1-2-3 / día 6 para CUIT 4-5-6 / día 7 para CUIT 7-8-9.",
        categoria: ["autonomo"], tipo: "pago",
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota enero 2026",
        descripcion: "Pago de la cuota mensual de monotributo (componentes impositivo, jubilatorio y obra social). Igual fecha para todas las terminaciones de CUIT.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "21 al 27",
        titulo: "IVA — DJ mensual (período diciembre 2025)",
        descripcion: "Presentación y pago del IVA escalonado por terminación de CUIT: CUIT 0-1 → 21/ene · CUIT 2-3 → 22/ene · CUIT 4-5 → 23/ene · CUIT 6-7 → 26/ene · CUIT 8-9 → 27/ene.",
        categoria: ["responsable"], tipo: "declaracion",
      },
      {
        rango: "9, 10 y 13",
        titulo: "Cargas sociales — F.931 (período diciembre 2025)",
        descripcion: "Presentación del F.931 y pago de cargas sociales escalonado por terminación de CUIT: CUIT 0-1-2-3 → 9/ene · CUIT 4-5-6 → 10/ene · CUIT 7-8-9 → 13/ene.",
        categoria: ["empleador"], tipo: "pago",
      },
    ],
  },

  // ── FEBRERO (verificado) ────────────────────────────────────────────────
  {
    mes: 2, nombre: "Febrero", verificado: true,
    vencimientos: [
      {
        rango: "5, 6 y 9",
        titulo: "Autónomos — cuota enero 2026",
        descripcion: "Pago de aportes previsionales (período enero 2026): día 5 para CUIT 0-1-2-3 / día 6 para CUIT 4-5-6 / día 9 para CUIT 7-8-9.",
        categoria: ["autonomo"], tipo: "pago",
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota febrero 2026",
        descripcion: "Pago de la cuota mensual de monotributo. Igual fecha para todas las terminaciones de CUIT.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período enero 2026)",
        descripcion: "Presentación y pago del IVA escalonado por terminación de CUIT: CUIT 0-1 → 18/feb · CUIT 2-3 → 19/feb · CUIT 4-5 → 20/feb · CUIT 6-7 → 23/feb · CUIT 8-9 → 24/feb.",
        categoria: ["responsable"], tipo: "declaracion",
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período enero 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales: CUIT 0-1-2-3 → 9/feb · CUIT 4-5-6 → 10/feb · CUIT 7-8-9 → 11/feb.",
        categoria: ["empleador"], tipo: "pago",
      },
    ],
  },

  // ── MARZO (verificado) ──────────────────────────────────────────────────
  {
    mes: 3, nombre: "Marzo", verificado: true,
    vencimientos: [
      {
        rango: "5, 6 y 9",
        titulo: "Autónomos — cuota febrero 2026",
        descripcion: "Pago de aportes previsionales (período febrero 2026): día 5 para CUIT 0-1-2-3 / día 6 para CUIT 4-5-6 / día 9 para CUIT 7-8-9.",
        categoria: ["autonomo"], tipo: "pago",
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota marzo 2026",
        descripcion: "Pago de la cuota mensual de monotributo. Igual fecha para todas las terminaciones de CUIT.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 25",
        titulo: "IVA — DJ mensual (período febrero 2026)",
        descripcion: "Presentación y pago del IVA escalonado por terminación de CUIT: CUIT 0-1 → 18/mar · CUIT 2-3 → 19/mar · CUIT 4-5 → 20/mar · CUIT 6-7 → 23/mar · CUIT 8-9 → 25/mar.",
        categoria: ["responsable"], tipo: "declaracion",
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período febrero 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales: CUIT 0-1-2-3 → 9/mar · CUIT 4-5-6 → 10/mar · CUIT 7-8-9 → 11/mar.",
        categoria: ["empleador"], tipo: "pago",
      },
      {
        dia: 31,
        titulo: "Recategorización Monotributo — 1° cuatrimestre",
        descripcion: "Si en los últimos 12 meses tus ingresos brutos, energía eléctrica consumida o superficie afectada superaron los parámetros de tu categoría actual, debés recategorizarte antes del 31 de marzo.",
        categoria: ["monotributo"], tipo: "recategorizacion",
      },
    ],
  },

  // ── ABRIL (verificado) ──────────────────────────────────────────────────
  {
    mes: 4, nombre: "Abril", verificado: true,
    vencimientos: [
      {
        rango: "6, 7 y 8",
        titulo: "Autónomos — cuota marzo 2026",
        descripcion: "Pago de aportes previsionales (período marzo 2026): día 6 para CUIT 0-1-2-3 / día 7 para CUIT 4-5-6 / día 8 para CUIT 7-8-9. Fuente: ARCA calendario abril 2026.",
        categoria: ["autonomo"], tipo: "pago",
      },
      {
        rango: "9, 10 y 13",
        titulo: "Cargas sociales — F.931 (período marzo 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales: CUIT 0-1-2-3 → 9/abr · CUIT 4-5-6 → 10/abr · CUIT 7-8-9 → 13/abr. Fuente: ARCA calendario abril 2026.",
        categoria: ["empleador"], tipo: "pago",
      },
      {
        rango: "13, 14 y 15",
        titulo: "Ganancias — 5° anticipo 2025",
        descripcion: "Quinto anticipo del Impuesto a las Ganancias período fiscal 2025: CUIT 0-1-2-3 → 13/abr · CUIT 4-5-6 → 14/abr · CUIT 7-8-9 → 15/abr. Fuente: ARCA calendario abril 2026.",
        categoria: ["autonomo", "responsable"], tipo: "pago",
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota abril 2026",
        descripcion: "Pago de la cuota mensual de monotributo. Fecha única para todas las terminaciones de CUIT. Fuente: ARCA calendario abril 2026.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "20 al 24",
        titulo: "IVA — DJ mensual (período marzo 2026)",
        descripcion: "Presentación y pago del IVA: CUIT 0-1 → 20/abr · CUIT 2-3 → 21/abr · CUIT 4-5 → 22/abr · CUIT 6-7 → 23/abr · CUIT 8-9 → 24/abr. Fuente: ARCA calendario abril 2026.",
        categoria: ["responsable"], tipo: "declaracion",
      },
    ],
  },

  // ── MAYO (verificado) ───────────────────────────────────────────────────
  {
    mes: 5, nombre: "Mayo", verificado: true,
    vencimientos: [
      {
        rango: "5, 6 y 7",
        titulo: "Autónomos — cuota abril 2026",
        descripcion: "Pago de aportes previsionales (período abril 2026) según terminación de CUIT: día 5 para CUIT 0-1-2-3 / día 6 para CUIT 4-5-6 / día 7 para CUIT 7-8-9. Fuente: calendariofiscal.com.ar / ARCA mayo 2026.",
        categoria: ["autonomo"], tipo: "pago",
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período abril 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales: CUIT 0-1-2-3 → 9/may · CUIT 4-5-6 → 10/may · CUIT 7-8-9 → 11/may. Fuente: ARCA mayo 2026.",
        categoria: ["empleador"], tipo: "pago",
      },
      {
        rango: "13, 14 y 15",
        titulo: "Ganancias — anticipos (sociedades)",
        descripcion: "Anticipos del Impuesto a las Ganancias para sociedades con cierre febrero a noviembre 2026: CUIT 0-1-2-3 → 13/may · CUIT 4-5-6 → 14/may · CUIT 7-8-9 → 15/may. Fuente: ARCA mayo 2026.",
        categoria: ["responsable"], tipo: "pago",
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota mayo 2026",
        descripcion: "Pago de la cuota mensual de monotributo (componentes impositivo, jubilatorio y obra social). Fecha única para todas las terminaciones de CUIT. Fuente: ARCA mayo 2026.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 22",
        titulo: "IVA — DJ mensual (período abril 2026)",
        descripcion: "Presentación y pago del IVA escalonado por terminación de CUIT: CUIT 0-1 → 18/may · CUIT 2-3 → 19/may · CUIT 4-5 → 20/may · CUIT 6-7 → 21/may · CUIT 8-9 → 22/may. Fuente: ARCA mayo 2026.",
        categoria: ["responsable"], tipo: "declaracion",
      },
    ],
  },

  // ── JUNIO (pendiente) ───────────────────────────────────────────────────
  {
    mes: 6, nombre: "Junio", verificado: false,
    vencimientos: [
      {
        rango: "5, 8 y 9",
        titulo: "Autónomos — cuota mayo 2026",
        descripcion: "Pago de aportes previsionales (período mayo 2026). Fechas aproximadas: primeros días hábiles de junio según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período mayo 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de junio. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        rango: "11 al 16",
        titulo: "Ganancias — DJ anual personas humanas (período 2025)",
        descripcion: "Presentación de la declaración jurada anual de Ganancias y Bienes Personales (período fiscal 2025): CUIT 0-1-2-3 → presentación 11/jun, pago 12/jun · CUIT 4-5-6 → presentación 12/jun, pago 15/jun · CUIT 7-8-9 → presentación 15/jun, pago 16/jun. Fuente: El Cronista / ARCA.",
        categoria: ["autonomo", "responsable"], tipo: "presentacion",
      },
      {
        dia: 22,
        titulo: "Monotributo — cuota junio 2026",
        descripcion: "Pago de la cuota mensual de monotributo. El día 20 es la fecha habitual; si cae en finde o feriado corre al siguiente hábil.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período mayo 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de junio, escalonadas por terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
    ],
  },

  // ── JULIO (pendiente) ───────────────────────────────────────────────────
  {
    mes: 7, nombre: "Julio", verificado: false,
    vencimientos: [
      {
        rango: "6, 7 y 8",
        titulo: "Autónomos — cuota junio 2026",
        descripcion: "Pago de aportes previsionales (período junio 2026). Fechas aproximadas según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período junio 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de julio. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota julio 2026",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período junio 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de julio. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
    ],
  },

  // ── AGOSTO (pendiente) ──────────────────────────────────────────────────
  {
    mes: 8, nombre: "Agosto", verificado: false,
    vencimientos: [
      {
        rango: "5, 6 y 7",
        titulo: "Autónomos — cuota julio 2026",
        descripcion: "Pago de aportes previsionales (período julio 2026). Fechas aproximadas según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período julio 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de agosto. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        rango: "13, 14 y 15",
        titulo: "Ganancias — 1° anticipo 2026",
        descripcion: "Primer anticipo del Impuesto a las Ganancias período fiscal 2026. Fechas aproximadas: entre el 13 y 15 de agosto según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo", "responsable"], tipo: "pago", pendiente: true,
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota agosto 2026",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período julio 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de agosto. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
      {
        rango: "fines de agosto",
        titulo: "Recategorización Monotributo — 3° cuatrimestre",
        descripcion: "Tercer período de recategorización obligatoria del año. Revisá tus ventas, energía eléctrica y superficie de los últimos 12 meses. Fecha exacta a confirmar en ARCA.",
        categoria: ["monotributo"], tipo: "recategorizacion", pendiente: true,
      },
    ],
  },

  // ── SEPTIEMBRE (pendiente) ──────────────────────────────────────────────
  {
    mes: 9, nombre: "Septiembre", verificado: false,
    vencimientos: [
      {
        rango: "7, 8 y 9",
        titulo: "Autónomos — cuota agosto 2026",
        descripcion: "Pago de aportes previsionales (período agosto 2026). Fechas aproximadas según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período agosto 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de septiembre. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota septiembre 2026",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período agosto 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de septiembre. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
    ],
  },

  // ── OCTUBRE (pendiente) ─────────────────────────────────────────────────
  {
    mes: 10, nombre: "Octubre", verificado: false,
    vencimientos: [
      {
        rango: "5, 6 y 7",
        titulo: "Autónomos — cuota septiembre 2026",
        descripcion: "Pago de aportes previsionales (período septiembre 2026). Fechas aproximadas según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período septiembre 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de octubre. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        rango: "13, 14 y 15",
        titulo: "Ganancias — 2° anticipo 2026",
        descripcion: "Segundo anticipo del Impuesto a las Ganancias período fiscal 2026. Fechas aproximadas entre el 13 y 15 de octubre. Confirmá en arca.gob.ar.",
        categoria: ["autonomo", "responsable"], tipo: "pago", pendiente: true,
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota octubre 2026",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período septiembre 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de octubre. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
    ],
  },

  // ── NOVIEMBRE (pendiente) ───────────────────────────────────────────────
  {
    mes: 11, nombre: "Noviembre", verificado: false,
    vencimientos: [
      {
        rango: "5, 6 y 9",
        titulo: "Autónomos — cuota octubre 2026",
        descripcion: "Pago de aportes previsionales (período octubre 2026). Fechas aproximadas según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período octubre 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de noviembre. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota noviembre 2026",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período octubre 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de noviembre. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
    ],
  },

  // ── DICIEMBRE (pendiente) ───────────────────────────────────────────────
  {
    mes: 12, nombre: "Diciembre", verificado: false,
    vencimientos: [
      {
        rango: "primeros días hábiles",
        titulo: "Autónomos — cuota noviembre 2026",
        descripcion: "Pago de aportes previsionales (período noviembre 2026). Fechas aproximadas según terminación de CUIT. Confirmá en arca.gob.ar.",
        categoria: ["autonomo"], tipo: "pago", pendiente: true,
      },
      {
        rango: "9, 10 y 11",
        titulo: "Cargas sociales — F.931 (período noviembre 2026)",
        descripcion: "Presentación del F.931 y pago de cargas sociales. Fecha aproximada: entre el 9 y 11 de diciembre. Confirmá en arca.gob.ar.",
        categoria: ["empleador"], tipo: "pago", pendiente: true,
      },
      {
        rango: "13, 14 y 15",
        titulo: "Ganancias — 3° anticipo 2026",
        descripcion: "Tercer anticipo del Impuesto a las Ganancias período fiscal 2026. Fechas aproximadas entre el 13 y 15 de diciembre. Confirmá en arca.gob.ar.",
        categoria: ["autonomo", "responsable"], tipo: "pago", pendiente: true,
      },
      {
        dia: 20,
        titulo: "Monotributo — cuota diciembre 2026",
        descripcion: "Pago de la cuota mensual de monotributo.",
        categoria: ["monotributo"], tipo: "pago",
      },
      {
        rango: "18 al 24",
        titulo: "IVA — DJ mensual (período noviembre 2026)",
        descripcion: "Presentación y pago del IVA. Fechas aproximadas en la segunda quincena de diciembre. Confirmá en arca.gob.ar.",
        categoria: ["responsable"], tipo: "declaracion", pendiente: true,
      },
    ],
  },
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
  const anioActual = hoy.getFullYear();

  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria>("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Datos de Supabase para el mes seleccionado ──────────────────────────
  const { vencimientos: vencimientosDB, verificado: verificadoDB, loading } =
    useVencimientosFiscales(mesSeleccionado, anioActual);

  // ── Fallback al array local si Supabase no tiene datos para ese mes ─────
  const mesDataLocal = useMemo(
    () => CALENDARIO_2026.find((m) => m.mes === mesSeleccionado),
    [mesSeleccionado]
  );

  const usandoDB = vencimientosDB.length > 0;

  const mesData = useMemo((): MesData => {
    if (usandoDB) {
      return {
        mes: mesSeleccionado,
        nombre: CALENDARIO_2026.find(m => m.mes === mesSeleccionado)?.nombre ?? "",
        verificado: verificadoDB,
        vencimientos: vencimientosDB as Vencimiento[],
      };
    }
    return mesDataLocal ?? { mes: mesSeleccionado, nombre: "", verificado: false, vencimientos: [] };
  }, [usandoDB, mesSeleccionado, vencimientosDB, verificadoDB, mesDataLocal]);

  const vencimientosFiltrados = useMemo(() => {
    if (categoriaFiltro === "todos") return mesData.vencimientos;
    return mesData.vencimientos.filter((v) => v.categoria.includes(categoriaFiltro as Categoria));
  }, [mesData, categoriaFiltro]);

  // Próximos 30 días — solo para vencimientos con día exacto
  const proximosGlobales = useMemo(() => {
    if (!mounted) return [];
    const todos: Array<Vencimiento & { mesNombre: string; diasRestantes: number }> = [];
    for (const m of CALENDARIO_2026) {
      for (const v of m.vencimientos) {
        if (!v.dia || v.pendiente) continue;
        const dias = getDiasRestantes(m.mes, v.dia);
        if (dias >= 0 && dias <= 30) todos.push({ ...v, mesNombre: m.nombre, diasRestantes: dias });
      }
    }
    return todos
      .filter((v) => categoriaFiltro === "todos" || v.categoria.includes(categoriaFiltro))
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .slice(0, 5);
  }, [categoriaFiltro, mounted]);

  return (
    <>
      <SiteHeader currentPath="/calendario-fiscal" />
      <div className="ff-page-content">
      <div style={{ minHeight: "100vh", background: C.gray50, fontFamily: "'Nunito', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap');`}</style>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`, padding: "52px 24px 44px", color: C.white }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Argentina · 2026</p>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.15 }}>Calendario Fiscal 2026</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.8)", maxWidth: 540, margin: 0, lineHeight: 1.6 }}>
            Vencimientos impositivos verificados de ARCA. Los meses confirmados tienen fechas exactas; los futuros muestran rangos orientativos hasta que ARCA publique el calendario oficial.
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section style={{ background: C.tealDark, padding: "12px 24px", borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(Object.keys(CAT_CONFIG) as Categoria[]).map((cat) => {
            const activo = categoriaFiltro === cat;
            return (
              <button key={cat} onClick={() => setCategoriaFiltro(cat)} style={{
                padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: activo ? 700 : 500,
                background: activo ? C.white : "rgba(255,255,255,0.15)",
                color: activo ? C.teal : "rgba(255,255,255,0.9)",
              }}>
                {CAT_CONFIG[cat].label}
              </button>
            );
          })}
        </div>
      </section>

      {/* BODY */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 32 }}>

        {/* SIDEBAR */}
        <aside>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Meses</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {CALENDARIO_2026.map((m) => {
              const cant = categoriaFiltro === "todos" ? m.vencimientos.length : m.vencimientos.filter((v) => v.categoria.includes(categoriaFiltro)).length;
              const esSel = m.mes === mesSeleccionado;
              return (
                <button key={m.mes} onClick={() => setMesSeleccionado(m.mes)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: esSel ? 700 : 500,
                  background: esSel ? C.teal : "transparent",
                  color: esSel ? C.white : C.gray700, textAlign: "left",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {m.mes === mesActual && <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block" }} />}
                    {m.nombre}
                    {!m.verificado && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: esSel ? "rgba(255,255,255,0.6)" : C.gray400 }}>~</span>
                    )}
                  </span>
                  {cant > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
                      background: esSel ? "rgba(255,255,255,0.2)" : C.gray100,
                      color: esSel ? C.white : C.gray500,
                    }}>{cant}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div style={{ marginTop: 20, padding: "10px 12px", background: C.gray50, borderRadius: 10, border: `1px solid ${C.gray200}` }}>
            <p style={{ fontSize: 11, color: C.gray500, margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: C.gray700 }}>✓</strong> Fechas verificadas<br />
              <strong style={{ color: C.gray400 }}>~</strong> Fechas aproximadas<br />
              <span style={{ color: C.gray400 }}>Fuente: ARCA / estudiodelamo.com</span>
            </p>
          </div>

          {/* Próximos 30 días */}
          {proximosGlobales.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Próximos 30 días</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {proximosGlobales.map((v, i) => {
                  const critico = v.diasRestantes <= 5;
                  return (
                    <div key={i} style={{
                      padding: "10px 12px", borderRadius: 10,
                      border: `1px solid ${critico ? "#fca5a5" : C.gray200}`,
                      background: critico ? C.redLight : C.gray50,
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.gray700, margin: "0 0 4px", lineHeight: 1.4 }}>{v.titulo}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: critico ? C.red : C.teal, margin: 0 }}>
                        {v.diasRestantes === 0 ? "¡Vence hoy!" : v.diasRestantes === 1 ? "Vence mañana" : `${v.mesNombre} ${v.dia} · en ${v.diasRestantes} días`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main>
          {/* Header del mes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: C.gray900, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
              {mesData.nombre}
              {mesSeleccionado === mesActual && (
                <span style={{ fontSize: 13, fontWeight: 600, color: C.gold, background: C.goldLight, padding: "3px 10px", borderRadius: 20 }}>Mes actual</span>
              )}
            </h2>
            <span style={{ fontSize: 13, color: C.gray400 }}>
              {vencimientosFiltrados.length} vencimiento{vencimientosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Badge verificado / pendiente */}
          {loading ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.gray100, border: `1px solid ${C.gray200}`, borderRadius: 8, padding: "6px 12px", marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: C.gray400 }}>Cargando fechas…</span>
            </div>
          ) : mesData.verificado ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "6px 12px", marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>✓</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
                Fechas verificadas — {usandoDB ? "Actualizadas automáticamente desde ARCA" : "Fuente: ARCA 2026"}
              </span>
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.amberLight, border: `1px solid #fcd34d`, borderRadius: 8, padding: "6px 12px", marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>⏳</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.amber }}>Fechas orientativas — Confirmá en{" "}
                <a href="https://www.afip.gob.ar/vencimientos/" target="_blank" rel="noopener noreferrer" style={{ color: C.amber }}>arca.gob.ar</a>
              </span>
            </div>
          )}

          {/* Lista */}
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
                const diasRestantes = mounted && v.dia ? getDiasRestantes(mesSeleccionado, v.dia) : null;
                const esCritico = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 5;
                const yaVencio = diasRestantes !== null && diasRestantes < 0;

                return (
                  <article key={key} style={{
                    border: `1.5px solid ${esCritico ? "#fca5a5" : v.pendiente ? "#fde68a" : C.gray200}`,
                    borderRadius: 14, overflow: "hidden", background: C.white,
                    opacity: yaVencio ? 0.55 : 1,
                  }}>
                    <button onClick={() => setExpandido(abierto ? null : key)} style={{
                      width: "100%", display: "flex", alignItems: "flex-start", gap: 16,
                      padding: "16px 18px", background: "none", border: "none", cursor: "pointer",
                      fontFamily: "'Nunito', sans-serif", textAlign: "left",
                    }}>
                      {/* Día o rango */}
                      <div style={{
                        minWidth: 56, textAlign: "center",
                        background: esCritico ? C.redLight : v.pendiente ? C.amberLight : yaVencio ? C.gray100 : C.tealLight,
                        borderRadius: 10, padding: "8px 4px", flexShrink: 0,
                      }}>
                        {v.dia ? (
                          <>
                            <p style={{ fontSize: 24, fontWeight: 800, color: esCritico ? C.red : yaVencio ? C.gray400 : C.teal, margin: 0, lineHeight: 1 }}>{v.dia}</p>
                            <p style={{ fontSize: 11, color: C.gray400, margin: "2px 0 0", fontWeight: 600 }}>{mesData.nombre.slice(0, 3).toUpperCase()}</p>
                          </>
                        ) : (
                          <p style={{ fontSize: 11, fontWeight: 700, color: v.pendiente ? C.amber : C.teal, margin: 0, lineHeight: 1.3 }}>{v.rango}</p>
                        )}
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
                          {v.pendiente && (
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: C.amberLight, color: C.amber }}>
                              A confirmar
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: C.gray900, margin: 0, lineHeight: 1.4 }}>{v.titulo}</p>
                        {esCritico && !yaVencio && (
                          <p style={{ fontSize: 12, fontWeight: 700, color: C.red, margin: "4px 0 0" }}>
                            ⚠ {diasRestantes === 0 ? "¡Vence hoy!" : `Vence en ${diasRestantes} día${diasRestantes !== 1 ? "s" : ""}`}
                          </p>
                        )}
                        {yaVencio && <p style={{ fontSize: 12, color: C.gray400, margin: "4px 0 0" }}>Ya venció</p>}
                      </div>
                      <span style={{ color: C.gray400, fontSize: 20, fontWeight: 300, marginTop: 4 }}>{abierto ? "−" : "+"}</span>
                    </button>

                    {abierto && (
                      <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.gray100}` }}>
                        <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7, margin: "14px 0 0" }}>{v.descripcion}</p>
                        {v.tipo === "recategorizacion" && (
                          <a href="/mi-categoria" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 14, fontWeight: 700, color: C.teal, textDecoration: "none" }}>
                            Verificar mi categoría →
                          </a>
                        )}
                        {v.pendiente && (
                          <a href="https://www.afip.gob.ar/vencimientos/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, fontSize: 14, fontWeight: 700, color: C.amber, textDecoration: "none" }}>
                            Ver fecha exacta en ARCA →
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

      {/* CTA */}
      <section style={{ borderTop: `1px solid ${C.gray200}`, background: C.gray50, padding: "52px 24px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.gray900, margin: "0 0 12px" }}>Recibí alertas antes de cada vencimiento</h2>
          <p style={{ fontSize: 15, color: C.gray500, margin: "0 0 24px", lineHeight: 1.6 }}>Activá las notificaciones por email y nunca más te lleguen multas por olvido.</p>
          <a href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: C.teal, color: C.white, padding: "14px 28px",
            borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none",
            fontFamily: "'Nunito', sans-serif",
          }}>Activar alertas gratis</a>
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          div[style*="grid-template-columns: 220px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
    </div>
    </>
  );
}
