'use client'
import { diffDias, fmtLarga, type VencimientoUI } from '@/lib/data'

interface Props {
  venc: VencimientoUI
  index: number
}

export default function VencimientoCard({ venc, index }: Props) {
  const d = diffDias(venc.fecha)

  const config = d === 0
    ? { card: 'urgente',   icon: 'icon-red',   pill: 'sp-red',   pillTxt: '🔴 Vence HOY',     diasCls: 'dias-red',   diasTxt: '¡HOY!',       btnDanger: true,  btnTxt: 'Pagar ahora →' }
    : d === 1
    ? { card: 'proximo',   icon: 'icon-amber', pill: 'sp-amber', pillTxt: '🟡 Vence mañana', diasCls: 'dias-amber', diasTxt: 'Mañana',       btnDanger: false, btnTxt: 'Ver cómo pagar' }
    : { card: 'tranquilo', icon: 'icon-teal',  pill: 'sp-teal',  pillTxt: `🟢 En ${d} días`, diasCls: 'dias-teal',  diasTxt: `En ${d} días`, btnDanger: false, btnTxt: 'Ver detalles' }

  const cardColors: Record<string, React.CSSProperties> = {
    urgente:   { borderColor: 'var(--red-ring)',  background: 'linear-gradient(150deg,#fff 65%,var(--red-bg))' },
    proximo:   { borderColor: 'var(--gold-ring)', background: 'linear-gradient(150deg,#fff 65%,var(--gold-light))' },
    tranquilo: { borderColor: 'var(--teal-ring)', background: 'linear-gradient(150deg,#fff 65%,var(--teal-light))' },
  }
  const iconColors: Record<string, string> = {
    'icon-red':   'var(--red-bg)',
    'icon-amber': 'var(--gold-light)',
    'icon-teal':  'var(--teal-light)',
  }
  const pillStyles: Record<string, React.CSSProperties> = {
    'sp-red':   { background: 'var(--red-bg)',    color: 'var(--red)',       border: '1.5px solid var(--red-ring)'  },
    'sp-amber': { background: 'var(--gold-light)', color: 'var(--amber)',    border: '1.5px solid var(--gold-ring)' },
    'sp-teal':  { background: 'var(--teal-light)', color: 'var(--teal-dark)',border: '1.5px solid var(--teal-ring)' },
  }
  const diasColors: Record<string, string> = {
    'dias-red':   'var(--red)',
    'dias-amber': 'var(--amber)',
    'dias-teal':  'var(--teal)',
  }

  return (
    <div style={{
      background: cardColors[config.card].background,
      border: `1.5px solid ${cardColors[config.card].borderColor}`,
      borderRadius: 'var(--r-xl)',
      padding: '22px 22px 18px',
      display: 'flex', flexDirection: 'column', gap: 13,
      boxShadow: 'var(--sh-sm)',
      animation: `cardUp .35s ease ${index * 0.09}s both`,
      cursor: 'default',
    }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: iconColors[config.icon],
          border: `1.5px solid ${cardColors[config.card].borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {venc.emoji}
        </div>
        <div style={{
          ...pillStyles[config.pill],
          display: 'inline-flex', alignItems: 'center', gap: 5,
          borderRadius: 20, padding: '5px 11px',
          fontSize: 11, fontWeight: 800, flexShrink: 0,
        }}>
          {config.pillTxt}
        </div>
      </div>

      {/* Body */}
      <div>
        <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.3px', lineHeight: 1.2, marginTop: 8 }}>
          {venc.nombre}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 600, marginTop: 2 }}>
          {venc.detalle}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 11 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink2)' }}>
          {fmtLarga(venc.fecha)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, color: diasColors[config.diasCls] }}>
          {config.diasTxt}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => window.open('https://www.afip.gob.ar', '_blank')}
        style={{
          width: '100%', border: 'none', borderRadius: 'var(--r-sm)',
          padding: 10, fontFamily: 'Nunito, sans-serif',
          fontSize: 13, fontWeight: 800, cursor: 'pointer',
          background: config.btnDanger ? 'var(--red)' : 'var(--bg)',
          color: config.btnDanger ? 'white' : 'var(--ink2)',
          transition: 'all .15s',
        } as React.CSSProperties}
      >
        {config.btnTxt}
      </button>
    </div>
  )
}
