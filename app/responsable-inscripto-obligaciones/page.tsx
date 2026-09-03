import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, faqJsonLd } from '@/components/StructuredData'
import { FiscalGuidePage, GuideSection, guideCTAStyle, guideListStyle, guideNoteStyle } from '@/components/SEOContent/FiscalGuidePage'

const faq = [
  { question: '¿Qué impuestos paga un Responsable Inscripto?', answer: 'Como mínimo, una persona humana del régimen general suele estar alcanzada por IVA y Ganancias. También pueden corresponder aportes de Autónomos, Ingresos Brutos y obligaciones laborales, según su situación.' },
  { question: '¿Cómo se presenta el IVA en 2026?', answer: 'Desde noviembre de 2025, las declaraciones juradas originales y rectificativas de IVA se presentan obligatoriamente mediante IVA Simple.' },
  { question: '¿Todas las obligaciones vencen el mismo día?', answer: 'No. Las fechas dependen del impuesto, período y, en muchos casos, de la terminación de CUIT. Debe consultarse el calendario vigente.' },
]

export default function ResponsableObligacionesPage() {
  return <>
    <StructuredData data={[
      breadcrumbJsonLd([{ name: 'Inicio', url: 'https://www.facilfiscal.com.ar' }, { name: 'Responsable Inscripto', url: 'https://www.facilfiscal.com.ar/responsable-inscripto' }, { name: 'Obligaciones', url: 'https://www.facilfiscal.com.ar/responsable-inscripto-obligaciones' }]),
      faqJsonLd(faq),
    ]} />
    <SiteHeader currentPath="/responsable-inscripto" />
    <div className="ff-page-content">
      <FiscalGuidePage eyebrow="Checklist 2026" title="Obligaciones de un Responsable Inscripto" intro="No todos tienen exactamente las mismas obligaciones. Este checklist te ayuda a reconocer cuáles suelen corresponder y cuáles dependen de tu actividad.">
        <GuideSection title="Las obligaciones principales">
          <ol style={guideListStyle}>
            <li><strong>IVA:</strong> registrar operaciones, revisar la información y presentar la declaración jurada mensual mediante IVA Simple.</li>
            <li><strong>Ganancias:</strong> presentar la declaración correspondiente y pagar el saldo o anticipos cuando corresponda.</li>
            <li><strong>Facturación:</strong> emitir comprobantes electrónicos adecuados a la operación y condición del cliente.</li>
            <li><strong>Ingresos Brutos:</strong> cumplir en la jurisdicción local o por Convenio Multilateral si desarrollás actividad en más de una.</li>
            <li><strong>Vencimientos:</strong> controlar cada fecha según impuesto, período y terminación de CUIT.</li>
          </ol>
        </GuideSection>

        <GuideSection title="Obligaciones que dependen de tu situación">
          <ul style={guideListStyle}>
            <li><strong>Autónomos:</strong> suele corresponder a personas humanas que trabajan por cuenta propia dentro del régimen general.</li>
            <li><strong>Empleador y seguridad social:</strong> si tenés personal en relación de dependencia.</li>
            <li><strong>Bienes Personales:</strong> si tu situación patrimonial queda alcanzada.</li>
            <li><strong>Regímenes de retención o percepción:</strong> si ARCA o la jurisdicción te designa como agente.</li>
            <li><strong>Tasas y habilitaciones municipales:</strong> según actividad y lugar donde funciona el negocio.</li>
          </ul>
          <div style={guideNoteStyle}><strong>No alcanza con decir “soy Responsable Inscripto”.</strong> Para determinar todo lo que corresponde hay que considerar si sos persona o sociedad, la actividad, la provincia, si tenés empleados y dónde operás.</div>
        </GuideSection>

        <GuideSection title="Qué facturas suele emitir">
          <ul style={guideListStyle}>
            <li><strong>Factura A:</strong> generalmente, cuando el cliente también es Responsable Inscripto.</li>
            <li><strong>Factura B:</strong> generalmente, para consumidores finales, monotributistas o exentos.</li>
            <li><strong>Factura E:</strong> para operaciones de exportación.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>ARCA puede habilitar variantes de Factura A con leyendas especiales según sus controles. Conviene verificar la autorización disponible antes de emitir.</p>
        </GuideSection>

        <GuideSection title="Herramientas para hacerlo más simple">
          <p>Podés estimar el saldo mensual y revisar las fechas sin aprender primero toda la terminología.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link href="/iva" style={guideCTAStyle}>Calcular IVA →</Link>
            <Link href="/impuesto-ganancias" style={{ ...guideCTAStyle, background: '#e8f6fb' }}>Estimar Ganancias →</Link>
            <Link href="/calendario-fiscal" style={{ ...guideCTAStyle, background: '#e8f6fb' }}>Ver vencimientos →</Link>
          </div>
        </GuideSection>

        <p style={{ color: '#64748b', lineHeight: 1.6 }}>Revisado el 3 de septiembre de 2026. Fuentes: <a href="https://www.arca.gob.ar/iva/responsables-inscriptos/" target="_blank" rel="noopener noreferrer">IVA para responsables inscriptos</a> y <a href="https://www.arca.gob.ar/regimenGeneral/" target="_blank" rel="noopener noreferrer">Régimen General de ARCA</a>.</p>
      </FiscalGuidePage>
    </div>
  </>
}
