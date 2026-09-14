import { MetadataRoute } from 'next'
export default function sitemap():MetadataRoute.Sitemap{
 const baseUrl='https://www.facilfiscal.com.ar'; const ultimaRevision=new Date('2026-09-14T00:00:00-03:00')
 const rutas=[
  ['/',1,'weekly'],['/crear-negocio',.95,'monthly'],['/calendario-fiscal',.9,'weekly'],['/mi-categoria',.9,'monthly'],['/responsable-inscripto',.8,'monthly'],['/autonomos',.8,'monthly'],['/como-facturar',.8,'monthly'],['/factura-c',.75,'monthly'],['/iva',.8,'monthly'],['/ingresos-brutos',.8,'monthly'],['/impuesto-ganancias',.8,'monthly'],['/impuestos-importacion',.7,'monthly'],['/impuestos-por-provincia',.8,'monthly'],['/responsable-inscripto-obligaciones',.75,'monthly'],['/acerca-de',.5,'yearly'],['/metodologia',.7,'monthly'],['/contacto',.4,'yearly'],['/privacidad',.3,'yearly'],['/terminos',.3,'yearly']
 ] as const
 return rutas.map(([url,priority,changeFrequency])=>({url:`${baseUrl}${url}`,lastModified:ultimaRevision,changeFrequency,priority}))
}
