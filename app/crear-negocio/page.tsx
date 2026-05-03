'use client'
import SiteHeader from '@/components/SiteHeader'

export default function CrearNegocioPage() {
  return (
    <>
      <SiteHeader currentPath="/crear-negocio" />
      <div className="ff-page-content">
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f7f9',
          padding: '40px 24px',
          fontFamily: "'Nunito', sans-serif",
        }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
          <div style={{
            maxWidth: 520,
            textAlign: 'center',
            background: '#fff',
            borderRadius: 20,
            border: '1.5px solid #e2e8ed',
            padding: '52px 40px',
            boxShadow: '0 4px 24px rgba(13,92,120,.08)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🏗️</div>
            <h1 style={{
              fontSize: 26, fontWeight: 900, color: '#0f2733',
              margin: '0 0 12px', letterSpacing: '-0.3px',
            }}>
              Página en construcción
            </h1>
            <p style={{
              fontSize: 15, color: '#7a9aaa', fontWeight: 600,
              lineHeight: 1.7, margin: '0 0 32px',
            }}>
              Estamos trabajando en una guía paso a paso para ayudarte a crear tu negocio, elegir el régimen fiscal correcto y hacer todos los trámites sin complicaciones.
            </p>
            <div style={{
              background: '#e8f6fb',
              border: '1.5px solid #a8ddf0',
              borderRadius: 12,
              padding: '14px 18px',
              marginBottom: 32,
              fontSize: 13,
              color: '#0d5c78',
              fontWeight: 700,
            }}>
              📬 Próximamente disponible
            </div>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #0d5c78, #1a7fa8)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
