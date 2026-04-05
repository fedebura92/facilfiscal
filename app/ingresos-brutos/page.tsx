"use client";

import { useState } from "react";
import Link from "next/link";

const PROVINCIAS: Record<string, { alicuota: number; nombre: string; organo: string }> = {
  buenos_aires: { alicuota: 0.035, nombre: "Buenos Aires", organo: "ARBA" },
  caba: { alicuota: 0.03, nombre: "CABA", organo: "AGIP" },
  cordoba: { alicuota: 0.04, nombre: "Córdoba", organo: "DGR Córdoba" },
  santa_fe: { alicuota: 0.035, nombre: "Santa Fe", organo: "API Santa Fe" },
  mendoza: { alicuota: 0.035, nombre: "Mendoza", organo: "ATM Mendoza" },
  tucuman: { alicuota: 0.04, nombre: "Tucumán", organo: "DGR Tucumán" },
  salta: { alicuota: 0.04, nombre: "Salta", organo: "DGR Salta" },
  entre_rios: { alicuota: 0.04, nombre: "Entre Ríos", organo: "DGR Entre Ríos" },
  misiones: { alicuota: 0.04, nombre: "Misiones", organo: "DGR Misiones" },
  corrientes: { alicuota: 0.035, nombre: "Corrientes", organo: "DGR Corrientes" },
  chaco: { alicuota: 0.04, nombre: "Chaco", organo: "DGR Chaco" },
  san_juan: { alicuota: 0.04, nombre: "San Juan", organo: "AFIP-DGR SJ" },
  san_luis: { alicuota: 0.035, nombre: "San Luis", organo: "DGR San Luis" },
  la_pampa: { alicuota: 0.035, nombre: "La Pampa", organo: "DGR La Pampa" },
  neuquen: { alicuota: 0.035, nombre: "Neuquén", organo: "DPR Neuquén" },
  rio_negro: { alicuota: 0.04, nombre: "Río Negro", organo: "DGR Río Negro" },
  chubut: { alicuota: 0.04, nombre: "Chubut", organo: "DGI Chubut" },
  santa_cruz: { alicuota: 0.04, nombre: "Santa Cruz", organo: "DGR Santa Cruz" },
  tierra_del_fuego: { alicuota: 0.025, nombre: "Tierra del Fuego", organo: "DGR TDF" },
  jujuy: { alicuota: 0.04, nombre: "Jujuy", organo: "DGR Jujuy" },
  catamarca: { alicuota: 0.04, nombre: "Catamarca", organo: "DGR Catamarca" },
  la_rioja: { alicuota: 0.04, nombre: "La Rioja", organo: "DGR La Rioja" },
  santiago: { alicuota: 0.04, nombre: "Santiago del Estero", organo: "DGR Santiago" },
  formosa: { alicuota: 0.04, nombre: "Formosa", organo: "DGR Formosa" },
};

const ACTIVIDADES = [
  { label: "Comercio / Reventa", extra: 0 },
  { label: "Servicios profesionales", extra: 0.005 },
  { label: "Construcción", extra: 0 },
  { label: "Industria / Manufactura", extra: -0.005 },
  { label: "Agropecuario / Primario", extra: -0.01 },
];

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function IngresosBrutosPage() {
  const [provincia, setProvincia] = useState("");
  const [actividad, setActividad] = useState(0);
  const [ingresos, setIngresos] = useState("");
  const [calculado, setCalculado] = useState(false);

  const ingresosNum = parseFloat(ingresos) || 0;
  const provData = provincia ? PROVINCIAS[provincia] : null;
  const actExtra = ACTIVIDADES[actividad]?.extra || 0;
  const alicuotaFinal = provData ? Math.max(0, provData.alicuota + actExtra) : 0;
  const ibAPagar = ingresosNum * alicuotaFinal;

  return (
    <main style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #e2e8ed",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16
        }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/logo.svg" alt="FacilFiscal" style={{ height: 48 }} />
        </Link>
        <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/iva" style={{ color: "#bfdbfe", textDecoration: "none", fontSize: 14 }}>IVA</Link>
          <Link href="/impuesto-ganancias" style={{ color: "#bfdbfe", textDecoration: "none", fontSize: 14 }}>Ganancias</Link>
          <Link href="/impuestos-por-provincia" style={{ color: "#bfdbfe", textDecoration: "none", fontSize: 14 }}>Por provincia</Link>
        </span>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
        color: "#fff", padding: "64px 24px 48px", textAlign: "center"
      }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          🗺️ Varía según tu provincia — calculalo bien
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          👉 Calculá tus Ingresos Brutos<br />según tu provincia
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 520, margin: "0 auto 28px" }}>
          Seleccioná tu provincia y actividad, y te decimos exactamente cuánto pagar
        </p>
        <a href="#calculadora" style={{
          background: "#fbbf24", color: "#1c1917", fontWeight: 700,
          padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 16, display: "inline-block",
        }}>
          Calcular Ingresos Brutos gratis ↓
        </a>
        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 12 }}>Sin registro · Sin tarjeta · Gratis</p>
      </section>

      {/* CALCULADORA */}
      <section id="calculadora" style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "32px 28px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1d4ed8", marginBottom: 24, textAlign: "center" }}>
            🧮 Calculadora de Ingresos Brutos
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>🗺️ Provincia</label>
              <select
                value={provincia}
                onChange={e => { setProvincia(e.target.value); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 15, background: "#fff", boxSizing: "border-box" }}
              >
                <option value="">— Seleccioná tu provincia —</option>
                {Object.entries(PROVINCIAS).sort((a, b) => a[1].nombre.localeCompare(b[1].nombre)).map(([key, val]) => (
                  <option key={key} value={key}>{val.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>💼 Tipo de actividad</label>
              <select
                value={actividad}
                onChange={e => { setActividad(parseInt(e.target.value)); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 15, background: "#fff", boxSizing: "border-box" }}
              >
                {ACTIVIDADES.map((a, i) => (
                  <option key={i} value={i}>{a.label}</option>
                ))}
              </select>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>La alícuota puede variar según tu actividad específica</p>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>💰 Ingresos brutos del mes</label>
              <input
                type="number"
                placeholder="Ej: 800000"
                value={ingresos}
                onChange={e => { setIngresos(e.target.value); setCalculado(false); }}
                style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 16, boxSizing: "border-box" }}
              />
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>El total de lo que facturaste este mes (sin importar si cobraste o no)</p>
            </div>

            <button
              onClick={() => { if (provincia && ingresosNum > 0) setCalculado(true); }}
              disabled={!provincia || ingresosNum <= 0}
              style={{
                background: provincia && ingresosNum > 0 ? "#1d4ed8" : "#e5e7eb",
                color: provincia && ingresosNum > 0 ? "#fff" : "#9ca3af",
                fontWeight: 700, padding: "14px", borderRadius: 8, border: "none", fontSize: 16, cursor: provincia && ingresosNum > 0 ? "pointer" : "not-allowed", width: "100%",
              }}
            >
              Calcular mis Ingresos Brutos →
            </button>
          </div>

          {/* RESULTADO */}
          {calculado && provData && (
            <div style={{ marginTop: 28, borderTop: "2px solid #f3f4f6", paddingTop: 24 }}>
              <h3 style={{ fontWeight: 700, color: "#111827", marginBottom: 16, textAlign: "center" }}>📋 Tu resultado</h3>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#eff6ff", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#1e40af" }}>🗺️ Provincia</span>
                  <span style={{ fontWeight: 700, color: "#1e40af" }}>{provData.nombre} — {provData.organo}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: "12px 16px", borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: "#166534" }}>📊 Alícuota aplicada</span>
                  <span style={{ fontWeight: 700, color: "#166534" }}>{(alicuotaFinal * 100).toFixed(2)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", background: "#fef2f2", padding: "16px", borderRadius: 8, border: "2px solid #fca5a5" }}>
                  <span style={{ fontWeight: 700, fontSize: 17, color: "#991b1b" }}>🔴 Ingresos Brutos a pagar</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "#991b1b" }}>{formatARS(ibAPagar)}</span>
                </div>
              </div>
              <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "12px 16px", marginTop: 16, fontSize: 14 }}>
                ⚠️ <strong>Atención:</strong> Esta es una estimación. La alícuota exacta depende del código de actividad (NAES) y puede diferir. Consultá el código fiscal de {provData.nombre}. <Link href="/" style={{ color: "#1d4ed8", fontWeight: 600 }}>Activá alertas de vencimiento →</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* EXPLICACIÓN */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1d4ed8", marginBottom: 8 }}>¿Qué son los Ingresos Brutos?</h2>
          <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 32 }}>El impuesto provincial que pocos entienden bien — acá te lo explicamos</p>

          <div style={{ display: "grid", gap: 20 }}>
            {[
              { emoji: "🤔", titulo: "¿Qué es?", texto: "Los Ingresos Brutos (IIBB) son un impuesto provincial que gravá el ejercicio habitual y a título oneroso de cualquier actividad económica, comercial, industrial o de servicios. En criollo: pagás un porcentaje de todo lo que facturás, sin importar si ganás o perdés." },
              { emoji: "⚙️", titulo: "¿Cómo funciona?", texto: "A diferencia del IVA, no tiene crédito fiscal. Pagás sobre el total de tus ventas. Si vendiste $1.000.000 y la alícuota es 3%, pagás $30.000 sin importar cuánto gastaste. Es un impuesto sobre facturación, no sobre ganancia." },
              { emoji: "👤", titulo: "¿Quién lo paga?", texto: "Prácticamente todos los que ejercen una actividad económica en Argentina: Responsables Inscriptos, Monotributistas (en muchas provincias), profesionales independientes, comerciantes, industriales. Hay algunas exenciones por actividad o por nivel de ingresos." },
              { emoji: "📅", titulo: "¿Cuándo se paga?", texto: "Depende de cada provincia, pero generalmente es mensual. En Buenos Aires (ARBA) y CABA (AGIP) hay anticipos mensuales basados en ingresos. La declaración jurada anual se presenta una vez al año." },
              { emoji: "🧮", titulo: "¿Cómo se calcula?", texto: "Ingresos Brutos = Total facturado × Alícuota de tu provincia y actividad. Si en Córdoba facturaste $500.000 con alícuota 4%, pagás $20.000. Ojo: la alícuota varía mucho según el código de actividad." },
            ].map(item => (
              <div key={item.titulo} style={{ display: "flex", gap: 16, padding: "20px", background: "#f8fafc", borderRadius: 12, borderLeft: "4px solid #1d4ed8" }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</span>
                <div>
                  <h3 style={{ fontWeight: 700, color: "#1d4ed8", margin: "0 0 8px" }}>{item.titulo}</h3>
                  <p style={{ color: "#374151", lineHeight: 1.6, margin: 0 }}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAS */}
      <section style={{ background: "#eff6ff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 24 }}>🆚 Ingresos Brutos vs otros impuestos</h2>
          <div style={{ background: "#fff", borderRadius: 12, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#1d4ed8", color: "#fff" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}></th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Ingresos Brutos</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>IVA</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Ganancias</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Jurisdicción", "Provincial", "Nacional (AFIP)", "Nacional (AFIP)"],
                    ["Quién lo paga", "Todos los que facturan", "Solo Resp. Inscriptos", "Personas y empresas"],
                    ["Base de cálculo", "Total facturado", "Ventas − Compras", "Ganancia neta"],
                    ["Crédito fiscal", "❌ No tiene", "✅ Sí tiene", "✅ Deducciones"],
                    ["Frecuencia", "Mensual", "Mensual", "Anual + anticipos"],
                  ].map(([concepto, ib, iva, gan], i) => (
                    <tr key={concepto} style={{ background: i % 2 === 0 ? "#f9fafb" : "#fff" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#374151" }}>{concepto}</td>
                      <td style={{ padding: "10px 14px", color: "#1d4ed8", fontWeight: 600 }}>{ib}</td>
                      <td style={{ padding: "10px 14px", color: "#0f766e" }}>{iva}</td>
                      <td style={{ padding: "10px 14px", color: "#7c3aed" }}>{gan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* VENCIMIENTOS + CTA */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 20 }}>📅 Vencimientos por provincia</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            {[
              { nombre: "Buenos Aires (ARBA)", freq: "Mensual, días 10-25 según CUIT" },
              { nombre: "CABA (AGIP)", freq: "Mensual, días 10-20 según actividad" },
              { nombre: "Córdoba", freq: "Mensual, días 12-16 según CUIT" },
              { nombre: "Santa Fe", freq: "Mensual, días 10-20 según CUIT" },
            ].map(p => (
              <div key={p.nombre} style={{ background: "#f8fafc", borderRadius: 10, padding: "16px" }}>
                <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 4 }}>{p.nombre}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{p.freq}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
            borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>¿No querés olvidarte del vencimiento de IIBB?</h3>
            <p style={{ opacity: 0.85, marginBottom: 20 }}>Te avisamos antes del vencimiento de Ingresos Brutos en tu provincia. Gratis.</p>
            <Link href="/" style={{ background: "#fbbf24", color: "#1c1917", fontWeight: 700, padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
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
              ["¿Los monotributistas pagan Ingresos Brutos?", "Depende de la provincia. En Buenos Aires, los monotributistas que superan ciertos ingresos deben inscribirse en ARBA y pagar IIBB. En otras provincias hay exenciones. Verificá el umbral de tu provincia."],
              ["¿Puedo estar inscripto en varias provincias?", "Sí, si trabajás en más de una provincia, tenés que inscribirte en el Convenio Multilateral (CM) que es un mecanismo para distribuir la base imponible entre las provincias donde operás."],
              ["¿Qué pasa si no me inscribo en Ingresos Brutos?", "Podés recibir multas por parte de la administración tributaria provincial, más los intereses por el impuesto no declarado. Es mejor regularizarse cuanto antes."],
              ["¿El IIBB se paga sobre lo facturado o lo cobrado?", "Generalmente sobre lo devengado (facturado), aunque algunas provincias permiten el criterio de lo percibido (cobrado). Verificá la normativa de tu provincia."],
            ].map(([p, r]) => (
              <details key={p} style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", border: "1px solid #e5e7eb" }}>
                <summary style={{ fontWeight: 600, cursor: "pointer", color: "#111827", listStyle: "none" }}>▶ {p}</summary>
                <p style={{ color: "#6b7280", marginTop: 12, lineHeight: 1.6, marginBottom: 0 }}>{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: "#1e3a8a", color: "#bfdbfe", padding: "24px", textAlign: "center", fontSize: 14 }}>
        <p style={{ margin: 0 }}>© 2025 FácilFiscal · <Link href="/" style={{ color: "#bfdbfe" }}>Volver al inicio</Link></p>
      </footer>
    </main>
  );
}
