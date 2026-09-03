import Link from 'next/link'

const section = {
  maxWidth: 820,
  margin: '0 auto',
  padding: '0 18px 42px',
} as const

const card = {
  background: '#fff',
  border: '1px solid #e2e8ed',
  borderRadius: 14,
  padding: 'clamp(20px, 4vw, 28px)',
  boxShadow: '0 2px 12px rgba(13,92,120,.06)',
} as const

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: 12,
  marginTop: 18,
} as const

const item = {
  background: '#f4f7f9',
  borderRadius: 10,
  padding: 16,
  lineHeight: 1.6,
} as const

export function IVASEOBlock() {
  return (
    <section style={section} aria-labelledby="como-calcular-iva">
      <div style={card}>
        <h2 id="como-calcular-iva" style={{ margin: '0 0 10px', fontSize: 24 }}>
          Cómo calcular el IVA a pagar, explicado fácil
        </h2>
        <p style={{ margin: 0, color: '#3d5a6b', lineHeight: 1.7 }}>
          El IVA de tus ventas se llama <strong>débito fiscal</strong>. El IVA de las compras válidas de tu negocio se llama <strong>crédito fiscal</strong>. La cuenta básica es: IVA de ventas menos IVA de compras. Después pueden descontarse retenciones, percepciones o saldos a favor admitidos.
        </p>
        <div style={grid}>
          <div style={item}><strong>1. Sumá tus ventas</strong><br />Usá el total facturado durante el mes.</div>
          <div style={item}><strong>2. Sumá tus compras</strong><br />Incluí solo comprobantes relacionados con tu actividad.</div>
          <div style={item}><strong>3. Compará ambos IVA</strong><br />La calculadora hace la separación automáticamente.</div>
        </div>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: '#e8f6fb', lineHeight: 1.65 }}>
          <strong>Ejemplo simple:</strong> si el IVA generado por tus ventas es $210.000 y tenés $84.000 de crédito fiscal válido, la diferencia inicial es $126.000. El resultado final puede cambiar por retenciones, percepciones y saldos anteriores.
        </div>
        <p style={{ margin: '16px 0 0', color: '#64748b', lineHeight: 1.65 }}>
          Desde noviembre de 2025, las declaraciones juradas originales y rectificativas de IVA se presentan mediante <strong>IVA Simple</strong>. Esta calculadora orienta el monto, pero no reemplaza la declaración ante ARCA.
        </p>
        <p style={{ margin: '14px 0 0' }}>
          <Link href="/responsable-inscripto-obligaciones" style={{ color: '#0d5c78', fontWeight: 800 }}>
            Ver todas las obligaciones de un Responsable Inscripto →
          </Link>
        </p>
      </div>
    </section>
  )
}

export function IIBBSEOBlock() {
  return (
    <section style={section} aria-labelledby="como-calcular-iibb">
      <div style={card}>
        <h2 id="como-calcular-iibb" style={{ margin: '0 0 10px', fontSize: 24 }}>
          Cómo calcular Ingresos Brutos sobre una factura
        </h2>
        <p style={{ margin: 0, color: '#3d5a6b', lineHeight: 1.7 }}>
          Como primera estimación, se multiplica el ingreso alcanzado por la alícuota que corresponde a tu actividad y jurisdicción. No existe un único porcentaje para todo el país: puede cambiar por provincia, actividad, padrón, nivel de ingresos y exenciones.
        </p>
        <div style={grid}>
          <div style={item}><strong>1. Elegí la jurisdicción</strong><br />Es la provincia donde está alcanzada tu actividad.</div>
          <div style={item}><strong>2. Indicá qué hacés</strong><br />La actividad determina la alícuota orientativa.</div>
          <div style={item}><strong>3. Ingresá lo facturado</strong><br />La calculadora estima el impuesto del período.</div>
        </div>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: '#ecfdf5', lineHeight: 1.65 }}>
          <strong>Ejemplo simple:</strong> si la base alcanzada es $1.000.000 y tu alícuota es 3%, el impuesto inicial sería $30.000. Si ya sufriste retenciones o percepciones, pueden reducir el saldo a pagar.
        </div>
        <p style={{ margin: '16px 0 0', color: '#64748b', lineHeight: 1.65 }}>
          Si trabajás en más de una jurisdicción, puede corresponder Convenio Multilateral. En ese caso no alcanza con elegir una sola provincia: hay que distribuir los ingresos según las reglas aplicables.
        </p>
        <p style={{ margin: '14px 0 0' }}>
          <Link href="/impuestos-por-provincia" style={{ color: '#0d5c78', fontWeight: 800 }}>
            Consultar impuestos y organismos provinciales →
          </Link>
        </p>
      </div>
    </section>
  )
}

export function RelatedGuide({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <aside style={{ ...card, marginBottom: 24, borderColor: '#a8ddf0', background: '#f7fcfe' }}>
      <div style={{ fontSize: 12, color: '#1a7fa8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>Guía relacionada</div>
      <h2 style={{ margin: '6px 0', fontSize: 19 }}>{title}</h2>
      <p style={{ margin: '0 0 10px', color: '#3d5a6b', lineHeight: 1.6 }}>{text}</p>
      <Link href={href} style={{ color: '#0d5c78', fontWeight: 800 }}>Leer la guía →</Link>
    </aside>
  )
}
