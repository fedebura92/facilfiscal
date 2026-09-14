export { SEOAutonomos, SEOComoFacturar } from './SEOContent'

const V = {
  tealDark: '#0d5c78', teal: '#1a7fa8', tealLight: '#e8f6fb', tealRing: '#a8ddf0',
  goldLight: '#fff8ec', goldRing: '#fde4a0',
  bg: '#f4f7f9', surface: '#fff', border: '#e2e8ed',
  ink: '#0f2733', ink2: '#3d5a6b', ink3: '#7a9aaa',
  redBg: '#fff1f1', redRing: '#ffc8c8',
}

const sectionStyle = {
  background: V.surface,
  border: `1.5px solid ${V.border}`,
  borderRadius: 14,
  overflow: 'hidden' as const,
  marginBottom: 20,
  boxShadow: '0 1px 4px rgba(13,92,120,.07)',
}

const headerStyle = {
  padding: '13px 16px',
  borderBottom: `1px solid ${V.border}`,
  fontSize: 15,
  fontWeight: 900 as const,
  color: V.ink,
}

const bodyStyle = { padding: '16px' }
const paraStyle = { fontSize: 13, color: V.ink2, fontWeight: 600 as const, lineHeight: 1.75, marginBottom: 12 }

export function SEOMonotributo() {
  const cards = [
    { icon: '✅', title: 'Un solo pago', desc: 'Integra el componente impositivo y, cuando corresponde, aportes previsionales y obra social.' },
    { icon: '📅', title: 'Pago mensual', desc: 'La cuota vence, en general, el día 20 o el siguiente hábil cuando corresponde.' },
    { icon: '📄', title: 'Factura C', desc: 'Como monotributista emitís Factura C; para exportaciones puede corresponder Factura E.' },
    { icon: '🔄', title: 'Recategorización', desc: 'Se revisa dos veces al año, en febrero y agosto, si corresponde cambiar de categoría.' },
  ]

  const faqs = [
    {
      q: '¿Qué pasa si no pago el Monotributo un mes?',
      a: 'La obligación queda impaga y puede generar intereses. Conviene regularizarla cuanto antes desde los servicios habilitados por ARCA. La falta de pago sostenida puede generar consecuencias sobre tu situación fiscal, por eso no conviene dejar acumular períodos.',
    },
    {
      q: '¿Puedo tener empleados siendo monotributista?',
      a: 'Sí. Tener empleados genera obligaciones adicionales como registración, ART, recibos y cargas sociales. La categoría del Monotributo se determina por los parámetros vigentes del régimen.',
    },
    {
      q: '¿Puedo trabajar en relación de dependencia y ser monotributista a la vez?',
      a: 'Sí. Podés trabajar en relación de dependencia y mantener Monotributo para una actividad independiente, siempre que cumplas los requisitos correspondientes.',
    },
    {
      q: '¿El Monotributo incluye obra social?',
      a: 'Según tu situación, la cuota puede incluir el componente de obra social. La integración y los importes dependen de los componentes que te correspondan.',
    },
    {
      q: '¿Qué es la recategorización y cuándo la tengo que hacer?',
      a: 'Se revisan los parámetros de los últimos 12 meses. ARCA prevé períodos de recategorización en febrero y agosto. Si tus parámetros no generan un cambio de categoría, no corresponde modificarla.',
    },
  ]

  return (
    <>
      <section style={sectionStyle}>
        <div style={headerStyle}>📋 ¿Qué es el Monotributo?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            El Monotributo es un régimen simplificado administrado por <strong>ARCA</strong> para pequeños contribuyentes. Permite cumplir en una cuota mensual con el componente impositivo y, cuando corresponde, con los aportes previsionales y de obra social.
          </p>
          <p style={paraStyle}>
            Desde agosto de 2026, el límite máximo anual publicado por ARCA para la categoría K es de <strong>$126.610.838,75</strong>. Ese importe se actualiza periódicamente y no debe tratarse como un valor permanente.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
            {cards.map(item => (
              <div key={item.title} style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: V.tealDark, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>💳 ¿Cómo y cuándo se paga?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            La cuota mensual vence, en general, el <strong>día 20</strong>. Si la fecha coincide con un día inhábil, corresponde revisar el vencimiento oficial del período.
          </p>
          <p style={paraStyle}>
            Para los contribuyentes comunes del Monotributo, el pago se realiza mediante <strong>medios electrónicos habilitados por ARCA</strong>, como VEP, débito automático u otras opciones disponibles en los servicios oficiales. Antes de pagar, verificá período, concepto e importe.
          </p>
          <div style={{ background: V.goldLight, border: `1px solid ${V.goldRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#7a4f00', lineHeight: 1.6 }}>
            💡 <strong>Importante:</strong> si una cuota queda impaga puede generar intereses. Fácil Fiscal te ayuda a recordar el vencimiento, pero la deuda y su estado definitivo se consultan en ARCA.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>📊 ¿Cómo sé en qué categoría estoy?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Las categorías van de la A a la K y se determinan comparando los parámetros de tu actividad con los valores vigentes. Los ingresos brutos de los últimos 12 meses son uno de esos parámetros, pero según la actividad también pueden intervenir otros límites.
          </p>
          <p style={paraStyle}>
            La recategorización se revisa en febrero y agosto. Si al evaluar los últimos 12 meses seguís dentro de la misma categoría, no corresponde modificarla.
          </p>
          <div style={{ background: V.redBg, border: `1px solid ${V.redRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#7a2020', lineHeight: 1.6 }}>
            ⚠️ <strong>Ojo:</strong> no conviene mirar solamente la facturación. Si superás algún parámetro o se configura una causal de exclusión, tu situación puede cambiar aunque el ingreso anual no sea el único dato relevante.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>❓ Preguntas frecuentes</div>
        {faqs.map((item, i) => (
          <div key={item.q} style={{ padding: '12px 16px', borderBottom: i === faqs.length - 1 ? 'none' : `1px solid ${V.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 6 }}>▸ {item.q}</div>
            <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>🔎 Fuentes y revisión</div>
        <div style={bodyStyle}>
          <p style={{ ...paraStyle, marginBottom: 0 }}>
            Contenido revisado con información oficial de ARCA sobre categorías, recategorización, vencimientos y medios de pago del Monotributo. Los importes y procedimientos pueden cambiar durante el año.
          </p>
        </div>
      </section>
    </>
  )
}

export function SEOResponsableInscripto() {
  const cards = [
    { icon: '🧾', title: 'IVA mensual', desc: 'Presentás IVA todos los meses mediante IVA Simple y determinás el saldo del período.' },
    { icon: '💼', title: 'Ganancias', desc: 'Declarás Ganancias y, cuando corresponde, pagás saldo y anticipos.' },
    { icon: '📄', title: 'Facturación', desc: 'Emitís comprobantes según la condición de tu cliente y la autorización que tengas.' },
    { icon: '📅', title: 'Vencimientos', desc: 'Las fechas dependen de cada obligación y, muchas veces, de la terminación de tu CUIT.' },
  ]

  const facturas = [
    { tipo: 'Factura A', desc: 'Se usa cuando el receptor es otro Responsable Inscripto o un Monotributista. Según tu autorización, puede ser A común o una variante con leyenda.' },
    { tipo: 'Factura B', desc: 'Se usa, entre otros casos, para consumidores finales y sujetos exentos en IVA.' },
    { tipo: 'Factura E', desc: 'Se utiliza para operaciones de exportación cuando corresponde.' },
  ]

  const faqs = [
    {
      q: '¿Cuándo tengo que pasar del Monotributo al régimen general?',
      a: 'No depende de un único número. Podés quedar excluido si superás los parámetros máximos vigentes o se configura otra causal. Desde el 1/08/2026, el tope de ingresos brutos de la categoría K es de $126.610.838,75, pero también existen otros parámetros y condiciones que deben revisarse.',
    },
    {
      q: '¿El IVA se paga todos los meses?',
      a: 'El IVA se determina mensualmente. Desde noviembre de 2025, los responsables inscriptos deben cumplir la determinación e ingreso mediante IVA Simple. El saldo final puede verse afectado por crédito fiscal, saldos anteriores, retenciones, percepciones y otros pagos computables.',
    },
    {
      q: '¿Un Responsable Inscripto le hace Factura B a un monotributista?',
      a: 'No. ARCA indica que un Responsable Inscripto emite comprobante clase A a otro Responsable Inscripto y también a un Monotributista. La Factura B corresponde, entre otros, a consumidores finales y sujetos exentos.',
    },
    {
      q: '¿Tengo que pagar Autónomos además de IVA y Ganancias?',
      a: 'Si sos una persona humana que realiza una actividad económica habitual, personal y directa dentro del régimen general, puede corresponder el aporte previsional de Autónomos. La situación cambia según el tipo de contribuyente y actividad.',
    },
    {
      q: '¿Cómo sé cuándo vence cada obligación?',
      a: 'No conviene memorizar una sola fecha. IVA, Ganancias, anticipos y otras obligaciones tienen calendarios distintos. Fácil Fiscal muestra los próximos vencimientos y permite activar recordatorios para no depender de acordarte todos los meses.',
    },
  ]

  return (
    <>
      <section style={sectionStyle}>
        <div style={headerStyle}>🧾 ¿Qué significa ser Responsable Inscripto?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Ser Responsable Inscripto significa estar dentro del <strong>régimen general</strong>. A diferencia del Monotributo, no pagás una sola cuota que reúna todo: cada impuesto, aporte u obligación se determina por separado según tu actividad y situación.
          </p>
          <p style={paraStyle}>
            En el caso de una persona humana que trabaja por cuenta propia, ARCA indica que el régimen general implica, como mínimo, el alta en <strong>IVA y Ganancias</strong>. Además pueden corresponder Autónomos, Ingresos Brutos, Bienes Personales, obligaciones como empleador u otros regímenes.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
            {cards.map(item => (
              <div key={item.title} style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: V.tealDark, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>🔄 ¿Cuándo dejás de poder estar en Monotributo?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            No hay un único “monto para pasar a Responsable Inscripto”. El Monotributo tiene varios parámetros y causales de exclusión. El nivel de ingresos es uno de ellos, pero también deben revisarse los demás requisitos del régimen.
          </p>
          <div style={{ background: V.goldLight, border: `1px solid ${V.goldRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#7a4f00', lineHeight: 1.6 }}>
            📌 <strong>Referencia vigente:</strong> desde el 1 de agosto de 2026, ARCA publica para la categoría K un máximo de ingresos brutos anuales de <strong>$126.610.838,75</strong>. Ese valor se actualiza, por eso no debe tratarse como un tope permanente.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>💰 IVA: qué tenés que hacer todos los meses</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Cuando vendés operaciones gravadas generás <strong>débito fiscal</strong>. En determinadas compras y gastos vinculados con tu actividad podés computar <strong>crédito fiscal</strong>. Esa comparación es una parte central del cálculo mensual, pero el saldo final también puede incluir saldos anteriores, retenciones, percepciones y otros conceptos.
          </p>
          <p style={paraStyle}>
            Desde noviembre de 2025, ARCA exige a los responsables inscriptos determinar y presentar el IVA mediante <strong>IVA Simple</strong>, dentro del Portal IVA.
          </p>
          <div style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 700, color: V.tealDark, lineHeight: 1.6 }}>
            ✅ <strong>En Fácil Fiscal:</strong> podés estimar tu IVA, ver cuándo vence y activar un recordatorio para no depender de memorizar la fecha.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>📄 ¿Qué factura emite un Responsable Inscripto?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>La clase de comprobante depende de quién recibe la factura:</p>
          {facturas.map(item => (
            <div key={item.tipo} style={{ background: V.bg, border: `1px solid ${V.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 4 }}>{item.tipo}</div>
              <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
          <div style={{ background: V.redBg, border: `1px solid ${V.redRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#7a2020', lineHeight: 1.6, marginTop: 8 }}>
            ⚠️ <strong>Importante:</strong> una operación con un monotributista no se factura con B. ARCA establece comprobante clase A para ese receptor, con las leyendas y condiciones que correspondan.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>📅 Vencimientos: no todos caen el mismo día</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            IVA, Ganancias, anticipos, Autónomos y otras obligaciones siguen calendarios diferentes. Algunas fechas dependen de la terminación de tu CUIT y ARCA también puede disponer prórrogas o cambios durante el año.
          </p>
          <p style={paraStyle}>
            Por eso Fácil Fiscal no intenta que memorices fechas: te muestra los <strong>próximos vencimientos</strong> y puede enviarte <strong>recordatorios</strong> antes de que lleguen.
          </p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>❓ Preguntas frecuentes</div>
        {faqs.map((item, i) => (
          <div key={item.q} style={{ padding: '12px 16px', borderBottom: i === faqs.length - 1 ? 'none' : `1px solid ${V.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 6 }}>▸ {item.q}</div>
            <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>🔎 Fuentes y revisión</div>
        <div style={bodyStyle}>
          <p style={{ ...paraStyle, marginBottom: 8 }}>
            Contenido revisado con información oficial de ARCA sobre Régimen General, IVA Simple, categorías vigentes del Monotributo y clases de comprobantes.
          </p>
          <p style={{ ...paraStyle, marginBottom: 0 }}>
            Fácil Fiscal simplifica la información para ayudarte a entender qué hacer, pero el tratamiento definitivo depende de tu situación fiscal concreta y de la normativa vigente.
          </p>
        </div>
      </section>
    </>
  )
}