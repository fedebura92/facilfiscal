"use client";

import { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

// Si querés agregar metadata estática, creá un archivo metadata.ts separado
// export const metadata: Metadata = {
//   title: "Calculá tu IVA gratis | FácilFiscal",
//   description: "Calculá cuánto IVA tenés que pagar en segundos. Ingresá tus ventas y compras y te decimos cuánto pagar a AFIP.",
// };

const ALICUOTAS = [
  { label: "21% — Tasa general", value: 0.21 },
  { label: "10.5% — Tasa reducida (alimentos, medicina)", value: 0.105 },
  { label: "27% — Tasa diferencial (servicios públicos)", value: 0.27 },
  { label: "2.5% — Servicios de exportación", value: 0.025 },
  { label: "0% — Exento", value: 0 },
];

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function IVAPage() {
  const [ventas, setVentas] = useState("");
  const [compras, setCompras] = useState("");
  const [alicuota, setAlicuota] = useState(0.21);
  const [calculado, setCalculado] = useState(false);

  const ventasNum = parseFloat(ventas.replace(/\./g, "").replace(",", ".")) || 0;
  const comprasNum = parseFloat(compras.replace(/\./g, "").replace(",", ".")) || 0;
  const debito = ventasNum * alicuota;
  const credito = comprasNum * alicuota;
  const saldo = debito - credito;

  return (
    <main style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "#0f766e", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/" style={{ color: "#fff", fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
          🧾 FácilFiscal
        </Link>
        <span style={{ color: "#99f6e4", fontSize: 14, marginLeft: "auto" }}>
          <Link href="/ingresos-brutos" style={{ color: "#99f6e4", textDecoration: "none", marginRight: 16 }}>Ingresos Brutos</Link>
          <Link href="/impuesto-ganancias" style={{ color: "#99f6e4", textDecoration: "none", marginRight: 16 }}>Ganancias</Link>
          <Link href="/impuestos-importacion" style={{ color: "#99f6e4", textDecoration: "none" }}>Importaciones</Link>
        </span>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0f766e 0%, #134e4a 100%)",
        color: "#fff",
        padding: "64px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          💡 El impuesto que más confunde a los argentinos
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          👉 Calculá cuánto IVA<br />tenés que pagar en segundos
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 520, margin: "0 auto 28px" }}>
          Ingresá tus ventas y compras y te decimos exactamente cuánto pagar a AFIP
        </p>
        <a href="#calculadora" style={{
          background: "#fbbf24",
          color: "#1c1917",
          fontWeight: 700,
          padding: "14px 32px",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 16,
          display: "inline-block",
        }}>
          Calcular IVA gratis ↓
        </a>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 12 }}>Sin registro · Sin tarjeta · Gratis</p>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "32px 28px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f766e", marginBottom: 24, textAlign: "center" }}>
            🧮 Calculadora de IVA
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Ventas del mes (sin IVA) 💰
              </label>
              <input
                type="number"
                placeholder="Ej: 500000"
                value={ventas}
                onChange={e => setVentas(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8,
                  fontSize: 16, boxSizing: "border-box", outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = "#0f766e"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>El monto que facturaste sin incluir el IVA</p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Compras del mes (sin IVA) 🛒
              </label>
              <input
                type="number"
                placeholder="Ej: 200000"
                value={compras}
                onChange={e => setCompras(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8,
                  fontSize: 16, boxSizing: "border-box", outline: "none",
                }}
                onFocus={e => e.target.style.borderColor = "#0f766e"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Lo que compraste con facturas A (que tienen IVA)</p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                Alícuota de IVA 📊
              </label>
              <select
                value={alicuota}
                onChange={e => setAlicuota(parseFloat(e.target.value))}
                style={{
                  width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8,
                  fontSize: 15, boxSizing: "border-box", background: "#fff",
                }}
              >
                {ALICUOTAS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCalculado(true)}
              style={{
                background: "#0f766e", color: "#fff", fontWeight: 700, padding: "14px",
                borderRadius: 8, border: "none", fontSize: 16, cursor: "pointer", width: "100%",
              }}
            >
              Calcular mi IVA →
            </button>
          </div>

          {/* RESULTADO */}
          {calculado && ventasNum > 0 && (
            <div style={{ marginTop: 28, borderTop: "2px solid #f3f4f6", paddingTop: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 16, textAlign: "center" }}>📋 Tu resultado</h3>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#166534" }}>🟢 IVA débito (por tus ventas)</span>
                  <span style={{ fontWeight: 700, color: "#166534" }}>{formatARS(debito)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#fef9c3", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#713f12" }}>🟡 IVA crédito (por tus compras)</span>
                  <span style={{ fontWeight: 700, color: "#713f12" }}>{formatARS(credito)}</span>
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  background: saldo > 0 ? "#fef2f2" : "#f0fdf4",
                  padding: "16px", borderRadius: 8, border: `2px solid ${saldo > 0 ? "#fca5a5" : "#86efac"}`,
                }}>
                  <span style={{ fontWeight: 700, fontSize: 17, color: saldo > 0 ? "#991b1b" : "#166534" }}>
                    {saldo > 0 ? "🔴 IVA a pagar a AFIP" : "🟢 Saldo a favor"}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: saldo > 0 ? "#991b1b" : "#166534" }}>{formatARS(Math.abs(saldo))}</span>
                </div>
              </div>
              {saldo > 0 && (
                <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "12px 16px", marginTop: 16, fontSize: 14 }}>
                  ⏰ <strong>Acordate:</strong> tenés que pagar este IVA antes del vencimiento del mes. <Link href="/" style={{ color: "#0f766e", fontWeight: 600 }}>Activá tus alertas gratis →</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* EXPLICACIÓN SIMPLE */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f766e", marginBottom: 8 }}>¿Qué es el IVA?</h2>
          <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 32 }}>Explicado en lenguaje simple, sin tecnicismos</p>

          <div style={{ display: "grid", gap: 20 }}>
            {[
              {
                emoji: "🤔",
                titulo: "¿Qué es?",
                texto: "El IVA (Impuesto al Valor Agregado) es un impuesto que pagamos todos cada vez que compramos algo. Está incluido en el precio de casi todo lo que consumís: la factura del supermercado, el servicio de internet, la ropa, etc."
              },
              {
                emoji: "⚙️",
                titulo: "¿Cómo funciona?",
                texto: "Funciona en cadena: cada empresa le cobra IVA a sus clientes (débito fiscal) y a su vez le paga IVA a sus proveedores (crédito fiscal). Al final del mes, le pagás a AFIP solo la diferencia. Si compraste más de lo que vendiste, tenés saldo a favor."
              },
              {
                emoji: "👤",
                titulo: "¿Quién lo paga?",
                texto: "Lo pagan los Responsables Inscriptos (RI). Si sos Monotributista, el IVA ya está incluido en tu cuota mensual y no presentás declaración de IVA por separado. Los consumidores finales también lo pagan, pero incluido en el precio."
              },
              {
                emoji: "📅",
                titulo: "¿Cuándo se paga?",
                texto: "Se paga mensualmente. El vencimiento depende del último dígito de tu CUIT. Generalmente cae entre los días 18 y 23 de cada mes siguiente al declarado. Por ejemplo, el IVA de enero se paga en febrero."
              },
              {
                emoji: "🧮",
                titulo: "¿Cómo se calcula?",
                texto: "Es simple: IVA a pagar = IVA débito (ventas × 21%) − IVA crédito (compras × 21%). Si vendiste $1.000.000 y compraste $400.000, tu IVA es: $210.000 − $84.000 = $126.000 a pagar."
              },
            ].map(item => (
              <div key={item.titulo} style={{ display: "flex", gap: 16, padding: "20px", background: "#f8fafc", borderRadius: 12, borderLeft: "4px solid #0f766e" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#0f766e", margin: "0 0 8px" }}>{item.titulo}</h3>
                  <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Alícuotas */}
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, color: "#111827", marginBottom: 16 }}>📊 Alícuotas de IVA en Argentina</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#0f766e", color: "#fff" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Tasa</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Se aplica a...</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["21%", "Tasa general — la mayoría de bienes y servicios"],
                    ["10.5%", "Alimentos básicos, medicamentos, libros, construcción"],
                    ["27%", "Servicios públicos (luz, gas, agua) para empresas"],
                    ["2.5%", "Algunos servicios relacionados con exportaciones"],
                    ["0%", "Exportaciones de bienes, productos exentos por ley"],
                  ].map(([tasa, desc], i) => (
                    <tr key={tasa} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f766e" }}>{tasa}</td>
                      <td style={{ padding: "10px 14px", color: "#374151" }}>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAS */}
      <section style={{ background: "#f0fdf4", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>🆚 IVA vs otros impuestos</h2>
          <p style={{ color: "#6b7280", marginBottom: 28 }}>¿En qué se diferencia el IVA de lo que ya pagás?</p>
          <div style={{ display: "grid", gap: 16 }}>
            {[
              {
                vsTitle: "IVA vs Ingresos Brutos",
                items: [
                  ["IVA", "Nacional (AFIP)", "Solo Resp. Inscriptos", "Débito − Crédito"],
                  ["Ingresos Brutos", "Provincial (ARBA, AGIP...)", "Casi todos los que facturan", "% sobre ventas brutas"],
                ]
              },
              {
                vsTitle: "IVA vs Ganancias",
                items: [
                  ["IVA", "Impuesto al consumo", "Mensual", "Sobre las ventas"],
                  ["Ganancias", "Impuesto a la renta", "Anual (anticipos mensuales)", "Sobre la ganancia neta"],
                ]
              }
            ].map(comp => (
              <div key={comp.vsTitle} style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 700, color: "#0f766e", marginBottom: 14 }}>{comp.vsTitle}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {comp.items.map(([nombre, org, quien, base]) => (
                    <div key={nombre} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px" }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{nombre}</div>
                      <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                        🏛️ {org}<br />👤 {quien}<br />📐 {base}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENCIMIENTOS */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 24 }}>📅 Vencimientos y obligaciones</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { emoji: "📆", titulo: "Frecuencia", desc: "Mensual — cada mes sin excepción" },
              { emoji: "🕐", titulo: "Cuándo", desc: "Días 18 al 23 del mes siguiente según CUIT" },
              { emoji: "📝", titulo: "Declaración", desc: "F. 2002 vía AFIP Cuentas Tributarias" },
              { emoji: "💳", titulo: "Pago", desc: "VEP desde home banking o Rapipago" },
            ].map(item => (
              <div key={item.titulo} style={{ background: "#f8fafc", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.emoji}</div>
                <div style={{ fontWeight: 700, color: "#0f766e", marginBottom: 4 }}>{item.titulo}</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>{item.desc}</div>
              </div>
            ))}
          </div>
          {/* CTA Alertas */}
          <div style={{
            background: "linear-gradient(135deg, #0f766e, #134e4a)",
            borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>¿No querés olvidarte del vencimiento?</h3>
            <p style={{ opacity: 0.85, marginBottom: 20 }}>Te avisamos antes del vencimiento del IVA por email. Gratis, sin spam.</p>
            <Link href="/" style={{
              background: "#fbbf24", color: "#1c1917", fontWeight: 700,
              padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontSize: 15
            }}>
              Activar alertas gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#f8fafc", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 24 }}>❓ Preguntas frecuentes</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["¿Los monotributistas pagan IVA?", "No de forma separada. El IVA está incluido en tu cuota mensual de monotributo. No presentás declaración de IVA ni tenés débito/crédito fiscal."],
              ["¿Qué pasa si tengo saldo a favor de IVA?", "Si tu crédito fiscal (compras) supera tu débito fiscal (ventas), tenés saldo a favor. Podés trasladarlo al mes siguiente o pedirte una acreditación/devolución a AFIP."],
              ["¿Tengo que pagar IVA si no facturé nada en el mes?", "Sí, igualmente tenés que presentar la declaración jurada aunque sea en cero. Si no lo hacés, AFIP te puede aplicar una multa."],
              ["¿Qué es el IVA incluido vs IVA discriminado?", "En las facturas A el IVA va discriminado (separado del precio). En las facturas B y C va incluido en el precio total. Como RI, vos emitís facturas A con IVA discriminado."],
            ].map(([pregunta, respuesta]) => (
              <details key={pregunta} style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
                <summary style={{ fontWeight: 600, cursor: "pointer", color: "#111827", listStyle: "none" }}>
                  <span>▶ {pregunta}</span>
                </summary>
                <p style={{ color: "#6b7280", marginTop: 12, lineHeight: 1.6, marginBottom: 0 }}>{respuesta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#134e4a", color: "#99f6e4", padding: "24px", textAlign: "center", fontSize: 14 }}>
        <p style={{ margin: 0 }}>© 2025 FácilFiscal · <Link href="/" style={{ color: "#99f6e4" }}>Volver al inicio</Link></p>
      </footer>
    </main>
  );
}
