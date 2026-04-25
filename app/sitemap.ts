import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://facilfiscal.com.ar";

  const rutas = [
    { url: "/", prioridad: 1.0, cambio: "weekly" },
    { url: "/calendario-fiscal", prioridad: 0.9, cambio: "monthly" },
    { url: "/mi-categoria", prioridad: 0.9, cambio: "monthly" },
    { url: "/responsable-inscripto", prioridad: 0.8, cambio: "monthly" },
    { url: "/autonomos", prioridad: 0.8, cambio: "monthly" },
    { url: "/como-facturar", prioridad: 0.8, cambio: "monthly" },
    { url: "/iva", prioridad: 0.8, cambio: "monthly" },
    { url: "/ingresos-brutos", prioridad: 0.7, cambio: "monthly" },
    { url: "/impuesto-ganancias", prioridad: 0.7, cambio: "monthly" },
    { url: "/impuestos-importacion", prioridad: 0.7, cambio: "monthly" },
    { url: "/impuestos-por-provincia", prioridad: 0.7, cambio: "monthly" },
  ] as const;

  return rutas.map(({ url, prioridad, cambio }) => ({
    url: `${baseUrl}${url}`,
    lastModified: new Date(),
    changeFrequency: cambio,
    priority: prioridad,
  }));
}
