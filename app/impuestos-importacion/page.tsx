"use client";

import { useState } from "react";
import Link from "next/link";

const CATEGORIAS_PRODUCTOS = [
  { label: "Electrónica / Computación", arancel: 0.35, iva: 0.21, estadistica: 0.03 },
  { label: "Ropa / Indumentaria", arancel: 0.35, iva: 0.21, estadistica: 0.03 },
  { label: "Calzado", arancel: 0.35, iva: 0.21, estadistica: 0.03 },
  { label: "Autopartes / Accesorios", arancel: 0.20, iva: 0.21, estadistica: 0.03 },
  { label: "Maquinaria industrial", arancel: 0.14, iva: 0.21, estadistica: 0.015 },
  { label: "Insumos / Materias primas", arancel: 0.06, iva: 0.21, estadistica: 0.015 },
  { label: "Alimentos / Bebidas", arancel: 0.20, iva: 0.105, estadistica: 0.03 },
  { label: "Libros / Publicaciones", arancel: 0, iva: 0, estadistica: 0 },
  { label: "Medicamentos / Farmacia", arancel: 0, iva: 0.105, estadistica: 0.015 },
  { label: "Juguetes", arancel: 0.35, iva: 0.21, estadistica: 0.03 },
];

const CANALES = [
  { label: "📦 Importación personal (courier/correo < USD 3.000)", tipo: "personal" },
  { label: "🏭 Importación comercial / empresa", tipo: "comercial" },
];

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function formatUSD(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function ImportacionesPage() {
  const [valorUSD, setValorUSD] = useState("");
  const [tipoCambio, setTipoCambio] = useState("1200");
  const [categoriaIdx, setCategoriaIdx] = useState(0);
  const [canal, setCanal] = useState("comercial");
  const [calculado, setCalculado] = useState(false);

  const usd = parseFloat(valorUSD) || 0;
  const tc = parseFloat(tipoCambio) || 1200;
  const valorARS = usd * tc;
  const cat = CATEGORIAS_PRODUCTOS[categoriaIdx];

  // Cálculo
  const arancelARS = valorARS * cat.arancel;
  const estadisticaARS = valorARS * cat.estadistica;
  const baseIVA = valorARS + arancelARS;
  const ivaARS = baseIVA * cat.iva;
  const totalImpuestos = arancelARS + estadisticaARS + ivaARS;
  const costoFinal = valorARS + totalImpuestos;
  const porcentajeTotal = usd > 0 ? (totalImpuestos / valorARS) * 100 : 0;

  // Personal < USD 3000
  const esExento = canal === "personal" && usd <= 200;
  const impuestoPersonal = canal === "personal" && usd > 200 ? Math.min(usd - 200, 2800) * tc * 0.50 : 0; // 50% sobre excedente simplificado

  return (
    <main style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8ed",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16
        }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.svg" alt="FacilFiscal" style={{ height: 48 }} />
        </Link>
        <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/iva" style={{ color: "#fde68a", textDecoration: "none", fontSize: 14 }}>IVA</Link>
          <Link href="/ingresos-brutos" style={{ color: "#fde68a", textDecoration: "none", fontSize: 14 }}>Ingresos Brutos</Link>
        </span>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
        color: "#fff", padding: "64px 24px 48px", textAlign: "center"
      }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          🌍 Importás algo? Sabé cuánto pagás antes de comprar
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          👉 Calculá los impuestos de<br />importación en Argentina
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 520, margin: "0 auto 28px" }}>
          Arancel + IVA + Tasa estadística: todo calculado según tu producto y canal de importación
        </p>
        <a href="#calculadora" style={{
          background: "#fbbf24", color: "#1c1917", fontWeight: 700,
          padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 16, display: "inline-block",
        }}>
          Calcular impuestos de importación ↓
        </a>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 12 }}>Estimación orientativa · Los aranceles exactos dependen de la posición arancelaria NCM</p>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "32px 28px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#b45309", marginBottom: 24, textAlign: "center" }}>
            🧮 Calculadora de Impuestos de Importación
          </h2>

          {/* Canal */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {CANALES.map(c => (
              <button
                key={c.tipo}
                onClick={() => { setCanal(c.tipo); setCalculado(false); }}
                style={{
                  padding: "12px 8px", borderRadius: 8, border: `2px solid ${canal === c.tipo ? "#b45309" : "#e5e7eb"}`,
                  background: canal === c.tipo ? "#fff7ed" : "#fff",
                  color: canal === c.tipo ? "#b45309" : "#6b7280",
                  fontWeight: canal === c.tipo ? 700 : 400, cursor: "pointer", fontSize: 13,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>💵 Valor del producto (USD)</label>
              <input
                type="number"
                placeholder="Ej: 500"
                value={valorUSD}
                onChange={e => { setValorUSD(e.target.value); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Valor CIF (costo + seguro + flete en USD)</p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>💱 Tipo de cambio oficial ($/USD)</label>
              <input
                type="number"
                placeholder="Ej: 1200"
                value={tipoCambio}
                onChange={e => { setTipoCambio(e.target.value); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Los aranceles se calculan al tipo de cambio oficial BCRA</p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>📦 Categoría del producto</label>
              <select
                value={categoriaIdx}
                onChange={e => { setCategoriaIdx(parseInt(e.target.value)); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 15, background: "#fff", boxSizing: "border-box" }}
              >
                {CATEGORIAS_PRODUCTOS.map((cat, i) => (
                  <option key={i} value={i}>{cat.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => { if (usd > 0) setCalculado(true); }}
              style={{
                background: "#b45309", color: "#fff", fontWeight: 700, padding: "14px",
                borderRadius: 8, border: "none", fontSize: 16, cursor: "pointer", width: "100%",
              }}
            >
              Calcular impuestos →
            </button>
          </div>

          {/* RESULTADO */}
          {calculado && usd > 0 && (
            <div style={{ marginTop: 28, borderTop: "2px solid #f3f4f6", paddingTop: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 16, textAlign: "center" }}>📋 Desglose de impuestos</h3>

              {canal === "personal" && esExento ? (
                <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "20px", textAlign: "center", border: "2px solid #86efac" }}>
                  <div style={{ fontSize: 32 }}>🎉</div>
                  <h4 style={{ color: "#166534", fontWeight: 700 }}>¡Exento de aranceles!</h4>
                  <p style={{ color: "#166534", fontSize: 14 }}>Los envíos personales de hasta USD 200 por mes están exentos de aranceles (régimen simplificado de importación personal).</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", background: "#fff7ed", padding: "12px 16px", borderRadius: 8 }}>
                    <span style={{ fontWeight: 600, color: "#92400e" }}>💵 Valor del producto</span>
                    <span style={{ fontWeight: 700 }}>{formatUSD(usd)} ({formatARS(valorARS)})</span>
                  </div>

                  {canal === "comercial" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "12px 16px", borderRadius: 8 }}>
                        <span style={{ color: "#374151" }}>📦 Arancel de importación ({(cat.arancel * 100).toFixed(0)}%)</span>
                        <span style={{ fontWeight: 600 }}>{formatARS(arancelARS)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "12px 16px", borderRadius: 8 }}>
                        <span style={{ color: "#374151" }}>📊 Tasa estadística ({(cat.estadistica * 100).toFixed(1)}%)</span>
                        <span style={{ fontWeight: 600 }}>{formatARS(estadisticaARS)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "12px 16px", borderRadius: 8 }}>
                        <span style={{ color: "#374151" }}>🔵 IVA ({(cat.iva * 100).toFixed(0)}%) sobre valor + arancel</span>
                        <span style={{ fontWeight: 600 }}>{formatARS(ivaARS)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#fef2f2", padding: "14px 16px", borderRadius: 8, border: "2px solid #fca5a5" }}>
                        <span style={{ fontWeight: 700, color: "#991b1b" }}>🔴 Total impuestos ({porcentajeTotal.toFixed(0)}% del valor)</span>
                        <span style={{ fontWeight: 800, color: "#991b1b", fontSize: 18 }}>{formatARS(totalImpuestos)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#111827", padding: "16px", borderRadius: 8 }}>
                        <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>💼 Costo final total en ARS</span>
                        <span style={{ fontWeight: 800, color: "#fbbf24", fontSize: 20 }}>{formatARS(costoFinal)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "12px 16px", borderRadius: 8 }}>
                        <span style={{ color: "#374151" }}>📦 Impuesto simplificado personal (~50% del excedente de USD 200)</span>
                        <span style={{ fontWeight: 600 }}>{formatARS(impuestoPersonal)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", background: "#fef2f2", padding: "14px 16px", borderRadius: 8, border: "2px solid #fca5a5" }}>
                        <span style={{ fontWeight: 700, color: "#991b1b" }}>🔴 Impuesto a pagar (estimado)</span>
                        <span style={{ fontWeight: 800, color: "#991b1b", fontSize: 18 }}>{formatARS(impuestoPersonal)}</span>
                      </div>
                      <div style={{ background: "#fff7ed", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#92400e" }}>
                        💡 El régimen simplificado de importación personal aplica a envíos de hasta USD 3.000 por año. El excedente sobre USD 200 tributa a una tasa del 50%.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* EXPLICACIÓN */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#b45309", marginBottom: 8 }}>¿Qué impuestos pagás al importar a Argentina?</h2>
          <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 32 }}>Guía simple sobre el sistema arancelario argentino</p>

          <div style={{ display: "grid", gap: 20 }}>
            {[
              { emoji: "📦", titulo: "Arancel de importación (Derecho de Importación)", texto: "Es el impuesto principal que cobra la Aduana argentina sobre el valor CIF del producto. Varía del 0% al 35% según la posición arancelaria NCM del producto. Argentina es parte del MERCOSUR y aplica el Arancel Externo Común (AEC)." },
              { emoji: "📊", titulo: "Tasa de Estadística", texto: "Una tasa del 3% que cobra la Aduana por los servicios estadísticos. Se aplica sobre el valor CIF. Tiene un límite máximo por operación (aproximadamente USD 2.000 en el máximo)." },
              { emoji: "🔵", titulo: "IVA de importación", texto: "El IVA (21% o 10.5%) se aplica sobre el valor CIF más el arancel. Además hay un IVA adicional del 20% para quienes no son Responsables Inscriptos. Como RI, podés tomar el IVA pagado en Aduana como crédito fiscal." },
              { emoji: "🌍", titulo: "Importación personal vs comercial", texto: "Para uso personal, los envíos de hasta USD 200/mes por courier están exentos. Del excedente hasta USD 3.000/año se paga el 50% de forma simplificada. Para importaciones comerciales, el proceso es por Aduana con SIM (Sistema Integral de Monitoreo)." },
            ].map(item => (
              <div key={item.titulo} style={{ display: "flex", gap: 16, padding: "20px", background: "#f8fafc", borderRadius: 12, borderLeft: "4px solid #b45309" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#b45309", margin: "0 0 8px" }}>{item.titulo}</h3>
                  <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#fff7ed", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #b45309, #78350f)",
            borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>¿Importás habitualmente?</h3>
            <p style={{ opacity: 0.85, marginBottom: 20 }}>Seguí todos tus vencimientos aduaneros e impositivos desde FácilFiscal.</p>
            <Link href="/" style={{ background: "#fbbf24", color: "#1c1917", fontWeight: 700, padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
              Activar alertas gratis →
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: "#78350f", color: "#fde68a", padding: "24px", textAlign: "center", fontSize: 14 }}>
        <p style={{ margin: 0 }}>© 2025 FácilFiscal · <Link href="/" style={{ color: "#fde68a" }}>Volver al inicio</Link></p>
      </footer>
    </main>
  );
}
