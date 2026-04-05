import { MetadataRoute } from 'next'

const BASE = 'https://www.facilfiscal.com.ar'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/responsable-inscripto`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/autonomos`,                     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/como-facturar`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/mi-categoria`,                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/iva`,                           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/ingresos-brutos`,               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/impuesto-ganancias`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/impuestos-importacion`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/impuestos-por-provincia`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
  ]
}
