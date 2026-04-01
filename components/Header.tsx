'use client'
import Image from 'next/image'
import { TipoContribuyente } from '@/lib/types'

interface HeaderProps {
  tipo: TipoContribuyente
  onTipoChange: (t: TipoContribuyente) => void
  onAlertasClick: () => void
}

const TIPOS: { key: TipoContribuyente; label: string }[] = [
  { key: 'mono', label: 'Monotributo' },
  { key: 'ri',   label: 'Resp. Inscripto' },
  { key: 'aut',  label: 'Autónomo' },
]

export default function Header({ tipo, onTipoChange, onAlertasClick }: HeaderProps) {
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: 'var(--sh-sm)',
    }}>
      <div className="ff-header-inner">

        {/* LOGO */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          {/* Reemplazá con: <Image src="/logo.png" alt="Fácil Fiscal" width={44} height={44} /> */}
          <LogoSVG />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <div style={{ display: 'flex' }}>
              <span style={{ fontSize: 19, fontWeight: 900, color: 'var(--teal-dark)', letterSpacing: '-0.3px' }}>Fácil</span>
              <span style={{ fontSize: 19, fontWeight: 900, color: 'var(--teal)', letterSpacing: '-0.3px' }}> Fiscal</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--ink3)', letterSpacing: '0.3px', marginTop: 3 }}>
              Tu solución contable y fiscal simplificada
            </span>
          </div>
        </a>

        {/* TIPO SWITCHER */}
        <div className="ff-switcher">
          {TIPOS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onTipoChange(key)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--r-sm)',
                border: 'none',
                background: tipo === key ? 'var(--teal)' : 'none',
                color: tipo === key ? 'white' : 'var(--ink3)',
                fontFamily: 'Nunito, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all .18s',
                boxShadow: tipo === key ? 'var(--sh-sm)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          className="ff-cta"
          onClick={onAlertasClick}
          style={{
            background: 'var(--gold)',
            color: 'var(--ink)',
            border: 'none',
            borderRadius: 'var(--r-sm)',
            padding: '9px 20px',
            fontFamily: 'Nunito, sans-serif',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(245,166,35,.35)',
          }}
        >
          🔔 Activar alertas
        </button>
      </div>
    </header>
  )
}

// SVG del logo replicando la marca (reemplazar con <Image> cuando tengas el .png)
function LogoSVG() {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width={44} height={44}>
      <rect x="6" y="4" width="24" height="30" rx="4" fill="#1a7fa8"/>
      <rect x="10" y="11" width="12" height="2.5" rx="1.25" fill="rgba(255,255,255,.5)"/>
      <rect x="10" y="16" width="16" height="2.5" rx="1.25" fill="rgba(255,255,255,.4)"/>
      <rect x="10" y="21" width="10" height="2.5" rx="1.25" fill="rgba(255,255,255,.3)"/>
      <path d="M24 4 L30 10 L24 10 Z" fill="rgba(255,255,255,.25)"/>
      <path d="M10 24 L17 31 L32 15" stroke="#f5a623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
