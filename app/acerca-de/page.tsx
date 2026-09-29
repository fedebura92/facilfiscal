import type {Metadata} from 'next'
import SiteHeader from '@/components/SiteHeader'

export const metadata:Metadata={title:'Acerca de Fácil Fiscal',description:'Conocé qué es Fácil Fiscal, cómo prepara y actualiza sus guías tributarias y cuáles son sus límites.',alternates:{canonical:'/acerca-de'}}

export default function Page(){return <>
<SiteHeader currentPath="/acerca-de"/>
<main className="ff-page-content" style={s}>
<h1>Acerca de Fácil Fiscal</h1>
<p>Fácil Fiscal nació con un objetivo concreto: que una persona pueda entender qué obligaciones fiscales le corresponden, cuánto podría pagar, cuándo vence y qué tiene que hacer, sin necesitar conocer previamente términos contables.</p>
<h2>Qué hacemos</h2>
<p>Reunimos explicaciones, calculadoras, vencimientos, recordatorios y herramientas de diagnóstico para personas y negocios de Argentina. Mi Panel permite organizar la situación declarada por persona o negocio y señalar obligaciones que corresponden o que conviene revisar.</p>
<h2>Quién está detrás del contenido</h2>
<p>Fácil Fiscal es un proyecto independiente. El contenido se prepara y mantiene con un enfoque práctico y educativo: explicar conceptos tributarios en lenguaje cotidiano, indicar cuándo una regla depende de la jurisdicción o de la situación particular, y enlazar fuentes oficiales para que cada persona pueda contrastar la información.</p>
<p>No atribuimos las guías a profesionales matriculados ni afirmamos que una calculadora sea una liquidación profesional. Cuando una consulta requiere revisar documentación, encuadre o circunstancias individuales, recomendamos verificarla con ARCA, el organismo provincial correspondiente o un profesional matriculado.</p>
<h2>Cómo revisamos y actualizamos la información</h2>
<ol><li>Priorizamos normas, calendarios y guías publicados por ARCA, organismos tributarios provinciales y COMARB, según el tema.</li><li>Indicamos la fecha de revisión o vigencia cuando la información depende de valores, fechas o reglas que pueden cambiar.</li><li>Separamos los ejemplos ilustrativos de los importes oficiales y aclaramos los supuestos y límites de las calculadoras.</li><li>Cuando una respuesta depende de datos personales, actividad, jurisdicción o régimen, lo señalamos en lugar de presentar una estimación como definitiva.</li><li>Si detectás un dato desactualizado o un enlace que no funciona, podés avisarnos desde la página de <a href="/contacto">Contacto</a>.</li></ol>
<h2>Qué no somos</h2>
<p><strong>Fácil Fiscal es una plataforma independiente. No pertenece a ARCA ni a ningún organismo gubernamental y no reemplaza el asesoramiento profesional.</strong> Las herramientas son orientativas y no presentan declaraciones juradas ni determinan oficialmente obligaciones tributarias.</p>
<h2>Fuentes de referencia</h2>
<ul><li><a href="https://www.arca.gob.ar/" target="_blank" rel="noopener noreferrer">ARCA — Agencia de Recaudación y Control Aduanero</a></li><li><a href="https://www.comarb.gob.ar/" target="_blank" rel="noopener noreferrer">COMARB — Comisión Arbitral del Convenio Multilateral</a></li><li>Organismos tributarios provinciales, enlazados en las guías correspondientes.</li></ul>
<p><strong>Última revisión editorial: septiembre de 2026.</strong> La revisión editorial no significa que todos los parámetros de todas las páginas tengan idéntica fecha de actualización; cada guía debe consultarse junto con su propia fecha de vigencia.</p>
</main></>}
const s={maxWidth:820,margin:'0 auto',padding:'48px 22px 70px',lineHeight:1.75,color:'#183744'}
