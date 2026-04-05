"use client";

import { useState } from "react";
import Link from "next/link";

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
    iibb: { alicuota: 3.5, descripcion: "Alícuota general comercio y servicios. Industria manufacturera tiene beneficios." },
    sellos: { alicuota: 1.0, descripcion: "Sobre contratos e instrumentos públicos y privados" },
    inmobiliario: { descripcion: "Proporcional al avalúo fiscal. Puede ser en cuotas." },
    automotor: { descripcion: "Según valuación del vehículo (1% al 3% anual aprox.)" },
    tasaMunicipal: { rango: "0.5% — 1.5%", descripcion: "Tasa de Seguridad e Higiene sobre ingresos brutos" },
    municipios: ["La Plata", "Mar del Plata", "Quilmes", "Lanús", "Lomas de Zamora", "Tigre"],
    vencimientoIIBB: "Mensual — días 10 al 25 según terminación CUIT",
    exenciones: "Primarias, educación, culto religioso, ciertas actividades industriales hasta $X de facturación",
  },
  caba: {
    nombre: "CABA",
    organo: "AGIP",
    sitio: "https://www.agip.gob.ar",
    color: "#dc2626",
    iibb: { alicuota: 3.0, descripcion: "Alícuota general. Varía mucho según código de actividad (1.5% a 5%)." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos, contratos y operaciones en CABA" },
    inmobiliario: { descripcion: "ABL (Alumbrado, Barrido y Limpieza) — bimestral según valuación" },
    automotor: { descripcion: "Patentes — según modelo y valuación fiscal" },
    tasaMunicipal: { rango: "N/A", descripcion: "En CABA el IIBB y las tasas municipales son gestionadas por AGIP" },
    municipios: ["Ciudad Autónoma de Buenos Aires (único municipio)"],
    vencimientoIIBB: "Mensual — días 10 al 20 según actividad y CUIT",
    exenciones: "Actividades culturales, educación, salud, exportaciones de servicios",
  },
  cordoba: {
    nombre: "Córdoba",
    organo: "DGR Córdoba",
    sitio: "https://www.dgr.cba.gov.ar",
    color: "#16a34a",
    iibb: { alicuota: 4.0, descripcion: "Alícuota general. Industria: 1.5%. Agropecuario: reducida." },
    sellos: { alicuota: 1.5, descripcion: "Sobre instrumentos que se otorguen en Córdoba" },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — según valuación fiscal provincial" },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA" },
    tasaMunicipal: { rango: "0.5% — 2%", descripcion: "Tasa de comercio e industria según municipio" },
    municipios: ["Córdoba capital", "Villa María", "Río Cuarto", "San Francisco", "Bell Ville"],
    vencimientoIIBB: "Mensual — días 12 al 16 según terminación CUIT",
    exenciones: "Industria manufacturera tiene alícuota reducida. Agro tiene beneficios específicos.",
  },
  santa_fe: {
    nombre: "Santa Fe",
    organo: "API Santa Fe",
    sitio: "https://www.santafe.gov.ar/api",
    color: "#7c3aed",
    iibb: { alicuota: 3.5, descripcion: "Tasa general. Servicios financieros: 6%. Construcción: 4%." },
    sellos: { alicuota: 1.0, descripcion: "Tasa general sobre instrumentos. Compraventa inmuebles: 2.5%." },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas anuales según valuación" },
    automotor: { descripcion: "Impuesto a los Automotores — por CUIT del titular" },
    tasaMunicipal: { rango: "0.5% — 1.5%", descripcion: "Tasa General de Servicios sobre IIBB" },
    municipios: ["Rosario", "Santa Fe capital", "Rafaela", "Venado Tuerto", "Reconquista"],
    vencimientoIIBB: "Mensual — días 10 al 20 según terminación CUIT",
    exenciones: "Exportaciones, actividades culturales, ciertas agroindustrias",
  },
  mendoza: {
    nombre: "Mendoza",
    organo: "ATM Mendoza",
    sitio: "https://atm.mendoza.gov.ar",
    color: "#b45309",
    iibb: { alicuota: 3.5, descripcion: "General. Vitivinicultura tiene beneficios. Turismo: 3%." },
    sellos: { alicuota: 1.2, descripcion: "Sobre instrumentos públicos y privados con efectos en provincia" },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — cuotas según valuación fiscal" },
    automotor: { descripcion: "Impuesto a los Automotores — según valuación DNRPA" },
    tasaMunicipal: { rango: "0.5% — 1.5%", descripcion: "Tasa de Inspección de Seguridad e Higiene" },
    municipios: ["Mendoza capital", "San Rafael", "Maipú", "Luján de Cuyo", "Guaymallén"],
    vencimientoIIBB: "Mensual — días 10 al 20",
    exenciones: "Vitivinicultura con beneficios especiales. Turismo en ciertos municipios.",
  },
  tucuman: {
    nombre: "Tucumán",
    organo: "DGR Tucumán",
    sitio: "https://www.dgr.tucuman.gov.ar",
    color: "#0f766e",
    iibb: { alicuota: 4.0, descripcion: "Tasa general. Industria azucarera: 2%. Servicios: 4%." },
    sellos: { alicuota: 1.0, descripcion: "Sobre actos y contratos" },
    inmobiliario: { descripcion: "Impuesto Inmobiliario — anual en cuotas" },
    automotor: { descripcion: "Impuesto a los Automotores" },
    tasaMunicipal: { rango: "0.5% — 2%", descripcion: "Tasa de comercio e industria por municipio" },
    municipios: ["San Miguel de Tucumán", "Tafí Viejo", "Banda del Río Salí", "Yerba Buena"],
    vencimientoIIBB: "Mensual — según calendario DGR",
    exenciones: "Agroindustria azucarera, ciertas PyMES industriales",
  },
};

function formatARS(n: number) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export default function ImpuestosPorProvinciaPage() {
  const [provinciaKey, setProvinciaKey] = useState<string>("");
  const [ingresos, setIngresos] = useState("");
  const [calculado, setCalculado] = useState(false);

  const prov = provinciaKey ? PROVINCIAS_DATA[provinciaKey] : null;
  const ingresosNum = parseFloat(ingresos) || 0;
  const iibbEstimado = prov ? ingresosNum * (prov.iibb.alicuota / 100) : 0;

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
          <img src="/logo.svg" alt="FacilFiscal" style={{ height: 36 }} />
        </Link>
        <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/iva" style={{ color: "#d1d5db", textDecoration: "none", fontSize: 14 }}>IVA</Link>
          <Link href="/ingresos-brutos" style={{ color: "#d1d5db", textDecoration: "none", fontSize: 14 }}>Ingresos Brutos</Link>
        </span>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #374151 0%, #111827 100%)",
        color: "#fff", padding: "64px 24px 48px", textAlign: "center"
      }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          🗺️ 23 provincias · Municipios · Tasas locales
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          👉 Impuestos provinciales y municipales<br />por zona en Argentina
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 540, margin: "0 auto 28px" }}>
          Seleccioná tu provincia y conocé todos los impuestos que aplican: IIBB, Sellos, Inmobiliario, Automotor y Tasas Municipales
        </p>
        <a href="#selector" style={{
          background: "#fbbf24", color: "#1c1917", fontWeight: 700,
          padding: "14px 32px", borderRadius: 8, textDecoration: "none", fontSize: 16, display: "inline-block",
        }}>
          Ver impuestos de mi provincia ↓
        </a>
      </section>

      {/* SELECTOR */}
      <section id="selector" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "32px 28px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#374151", marginBottom: 24, textAlign: "center" }}>
            🗺️ Seleccioná tu provincia
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 28 }}>
            {Object.entries(PROVINCIAS_DATA).map(([key, pdata]) => (
              <button
                key={key}
                onClick={() => { setProvinciaKey(key); setCalculado(false); }}
                style={{
                  padding: "10px 14px", borderRadius: 8,
                  border: `2px solid ${provinciaKey === key ? pdata.color : "#e5e7eb"}`,
                  background: provinciaKey === key ? pdata.color : "#f9fafb",
                  color: provinciaKey === key ? "#fff" : "#374151",
                  fontWeight: provinciaKey === key ? 700 : 400, cursor: "pointer", fontSize: 14,
                  textAlign: "left",
                }}
              >
                {pdata.nombre}
              </button>
            ))}
            <div style={{ padding: "10px 14px", borderRadius: 8, border: "2px dashed #e5e7eb", color: "#9ca3af", fontSize: 13, display: "flex", alignItems: "center" }}>
              + Más provincias próximamente
            </div>
          </div>

          {/* Calculadora IIBB rápida */}
          {prov && (
            <>
              <div style={{ borderTop: "2px solid #f3f4f6", paddingTop: 24, display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#374151" }}>
                    💰 Ingresos del mes para calcular IIBB en {prov.nombre}
                  </label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <input
                      type="number"
                      placeholder="Ej: 1000000"
                      value={ingresos}
                      onChange={e => { setIngresos(e.target.value); setCalculado(false); }}
                      style={{ flex: 1, padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 8, fontSize: 16 }}
                    />
                    <button
                      onClick={() => { if (ingresosNum > 0) setCalculado(true); }}
                      style={{
                        background: prov.color, color: "#fff", fontWeight: 700,
                        padding: "12px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, whiteSpace: "nowrap",
                      }}
                    >
                      Calcular →
                    </button>
                  </div>
                </div>

                {calculado && ingresosNum > 0 && (
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px", border: `2px solid ${prov.color}20` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>IIBB estimado en {prov.nombre} ({prov.iibb.alicuota}%)</span>
                      <span style={{ fontWeight: 800, fontSize: 22, color: prov.color }}>{formatARS(iibbEstimado)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "8px 0 0" }}>
                      ⚠️ Estimación con alícuota general. La alícuota real depende de tu código de actividad en {prov.organo}.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* FICHA DE PROVINCIA */}
        {prov && (
          <div style={{ marginTop: 32 }}>
            <div style={{ background: prov.color, borderRadius: "16px 16px 0 0", padding: "20px 28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 24, margin: 0 }}>{prov.nombre}</h2>
                <p style={{ opacity: 0.85, margin: "4px 0 0", fontSize: 14 }}>Organismo: {prov.organo}</p>
              </div>
              <a href={prov.sitio} target="_blank" rel="noopener noreferrer"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "8px 16px", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Ir a {prov.organo} →
              </a>
            </div>

            <div style={{ background: "#fff", borderRadius: "0 0 16px 16px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {/* Impuestos */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                {[
                  {
                    emoji: "📊", titulo: "Ingresos Brutos (IIBB)",
                    alicuota: `${prov.iibb.alicuota}% general`,
                    desc: prov.iibb.descripcion,
                    venc: prov.vencimientoIIBB,
                  },
                  {
                    emoji: "📜", titulo: "Impuesto de Sellos",
                    alicuota: `${prov.sellos.alicuota}% general`,
                    desc: prov.sellos.descripcion,
                    venc: "Al momento de firmar el instrumento",
                  },
                  {
                    emoji: "🏠", titulo: "Impuesto Inmobiliario",
                    alicuota: "Variable",
                    desc: prov.inmobiliario.descripcion,
                    venc: "Anual en cuotas (generalmente)",
                  },
                  {
                    emoji: "🚗", titulo: "Impuesto Automotor",
                    alicuota: "Variable",
                    desc: prov.automotor.descripcion,
                    venc: "Anual en cuotas",
                  },
                  {
                    emoji: "🏛️", titulo: "Tasas Municipales",
                    alicuota: prov.tasaMunicipal.rango,
                    desc: prov.tasaMunicipal.descripcion,
                    venc: "Mensual (varía por municipio)",
                  },
                ].map((imp, i) => (
                  <div key={imp.titulo} style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", borderRight: i % 2 === 0 ? "1px solid #f3f4f6" : "none" }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 28 }}>{imp.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "#111827", marginBottom: 4 }}>{imp.titulo}</div>
                        <div style={{ background: `${prov.color}15`, color: prov.color, fontWeight: 700, fontSize: 13, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 8 }}>
                          {imp.alicuota}
                        </div>
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 6px", lineHeight: 1.5 }}>{imp.desc}</p>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>📅 {imp.venc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Municipios */}
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

              {/* Exenciones */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f3f4f6" }}>
                <h3 style={{ fontWeight: 700, color: "#374151", marginBottom: 8, fontSize: 15 }}>✅ Exenciones y beneficios principales</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{prov.exenciones}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* COMPARATIVA PROVINCIAS */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>📊 Comparativa de alícuotas de IIBB por provincia</h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>Alícuota general de Ingresos Brutos — varía según actividad</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#374151", color: "#fff" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Provincia</th>
                  <th style={{ padding: "12px 16px", textAlign: "left" }}>Organismo</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Alícuota IIBB</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Sellos</th>
                  <th style={{ padding: "12px 16px", textAlign: "center" }}>Vencimiento IIBB</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PROVINCIAS_DATA).map(([key, p], i) => (
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
                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, color: "#6b7280" }}>{p.vencimientoIIBB.split("—")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#f9fafb", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            background: "linear-gradient(135deg, #374151, #111827)",
            borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
            <h3 style={{ fontWeight: 700, fontSize: 20, margin: "0 0 8px" }}>¿No querés olvidarte de los vencimientos provinciales?</h3>
            <p style={{ opacity: 0.85, marginBottom: 20 }}>Te avisamos antes de cada vencimiento de IIBB, Sellos e Inmobiliario en tu provincia.</p>
            <Link href="/" style={{ background: "#fbbf24", color: "#1c1917", fontWeight: 700, padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontSize: 15 }}>
              Activar alertas gratis →
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: "#111827", color: "#9ca3af", padding: "24px", textAlign: "center", fontSize: 14 }}>
        <p style={{ margin: 0 }}>© 2025 FácilFiscal · <Link href="/" style={{ color: "#9ca3af" }}>Volver al inicio</Link></p>
      </footer>
    </main>
  );
}
