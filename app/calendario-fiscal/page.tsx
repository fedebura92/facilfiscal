"use client";

import { useState, useMemo, useEffect } from "react";
import SiteHeader from "@/components/SiteHeader"; // Importamos el header oficial

type Categoria = "monotributo" | "responsable" | "autonomo" | "empleador" | "todos";

interface Vencimiento {
  dia?: number;
  rango?: string;
  titulo: string;
  descripcion: string;
  categoria: Categoria[];
  tipo: "pago" | "presentacion" | "recategorizacion" | "declaracion";
  pendiente?: boolean;
}

interface MesData {
  mes: number;
  nombre: string;
  verificado: boolean;
  vencimientos: Vencimiento[];
}

const C = {
  teal:        "#1d5c27",
  tealDark:    "#1a1f64",
  tealLight:   "#e6f4f3",
  gold:        "#d97706",
  goldLight:   "#fef3c7",
  white:       "#ffffff",
  gray50:      "#f9fafb",
  gray100:     "#f3f4f6",
  gray200:     "#e5e7eb",
  gray400:     "#9ca3af",
  gray500:     "#6b7280",
  gray900:     "#111827",
  amber:       "#b45309",
};

export default function CalendarioFiscalClient() {
  const [filtro, setFiltro] = useState<Categoria>("todos");

  // Datos de ejemplo (acortados para brevedad)
  const meses: MesData[] = [
    {
      mes: 4,
      nombre: "Abril 2026",
      verificado: true,
      vencimientos: [
        { dia: 20, titulo: "Monotributo: Cuota Mensual", descripcion: "Vencimiento del pago de la cuota unificada correspondiente a Abril.", categoria: ["monotributo"], tipo: "pago" },
        { dia: 22, titulo: "IVA y Libro de IVA Digital", descripcion: "Presentación y pago para CUITs terminados en 0-1.", categoria: ["responsable"], tipo: "presentacion" },
      ]
    },
  ];

  const datosFiltrados = useMemo(() => {
    return meses.map(m => ({
      ...m,
      vencimientos: m.vencimientos.filter(v => filtro === "todos" || v.categoria.includes(filtro))
    })).filter(m => m.vencimientos.length > 0);
  }, [filtro]);

  return (
    <div style={{ background: C.gray50, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header con fondo blanco y logo */}
      <SiteHeader currentPath="/calendario-fiscal" />

      {/* Contenedor con padding-top para compensar el header fijo */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "120px 20px 80px" }}>
        
        <header style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: C.gray900, marginBottom: 12, letterSpacing: "-0.02em" }}>
            Calendario Fiscal 2026
          </h1>
          <p style={{ fontSize: 17, color: C.gray500, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Todas las fechas de vencimientos de AFIP/ARCA actualizadas para que no se te pase ningún pago.
          </p>

          {/* Filtros */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {(["todos", "monotributo", "responsable", "autonomo"] as Categoria[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltro(cat)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1.5px solid",
                  borderColor: filtro === cat ? C.teal : C.gray200,
                  background: filtro === cat ? C.teal : C.white,
                  color: filtro === cat ? C.white : C.gray500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textTransform: "capitalize"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {/* Listado de Meses */}
        {datosFiltrados.map((mes) => (
          <section key={mes.mes} style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.gray900 }}>{mes.nombre}</h2>
              {mes.verificado && (
                <span style={{ fontSize: 11, fontWeight: 700, background: C.tealLight, color: C.teal, padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                  Confirmado ARCA
                </span>
              )}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {mes.vencimientos.map((v, i) => (
                <article key={i} style={{ background: C.white, padding: 20, borderRadius: 16, border: `1px solid ${C.gray200}`, display: "flex", gap: 20 }}>
                  <div style={{ textAlign: "center", minWidth: 50 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: C.teal, display: "block" }}>{v.dia || "--"}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.gray400, textTransform: "uppercase" }}>Día</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.gray900, marginBottom: 4 }}>{v.titulo}</h3>
                    <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.5 }}>{v.descripcion}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer / CTA final */}
      <section style={{ borderTop: `1px solid ${C.gray200}`, background: C.white, padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.gray900, marginBottom: 8 }}>Recibí alertas en tu email</h2>
        <p style={{ color: C.gray500, marginBottom: 24 }}>Te avisamos 48hs antes de cada vencimiento según tu categoría.</p>
        <a href="/" style={{ background: C.teal, color: C.white, padding: "14px 32px", borderRadius: 12, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
          Activar Alertas Gratis
        </a>
      </section>
    </div>
  );
}