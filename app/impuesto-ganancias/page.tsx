"use client";

import { useState } from "react";
import Link from "next/link";

// Escala de Ganancias 2024 (valores aproximados para personas físicas)
const ESCALA_GANANCIAS = [
  { desde: 0, hasta: 1200000, alicuota: 0.05, fijo: 0 },
  { desde: 1200000, hasta: 2400000, alicuota: 0.09, fijo: 60000 },
  { desde: 2400000, hasta: 3600000, alicuota: 0.12, fijo: 168000 },
  { desde: 3600000, hasta: 5400000, alicuota: 0.15, fijo: 312000 },
  { desde: 5400000, hasta: 10800000, alicuota: 0.19, fijo: 582000 },
  { desde: 10800000, hasta: 16200000, alicuota: 0.23, fijo: 1608000 },
  { desde: 16200000, hasta: 27000000, alicuota: 0.27, fijo: 2850000 },
  { desde: 27000000, hasta: 54000000, alicuota: 0.31, fijo: 5766000 },
  { desde: 54000000, hasta: Infinity, alicuota: 0.35, fijo: 14142000 },
];

const MNI_SOLTERO = 2700000; // Mínimo No Imponible aprox 2024
const MNI_CASADO = 3000000;

function calcularGanancias(gananciaAnual: number, mni: number) {
  const gananciaImponible = Math.max(0, gananciaAnual - mni);
  if (gananciaImponible <= 0) return { impuesto: 0, alicuota: 0, gananciaImponible: 0 };

  const tramo = ESCALA_GANANCIAS.find(t => gananciaImponible >= t.desde && gananciaImponible < t.hasta);
  if (!tramo) return { impuesto: 0, alicuota: 0, gananciaImponible: 0 };

  const impuesto = tramo.fijo + (gananciaImponible - tramo.desde) * tramo.alicuota;
  return { impuesto, alicuota: tramo.alicuota, gananciaImponible };
}

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function GananciasPage() {
  const [tipo, setTipo] = useState<"relacion" | "autonomo">("relacion");
  const [estadoCivil, setEstadoCivil] = useState<"soltero" | "casado">("soltero");
  const [ingresos, setIngresos] = useState("");
  const [deducciones, setDeducciones] = useState("");
  const [calculado, setCalculado] = useState(false);

  const ingresosAnual = (parseFloat(ingresos) || 0) * 12;
  const deduccionesAnual = (parseFloat(deducciones) || 0) * 12;
  const mni = estadoCivil === "casado" ? MNI_CASADO : MNI_SOLTERO;
  const gananciaAnual = Math.max(0, ingresosAnual - deduccionesAnual);
  const { impuesto, alicuota, gananciaImponible } = calcularGanancias(gananciaAnual, mni);
  const anticipoMensual = impuesto / 12;

  return (
    <main style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "#7c3aed", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.svg" alt="FacilFiscal" style={{ height: 48 }} />
        </Link>
        <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/iva" style={{ color: "#ddd6fe", textDecoration: "none", fontSize: 14 }}>IVA</Link>
          <Link href="/ingresos-brutos" style={{ color: "#ddd6fe", textDecoration: "none", fontSize: 14 }}>Ingresos Brutos</Link>
        </span>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
        color: "#fff", padding: "64px 24px 48px", textAlign: "center"
      }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          📊 El impuesto más complejo — te lo simplificamos
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          👉 Calculá cuánto Impuesto a<br />las Ganancias tenés que pagar
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 520, margin: "0 auto 28px" }}>
          Ingresá tus ingresos y deducciones — te calculamos el impuesto y los anticipos mensuales
        </p>
        <a href="#calculadora" style={{
          background: "#fbbf24", color: "#1c1917", fontWeight: 700,
          padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 16, display: "inline-block",
        }}>
          Calcular Ganancias gratis ↓
        </a>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 12 }}>Estimación orientativa · Para una declaración exacta consultá a tu contador</p>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "32px 28px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed", marginBottom: 24, textAlign: "center" }}>
            🧮 Calculadora de Ganancias
          </h2>

          {/* Tipo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { key: "relacion", label: "👔 Relación de dependencia" },
              { key: "autonomo", label: "💼 Autónomo / Empresa" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTipo(t.key as "relacion" | "autonomo")}
                style={{
                  padding: "12px", borderRadius: 8, border: `2px solid ${tipo === t.key ? "#7c3aed" : "#e5e7eb"}`,
                  background: tipo === t.key ? "#f5f3ff" : "#fff",
                  color: tipo === t.key ? "#7c3aed" : "#6b7280",
                  fontWeight: tipo === t.key ? 700 : 400, cursor: "pointer", fontSize: 14,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>👨‍👩‍👧 Estado civil</label>
              <select
                value={estadoCivil}
                onChange={e => setEstadoCivil(e.target.value as "soltero" | "casado")}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 15, background: "#fff", boxSizing: "border-box" }}
              >
                <option value="soltero">Soltero/a — MNI: {formatARS(MNI_SOLTERO)}/año</option>
                <option value="casado">Casado/a con cónyuge a cargo — MNI: {formatARS(MNI_CASADO)}/año</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>💰 Ingreso mensual bruto</label>
              <input
                type="number"
                placeholder="Ej: 1500000"
                value={ingresos}
                onChange={e => { setIngresos(e.target.value); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Sueldo bruto o ingresos mensuales antes de descuentos</p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>📉 Deducciones mensuales (opcional)</label>
              <input
                type="number"
                placeholder="Ej: 50000"
                value={deducciones}
                onChange={e => { setDeducciones(e.target.value); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Gastos deducibles: alquiler, medicina prepaga, honorarios, etc.</p>
            </div>

            <button
              onClick={() => { if (parseFloat(ingresos) > 0) setCalculado(true); }}
              style={{
                background: "#7c3aed", color: "#fff", fontWeight: 700, padding: "14px",
                borderRadius: 8, border: "none", fontSize: 16, cursor: "pointer", width: "100%",
              }}
            >
              Calcular mi Impuesto a las Ganancias →
            </button>
          </div>

          {/* RESULTADO */}
          {calculado && parseFloat(ingresos) > 0 && (
            <div style={{ marginTop: 28, borderTop: "2px solid #f3f4f6", paddingTop: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 16, textAlign: "center" }}>📋 Tu resultado estimado</h3>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#f5f3ff", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#5b21b6" }}>📊 Ingresos anuales</span>
                  <span style={{ fontWeight: 700 }}>{formatARS(ingresosAnual)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#f5f3ff", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#5b21b6" }}>📉 MNI + Deducciones</span>
                  <span style={{ fontWeight: 700 }}>−{formatARS(mni + deduccionesAnual)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#ede9fe", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#5b21b6" }}>🎯 Base imponible</span>
                  <span style={{ fontWeight: 700 }}>{formatARS(gananciaImponible)}</span>
                </div>
                {gananciaImponible > 0 ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#fef2f2", padding: "16px", borderRadius: 8, border: "2px solid #fca5a5" }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: "#991b1b" }}>🔴 Ganancias anual</span>
                      <span style={{ fontWeight: 800, fontSize: 20, color: "#991b1b" }}>{formatARS(impuesto)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#fff7ed", padding: "12px 16px", borderRadius: 8, border: "1px solid #fed7aa" }}>
                      <span style={{ fontWeight: 600, color: "#92400e" }}>📆 Anticipo mensual estimado</span>
                      <span style={{ fontWeight: 700, color: "#92400e" }}>{formatARS(anticipoMensual)}</span>
                    </div>
                    <div style={{ background: "#f0fdf4", padding: "12px 16px", borderRadius: 8, fontSize: 14, color: "#166534" }}>
                      📊 Alícuota marginal: <strong>{(alicuota * 100).toFixed(0)}%</strong>
                    </div>
                  </>
                ) : (
                  <div style={{ background: "#f0fdf4", padding: "16px", borderRadius: 8, border: "2px solid #86efac", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
                    <strong style={{ color: "#166534" }}>¡No pagás Ganancias!</strong>
                    <p style={{ color: "#166534", fontSize: 14, margin: "4px 0 0" }}>Tus ingresos están por debajo del Mínimo No Imponible</p>
                  </div>
                )}
              </div>
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "12px 16px", marginTop: 16, fontSize: 13, color: "#92400e" }}>
                ⚠️ Esta es una estimación simplificada. Los valores del MNI y la escala se actualizan periódicamente por resolución de AFIP. Consultá con un contador para tu declaración jurada real.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* EXPLICACIÓN */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#7c3aed", marginBottom: 8 }}>¿Qué es el Impuesto a las Ganancias?</h2>
          <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 32 }}>El impuesto más complejo del sistema argentino — explicado simple</p>

          <div style={{ display: "grid", gap: 20 }}>
            {[
              { emoji: "🤔", titulo: "¿Qué es?", texto: "El Impuesto a las Ganancias (Ley 20.628) grava las rentas que obtienen personas físicas y jurídicas en Argentina. A diferencia de Ingresos Brutos, no se paga sobre lo que facturás sino sobre lo que ganás (ingreso menos gastos)." },
              { emoji: "⚙️", titulo: "¿Cómo funciona?", texto: "Tiene cuatro categorías de renta: Primera (inmuebles), Segunda (capitales), Tercera (empresas y autónomos), Cuarta (trabajo personal). La escala es progresiva: cuanto más ganás, mayor es la alícuota que pagás sobre el tramo adicional." },
              { emoji: "👤", titulo: "¿Quién lo paga?", texto: "Personas en relación de dependencia que superan el Mínimo No Imponible, autónomos y profesionales independientes, empresas y sociedades. Los monotributistas no pagan Ganancias de forma separada (está incluido en su cuota)." },
              { emoji: "📅", titulo: "¿Cuándo se paga?", texto: "La declaración jurada anual se presenta entre abril y junio del año siguiente. Pero durante el año se pagan 10 anticipos mensuales (entre junio y marzo) calculados sobre el impuesto del año anterior." },
              { emoji: "🧮", titulo: "¿Cómo se calcula?", texto: "Base imponible = Ingresos − Gastos deducibles − Mínimo No Imponible − Cargas de familia. Sobre esa base se aplica la escala progresiva (5% al 35%). El empleador retiene el impuesto directamente del sueldo en relación de dependencia." },
            ].map(item => (
              <div key={item.titulo} style={{ display: "flex", gap: 16, padding: "20px", background: "#f8fafc", borderRadius: 12, borderLeft: "4px solid #7c3aed" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#7c3aed", margin: "0 0 8px" }}>{item.titulo}</h3>
                  <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Escala */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, color: "#111827", marginBottom: 16 }}>📊 Escala progresiva de Ganancias 2024</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#7c3aed", color: "#fff" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left" }}>Ganancia neta imponible</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Alícuota</th>
                  </tr>
                </thead>
                <tbody>
                  {ESCALA_GANANCIAS.map((t, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff" }}>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>
                        {t.hasta === Infinity
                          ? `Más de ${formatARS(t.desde)}`
                          : `${formatARS(t.desde)} — ${formatARS(t.hasta)}`}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: "#7c3aed", textAlign: "right" }}>
                        {(t.alicuota * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>* Valores orientativos 2024. La escala se actualiza por ley/resolución AFIP.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#f5f3ff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
            borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>No te olvides de los anticipos de Ganancias</h3>
            <p style={{ opacity: 0.85, marginBottom: 20 }}>Te avisamos antes de cada vencimiento. Gratis, sin spam.</p>
            <Link href="/" style={{ background: "#fbbf24", color: "#1c1917", fontWeight: 700, padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
              Activar alertas gratis →
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: "#4c1d95", color: "#ddd6fe", padding: "24px", textAlign: "center", fontSize: 14 }}>
        <p style={{ margin: 0 }}>© 2025 FácilFiscal · <Link href="/" style={{ color: "#ddd6fe" }}>Volver al inicio</Link></p>
      </footer>
    </main>
  );
}
