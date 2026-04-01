'use client'
import Link from 'next/link'

export default function ResponsableInscriptoPage() {
  return (
    <>
      {/* HEADER */}
      <header className="ff-header">
        <div className="ff-header-inner">

          {/* LOGO */}
          <div style={{fontWeight: 800, color: 'var(--teal)'}}>
            📊 Fácil Fiscal
          </div>

          {/* SWITCHER */}
          <div className="ff-switcher">
            <Link href="/">
              <button className="ff-tipo-btn">Monotributo</button>
            </Link>

            <Link href="/responsable-inscripto">
              <button
                className="ff-tipo-btn"
                style={{background: 'var(--teal)', color: 'white'}}
              >
                Resp. Inscripto
              </button>
            </Link>

            <button className="ff-tipo-btn">Autónomo</button>
          </div>

          {/* CTA */}
          <button
            className="ff-cta"
            style={{
              background: 'var(--gold)',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 'var(--r-sm)',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔔 Alertas
          </button>

        </div>
      </header>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg,var(--teal),var(--teal-mid))',
        color: 'white',
        textAlign: 'center',
        padding: '60px 20px'
      }}>
        <h1 style={{fontSize: '28px', marginBottom: '10px'}}>
          Responsable Inscripto sin errores ni multas
        </h1>

        <p style={{opacity: 0.9}}>
          Te avisamos antes de cada vencimiento de IVA, Ganancias y más.
        </p>

        <button style={{
          marginTop: '20px',
          background: 'var(--gold)',
          border: 'none',
          padding: '12px 18px',
          borderRadius: 'var(--r)',
          fontWeight: 700,
          cursor: 'pointer'
        }}>
          Activar alertas GRATIS
        </button>
      </section>

      {/* CONTENIDO */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '30px 20px'
      }}>

        {/* CARD */}
        <div style={card}>
          <h2>¿Te pasa esto?</h2>
          <ul>
            <li>No sabés cuánto pagar de IVA</li>
            <li>Te olvidás de presentar declaraciones</li>
            <li>No sabés qué impuestos te corresponden</li>
            <li>Dependés del contador para todo</li>
          </ul>
        </div>

        <div style={card}>
          <h2>¿Qué tenés que pagar?</h2>
          <ul>
            <li><strong>IVA:</strong> mensual</li>
            <li><strong>Ganancias:</strong> anual</li>
            <li><strong>Ingresos Brutos:</strong> provincial</li>
            <li><strong>Autónomos:</strong> si aplica</li>
          </ul>
        </div>

        <div style={card}>
          <h2>Errores comunes</h2>
          <ul>
            <li>Presentar fuera de término</li>
            <li>No pagar a tiempo</li>
            <li>Confundir vencimientos</li>
          </ul>
        </div>

        <div style={{...card, textAlign: 'center'}}>
          <h2>Activá alertas gratis</h2>

          <div style={{marginTop: '15px'}}>
            <input
              type="email"
              placeholder="tu@email.com"
              style={{
                padding: '10px',
                width: '60%',
                marginRight: '10px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)'
              }}
            />

            <button style={{
              background: 'var(--gold)',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              fontWeight: 700
            }}>
              🔔 Activar
            </button>
          </div>
        </div>

      </main>
    </>
  )
}

const card = {
  background: 'white',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '20px',
  boxShadow: 'var(--sh)'
}
