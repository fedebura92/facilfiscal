import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import StructuredData, { breadcrumbJsonLd, faqJsonLd } from '@/components/StructuredData'
import { FiscalGuidePage, GuideSection, guideCTAStyle, guideListStyle, guideNoteStyle } from '@/components/SEOContent/FiscalGuidePage'

const faq = [
  { question: '¿Quién emite Factura C?', answer: 'Los monotributistas y los sujetos exentos en IVA emiten comprobantes clase C para sus operaciones, con las excepciones que correspondan.' },
  { question: '¿Un monotributista emite Factura C a un Responsable Inscripto?', answer: 'Sí. El tipo de comprobante depende de la condición del emisor. El monotributista emite Factura C también cuando su cliente es Responsable Inscripto.' },
  { question: '¿Qué factura se usa para una exportación?', answer: 'Las operaciones de exportación se respaldan con comprobantes clase E y requieren un punto de venta específico.' },
]

export default function FacturaCPage() {
  return <>
    <StructuredData data={[
      breadcrumbJsonLd([{ name: 'Inicio', url: 'https://www.facilfiscal.com.ar' }, { name: 'Factura C', url: 'https://www.facilfiscal.com.ar/factura-c' }]),
      faqJsonLd(faq),
    ]} />
    <SiteHeader currentPath="/como-facturar" />
    <div className="ff-page-content">
      <FiscalGuidePage eyebrow="Guía actualizada 2026" title="Factura C: qué es, quién la emite y cómo hacerla" intro="Una explicación clara para saber cuándo corresponde, qué necesitás y dónde emitirla sin confundirte con términos fiscales.">
        <GuideSection title="¿Qué es una Factura C?">
          <p>Es el comprobante que utilizan los monotributistas y los sujetos exentos en IVA para respaldar sus ventas o servicios. No muestra el IVA discriminado como una Factura A.</p>
          <div style={guideNoteStyle}><strong>Lo más importante:</strong> el tipo de factura depende principalmente de la condición fiscal de quien la emite, no de que el cliente sea una empresa o una persona.</div>
        </GuideSection>

        <GuideSection title="¿Cuándo corresponde emitirla?">
          <ul style={guideListStyle}>
            <li>Si sos monotributista y vendés a un consumidor final.</li>
            <li>Si sos monotributista y le facturás a otro monotributista.</li>
            <li>Si sos monotributista y tu cliente es Responsable Inscripto.</li>
            <li>Si sos un sujeto exento en IVA y corresponde documentar la operación.</li>
          </ul>
          <p style={{ marginBottom: 0 }}><strong>Excepción importante:</strong> para una exportación corresponde un comprobante clase E, no una Factura C.</p>
        </GuideSection>

        <GuideSection title="Cómo emitirla en ARCA">
          <ol style={guideListStyle}>
            <li>Dá de alta un punto de venta y elegí el sistema de facturación.</li>
            <li>Ingresá con clave fiscal a “Comprobantes en línea” o utilizá el Facturador.</li>
            <li>Elegí el punto de venta, Factura C y el concepto: productos, servicios o ambos.</li>
            <li>Completá los datos de la operación y del cliente cuando el sistema los solicite.</li>
            <li>Revisá el total, confirmá y conservá el comprobante autorizado.</li>
          </ol>
          <p><Link href="/como-facturar" style={guideCTAStyle}>Ver el paso a paso completo →</Link></p>
        </GuideSection>

        <GuideSection title="Errores frecuentes que conviene evitar">
          <ul style={guideListStyle}>
            <li>Usar Factura C para una exportación.</li>
            <li>Crear el punto de venta con un sistema distinto al que después vas a utilizar.</li>
            <li>Inventar un CUIT cuando el cliente es consumidor final.</li>
            <li>Confundir una nota de crédito con la eliminación de una factura ya autorizada.</li>
            <li>Informar una fecha o descripción que no coincide con la operación real.</li>
          </ul>
        </GuideSection>

        <p style={{ color: '#64748b', lineHeight: 1.6 }}>Revisado el 3 de septiembre de 2026. Fuente: <a href="https://www.arca.gob.ar/monotributo/ayuda/facturacion.asp" target="_blank" rel="noopener noreferrer">facturación para monotributistas de ARCA</a>.</p>
      </FiscalGuidePage>
    </div>
  </>
}
