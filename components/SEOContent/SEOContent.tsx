// Componente de contenido SEO — se inserta entre secciones de las páginas principales
// No tiene lógica de cliente, es puro contenido HTML semántico

const V = {
  tealDark: '#0d5c78', teal: '#1a7fa8', tealLight: '#e8f6fb', tealRing: '#a8ddf0',
  gold: '#f5a623', goldLight: '#fff8ec', goldRing: '#fde4a0',
  bg: '#f4f7f9', surface: '#fff', border: '#e2e8ed',
  ink: '#0f2733', ink2: '#3d5a6b', ink3: '#7a9aaa',
  red: '#e53535', redBg: '#fff1f1', redRing: '#ffc8c8',
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

const bodyStyle = {
  padding: '16px',
}

const paraStyle = {
  fontSize: 13,
  color: V.ink2,
  fontWeight: 600 as const,
  lineHeight: 1.75,
  marginBottom: 12,
}

const faqStyle = {
  borderBottom: `1px solid ${V.border}`,
  padding: '12px 16px',
}

// ── MONOTRIBUTO ──────────────────────────────────────────
export function SEOMonotributo() {
  return (
    <>
      {/* QUÉ ES */}
      <section style={sectionStyle}>
        <div style={headerStyle}>📋 ¿Qué es el Monotributo?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            El Monotributo es un régimen simplificado de la AFIP/ARCA que permite a trabajadores independientes, profesionales y pequeños negocios pagar <strong>un solo monto fijo por mes</strong> en lugar de liquidar impuestos por separado. Con ese pago único cubrís el IVA, Ganancias, tu aporte jubilatorio y la obra social.
          </p>
          <p style={paraStyle}>
            Es ideal si trabajás de forma independiente, tenés un negocio chico o empezás a facturar. Si tus ingresos superan los $72 millones anuales, tenés que pasar al régimen general como Responsable Inscripto.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
            {[
              { icon: '✅', title: 'Un solo pago', desc: 'IVA + Ganancias + jubilación + obra social en una cuota' },
              { icon: '📅', title: 'Pago mensual', desc: 'Vence los primeros días de cada mes según tu CUIT' },
              { icon: '📄', title: 'Factura C', desc: 'Como monotributista emitís siempre Factura C' },
              { icon: '🔄', title: 'Recategorización', desc: 'Se revisa cada 6 meses: enero-febrero y julio-agosto' },
            ].map(item => (
              <div key={item.title} style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: V.tealDark, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO SE PAGA */}
      <section style={sectionStyle}>
        <div style={headerStyle}>💳 ¿Cómo y cuándo se paga?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            El pago se hace todos los meses a través de ARCA (ex AFIP). El vencimiento depende del <strong>último dígito de tu CUIT</strong>: si termina en 0 a 4, vence los primeros días; si termina en 5 a 9, vence unos días después.
          </p>
          <p style={paraStyle}>
            Para pagar generás un <strong>VEP (Volante Electrónico de Pago)</strong> desde el sitio de ARCA y lo pagás desde el home banking de tu banco. También podés pagar en cajero automático con débito o en Pago Fácil/Rapipago con el formulario impreso.
          </p>
          <div style={{ background: V.goldLight, border: `1px solid ${V.goldRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#7a4f00', lineHeight: 1.6 }}>
            💡 <strong>Tip:</strong> Si pagás después del vencimiento te cobran un recargo. Si no pagás 3 meses seguidos, AFIP puede darte de baja del Monotributo automáticamente.
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section style={sectionStyle}>
        <div style={headerStyle}>📊 ¿Cómo sé en qué categoría estoy?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Las categorías van de la A a la K y se determinan por tu <strong>facturación anual</strong> (lo que facturaste en los últimos 12 meses). Cada categoría tiene un límite de ingresos y una cuota mensual diferente.
          </p>
          <p style={paraStyle}>
            Si facturás más de lo que permite tu categoría durante 3 meses, tenés que recategorizarte a una categoría más alta. Si facturás menos de lo que permite la categoría inferior durante 6 meses, podés bajar. La recategorización se hace en enero-febrero y en julio-agosto de cada año.
          </p>
          <div style={{ background: V.redBg, border: `1px solid ${V.redRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#7a2020', lineHeight: 1.6 }}>
            ⚠️ <strong>Ojo:</strong> Si estás en una categoría más baja de la que te corresponde, AFIP puede recategorizarte de oficio y cobrarte las diferencias con intereses.
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section style={sectionStyle}>
        <div style={headerStyle}>❓ Preguntas frecuentes</div>
        {[
          {
            q: '¿Qué pasa si no pago el Monotributo un mes?',
            a: 'Te cobran un recargo por mora. Si no pagás 3 meses consecutivos, AFIP puede excluirte del régimen. Conviene regularizar lo antes posible — podés pagar los meses atrasados desde el portal de ARCA.',
          },
          {
            q: '¿Puedo tener empleados siendo monotributista?',
            a: 'Sí, podés tener hasta 3 empleados. Eso te permite estar en categorías más altas (hasta la K). Si tenés empleados también tenés que pagar cargas sociales aparte.',
          },
          {
            q: '¿Puedo trabajar en relación de dependencia y ser monotributista a la vez?',
            a: 'Sí. Podés ser empleado en relación de dependencia y al mismo tiempo tener el Monotributo activo para tus actividades independientes. Se consideran por separado.',
          },
          {
            q: '¿El Monotributo incluye obra social?',
            a: 'Sí, el componente de obra social está incluido en la cuota mensual. Podés elegir obra social en el padrón de ARCA. Si querés agregar un familiar, pagás un adicional.',
          },
          {
            q: '¿Qué es la recategorización y cuándo la tengo que hacer?',
            a: 'La recategorización es el proceso de revisar tu categoría según lo que facturaste en los últimos 12 meses. Se hace dos veces al año: en enero-febrero y en julio-agosto. Si no hacés nada, quedás en la misma categoría.',
          },
        ].map((item, i) => (
          <div key={i} style={{ ...faqStyle, borderBottom: i === 4 ? 'none' : `1px solid ${V.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 6 }}>▸ {item.q}</div>
            <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}
      </section>
    </>
  )
}

// ── RESPONSABLE INSCRIPTO ────────────────────────────────
export function SEOResponsableInscripto() {
  return (
    <>
      <section style={sectionStyle}>
        <div style={headerStyle}>🧾 ¿Qué es el Responsable Inscripto?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            El Responsable Inscripto (RI) es el régimen general de impuestos de AFIP. A diferencia del Monotributo, acá no pagás un monto fijo: pagás según lo que realmente ganaste y gastaste en el mes. Tenés que liquidar IVA, Ganancias y otros impuestos por separado cada mes.
          </p>
          <p style={paraStyle}>
            Pasás a ser Responsable Inscripto cuando tu facturación supera los $72 millones anuales, o cuando elegís ese régimen por conveniencia (por ejemplo, si tenés muchos gastos deducibles o trabajás con empresas que necesitan factura A).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
            {[
              { icon: '🧾', title: 'IVA mensual', desc: 'Declarás y pagás la diferencia entre lo que cobraste y lo que gastaste' },
              { icon: '💼', title: 'Ganancias', desc: 'Pagás anticipos mensuales según tu ganancia estimada anual' },
              { icon: '📄', title: 'Factura A y B', desc: 'Emitís factura A a otros RI y factura B a consumidores finales' },
              { icon: '📅', title: 'Vencimientos por CUIT', desc: 'El IVA vence entre los días 18 y 23 según el último dígito de tu CUIT' },
            ].map(item => (
              <div key={item.title} style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: V.tealDark, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>💰 ¿Cómo funciona el IVA?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            El IVA funciona en cadena. Cuando vendés, cobrás IVA a tus clientes (eso se llama <strong>débito fiscal</strong>). Cuando comprás insumos o servicios con factura A, pagás IVA a tus proveedores (eso es el <strong>crédito fiscal</strong>). Al final del mes, le pagás a AFIP solo la diferencia: débito − crédito.
          </p>
          <p style={paraStyle}>
            Si compraste más de lo que vendiste, tenés <strong>saldo a favor</strong> que se arrastra al mes siguiente. La tasa general del IVA en Argentina es del 21%.
          </p>
          <div style={{ background: V.goldLight, border: `1px solid ${V.goldRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#7a4f00', lineHeight: 1.6 }}>
            💡 <strong>Ejemplo:</strong> Si vendiste $1.000.000 (IVA débito: $210.000) y compraste $400.000 con factura (IVA crédito: $84.000), pagás a AFIP $126.000.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>📄 ¿Qué tipos de facturas emite un RI?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Como Responsable Inscripto emitís tres tipos de facturas según quién es tu cliente:
          </p>
          {[
            { tipo: 'Factura A', desc: 'Para clientes que también son Responsables Inscriptos. El IVA va discriminado (separado). Tu cliente puede usarla como crédito fiscal.', color: V.tealLight, ring: V.tealRing },
            { tipo: 'Factura B', desc: 'Para consumidores finales, monotributistas o exentos. El IVA está incluido en el precio (no discriminado).', color: V.goldLight, ring: V.goldRing },
            { tipo: 'Factura C', desc: 'La usan los monotributistas y exentos. Si sos RI, no emitís facturas C.', color: V.bg, ring: V.border },
          ].map(item => (
            <div key={item.tipo} style={{ background: item.color, border: `1px solid ${item.ring}`, borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 4 }}>{item.tipo}</div>
              <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
          <div style={{ background: V.redBg, border: `1px solid ${V.redRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#7a2020', lineHeight: 1.6, marginTop: 8 }}>
            ⚠️ <strong>Para emitir factura A</strong> necesitás tener habilitado el CBU en ARCA. Sin eso, solo podés emitir factura B.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>❓ Preguntas frecuentes</div>
        {[
          {
            q: '¿Cuándo tengo que pasar del Monotributo al régimen general?',
            a: 'Cuando tu facturación anual supera los $72 millones (categoría K del Monotributo). También podés elegir pasarte antes si te conviene por la cantidad de gastos deducibles que tenés.',
          },
          {
            q: '¿Qué son las retenciones de IVA?',
            a: 'Cuando un gran comprador (supermercados, empresas grandes) te paga, puede retenerte parte del IVA antes de depositarte el dinero. Esas retenciones las podés descontar de tu IVA a pagar del mes.',
          },
          {
            q: '¿Tengo que presentar declaración de IVA aunque no facturé nada?',
            a: 'Sí. Aunque no hayas tenido actividad, tenés que presentar la declaración jurada en cero. Si no lo hacés, AFIP te aplica una multa.',
          },
          {
            q: '¿Qué es el anticipo de Ganancias?',
            a: 'Es un pago mensual a cuenta del impuesto a las Ganancias del año. Se calcula en base al impuesto determinado el año anterior. Si tu situación cambió mucho, podés pedir reducción de anticipos.',
          },
        ].map((item, i, arr) => (
          <div key={i} style={{ ...faqStyle, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${V.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 6 }}>▸ {item.q}</div>
            <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}
      </section>
    </>
  )
}

// ── AUTÓNOMOS ────────────────────────────────────────────
export function SEOAutonomos() {
  return (
    <>
      <section style={sectionStyle}>
        <div style={headerStyle}>⚡ ¿Qué es un trabajador autónomo?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Un autónomo es una persona que trabaja de forma independiente sin ser monotributista. Generalmente son profesionales con ingresos más altos o personas que por el tipo de actividad no pueden acceder al Monotributo. Los autónomos pagan sus aportes jubilatorios por separado y pueden estar inscriptos en IVA y Ganancias al mismo tiempo.
          </p>
          <p style={paraStyle}>
            A diferencia del Monotributo, el régimen de autónomos no tiene un pago único: cada impuesto se liquida por separado. Los aportes jubilatorios se pagan mensualmente según la categoría en la que estés inscripto.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
            {[
              { icon: '⚡', title: 'Aportes mensuales', desc: 'Pagás aportes jubilatorios todos los meses según tu categoría (I a V)' },
              { icon: '🧾', title: 'Podés estar en IVA', desc: 'Si tu actividad lo requiere, también tenés que liquidar IVA mensualmente' },
              { icon: '💼', title: 'Ganancias', desc: 'Pagás el impuesto a las Ganancias con anticipos mensuales' },
              { icon: '📅', title: 'Vence el día 8', desc: 'El aporte mensual de autónomos vence el día 8 de cada mes' },
            ].map(item => (
              <div key={item.title} style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: V.tealDark, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>📊 Categorías de autónomos</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            Las categorías de autónomos van de la I a la V y se determinan por el tipo de actividad y los ingresos. Cada categoría tiene un monto de aporte mensual diferente que se actualiza periódicamente por inflación.
          </p>
          {[
            { cat: 'Categoría I', desc: 'Actividades de menor escala. Aporte más bajo.', color: V.tealLight },
            { cat: 'Categoría II', desc: 'Actividades intermedias.', color: V.tealLight },
            { cat: 'Categoría III', desc: 'Profesionales y actividades de mayor facturación.', color: V.goldLight },
            { cat: 'Categoría IV', desc: 'Actividades de alto volumen.', color: V.goldLight },
            { cat: 'Categoría V', desc: 'La categoría más alta, para actividades de mayor envergadura.', color: V.redBg },
          ].map(item => (
            <div key={item.cat} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${V.border}` }}>
              <div style={{ background: item.color, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 800, color: V.tealDark, flexShrink: 0 }}>{item.cat}</div>
              <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600 }}>{item.desc}</div>
            </div>
          ))}
          <div style={{ background: V.goldLight, border: `1px solid ${V.goldRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#7a4f00', lineHeight: 1.6, marginTop: 12 }}>
            💡 Los montos exactos de cada categoría se actualizan por inflación. Siempre verificá el monto vigente en ARCA antes de pagar.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>❓ Preguntas frecuentes</div>
        {[
          {
            q: '¿Cuál es la diferencia entre autónomo y monotributista?',
            a: 'El monotributista paga un monto fijo mensual que incluye todo (IVA, Ganancias, jubilación, obra social). El autónomo paga cada impuesto por separado y generalmente tiene ingresos más altos o una actividad que no encaja en el Monotributo.',
          },
          {
            q: '¿Puedo ser autónomo y monotributista a la vez?',
            a: 'No podés estar en ambos regímenes para la misma actividad. Pero sí podés ser autónomo en tu actividad principal y tener otra actividad secundaria en Monotributo, siempre que sean actividades distintas.',
          },
          {
            q: '¿Los autónomos tienen obra social?',
            a: 'Los autónomos no tienen obra social incluida en sus aportes como los monotributistas. Pueden acceder a la obra social de su actividad (por ejemplo, la del colegio profesional correspondiente) o contratar una prepaga de forma particular.',
          },
          {
            q: '¿Qué pasa si no pago los aportes de autónomo?',
            a: 'Se acumulan deudas con intereses. Además, los meses no pagados no cuentan para la jubilación. Si dejás de pagar por mucho tiempo, podés perder el beneficio jubilatorio de esos períodos.',
          },
        ].map((item, i, arr) => (
          <div key={i} style={{ ...faqStyle, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${V.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 6 }}>▸ {item.q}</div>
            <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}
      </section>
    </>
  )
}

// ── CÓMO FACTURAR ────────────────────────────────────────
export function SEOComoFacturar() {
  return (
    <>
      <section style={sectionStyle}>
        <div style={headerStyle}>📄 Tipos de facturas en Argentina</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            En Argentina existen diferentes tipos de facturas según tu situación impositiva y la de tu cliente. Emitir el tipo incorrecto puede traerte problemas con AFIP, así que es importante entender cuándo usar cada una.
          </p>
          {[
            {
              tipo: 'Factura A',
              quien: 'Responsables Inscriptos → Responsables Inscriptos',
              desc: 'Se emite cuando ambas partes son RI. El IVA aparece discriminado (separado del precio). Tu cliente puede usar ese IVA como crédito fiscal. Requiere CBU validado en ARCA.',
              color: V.tealLight, ring: V.tealRing,
            },
            {
              tipo: 'Factura B',
              quien: 'Responsables Inscriptos → Consumidores finales / Monotributistas',
              desc: 'Se emite cuando el cliente es consumidor final, monotributista o exento. El IVA está incluido en el precio y no se discrimina.',
              color: V.goldLight, ring: V.goldRing,
            },
            {
              tipo: 'Factura C',
              quien: 'Monotributistas → Cualquier cliente',
              desc: 'La usan exclusivamente los monotributistas. No discrimina IVA porque ya está incluido en la cuota del Monotributo. Es la más simple de emitir.',
              color: V.bg, ring: V.border,
            },
            {
              tipo: 'Factura E',
              quien: 'Exportaciones de servicios',
              desc: 'Para operaciones con clientes del exterior. Tiene tratamiento impositivo especial (exenta de IVA en muchos casos).',
              color: V.redBg, ring: V.redRing,
            },
          ].map(item => (
            <div key={item.tipo} style={{ background: item.color, border: `1px solid ${item.ring}`, borderRadius: 10, padding: '14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: V.ink }}>{item.tipo}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: V.ink3, background: V.surface, border: `1px solid ${V.border}`, borderRadius: 20, padding: '2px 8px' }}>{item.quien}</div>
              </div>
              <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>⚡ ¿Cuándo tengo que emitir la factura?</div>
        <div style={bodyStyle}>
          <p style={paraStyle}>
            La factura se tiene que emitir <strong>en el momento en que entregás el producto o prestás el servicio</strong>, o cuando cobrás, lo que ocurra primero. No podés esperar a fin de mes para facturar todo junto.
          </p>
          {[
            { caso: 'Servicio', cuando: 'Al momento de prestar el servicio o al cobrar, lo primero que pase.' },
            { caso: 'Producto físico', cuando: 'Al momento de entregar el producto.' },
            { caso: 'Señas o anticipos', cuando: 'Cuando recibís el dinero, aunque todavía no entregaste nada.' },
            { caso: 'Suscripciones', cuando: 'Al inicio de cada período (mensual, trimestral, etc.).' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${V.border}`, alignItems: 'flex-start' }}>
              <div style={{ background: V.tealLight, border: `1px solid ${V.tealRing}`, borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: V.tealDark, flexShrink: 0, marginTop: 2 }}>{item.caso}</div>
              <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.6 }}>{item.cuando}</div>
            </div>
          ))}
          <div style={{ background: V.redBg, border: `1px solid ${V.redRing}`, borderRadius: 10, padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#7a2020', lineHeight: 1.6, marginTop: 12 }}>
            ⚠️ No emitir factura o hacerlo fuera de término puede resultar en multas de AFIP que van desde $100.000 hasta el cierre temporal del local.
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={headerStyle}>❓ Preguntas frecuentes</div>
        {[
          {
            q: '¿Qué es el CAE y por qué es importante?',
            a: 'El CAE (Código de Autorización Electrónica) es el código que ARCA genera para validar tu factura. Sin CAE la factura no tiene validez legal. Siempre verificá que aparezca antes de enviarla a tu cliente.',
          },
          {
            q: '¿Puedo anular una factura emitida?',
            a: 'Sí, dentro de las 24 horas desde la emisión podés anularla directamente en ARCA. Después de ese plazo tenés que emitir una nota de crédito por el mismo monto para cancelarla.',
          },
          {
            q: '¿Qué pasa si mi cliente no quiere que le facture?',
            a: 'Igual tenés que emitir la factura. Es tu obligación impositiva independientemente de lo que quiera el cliente. Si no lo hacés y AFIP lo detecta, la multa es tuya.',
          },
          {
            q: '¿Puedo facturar en dólares?',
            a: 'Sí, podés emitir facturas en dólares u otra moneda extranjera. ARCA va a mostrar el equivalente en pesos al tipo de cambio oficial del día de la operación.',
          },
          {
            q: '¿Tengo que conservar las facturas que me dan a mí?',
            a: 'Sí. Las facturas de tus compras las tenés que guardar por al menos 5 años. Son importantes para justificar gastos en caso de una inspección de AFIP.',
          },
        ].map((item, i, arr) => (
          <div key={i} style={{ ...faqStyle, borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${V.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: V.ink, marginBottom: 6 }}>▸ {item.q}</div>
            <div style={{ fontSize: 12, color: V.ink2, fontWeight: 600, lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}
      </section>
    </>
  )
}
