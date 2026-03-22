'use client'
import { useState } from 'react'
import { TipoContribuyente } from '@/lib/types'
import { CATEGORIAS_MONO, OS_EXTRA, formatMoney } from '@/lib/data'

const CATS_RI = [
  { label: 'Pequeño RI',  imp: 18000, prev: 28000 },
  { label: 'Mediano RI',  imp: 35000, prev: 40000 },
  { label: 'Gran RI',     imp: 60000, prev: 50000 },
]
const CATS_AUT = [
  { label: 'Categoría I',   imp: 15000, prev: 22000 },
  { label: 'Categoría II',  imp: 22000, prev: 28000 },
  { label: 'Categoría III', imp: 32000, prev: 35000 },
  { label: 'Categoría IV',  imp: 48000, prev: 45000 },
]

export default function Calculadora({ tipo }: { tipo: TipoContribuyente }) {
  const [catIdx, setCatIdx] = useState<string>('')
  const [conOS, setConOS]   = useState(true)

  const cats =
    tipo === 'mono' ? CATEGORIAS_MONO.map((c, i) => ({ label: `Categoría ${c.letra} — hasta $${(c.limite_anual/1000000).toFixed(1)}M/año`, imp: c.imp, prev: c.prev, idx: i }))
    : tipo === 'ri' ? CATS_RI.map((c, i) => ({ ...c, idx: i }))
    : CATS_AUT.map((c, i) => ({ ...c, idx: i }))

  const selected = catIdx !== '' ? cats[parseInt(catIdx)] : null
  const os    = conOS && tipo === 'mono' ? OS_EXTRA : 0
  const total = selected ? selected.imp + selected.prev + os : 0

  return (
    <div>
      {/* Categoría */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>
          Tu categoría
        </div>
        <select
          value={catIdx}
          onChange={e => setCatIdx(e.target.value)}
          style={{
            width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
            padding: '10px 34px 10px 12px', fontFamily: 'Nunito, sans-serif',
            fontSize: 14, fontWeight: 600, color: 'var(--ink)',
            background: 'var(--bg)', appearance: 'none', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="" disabled>— Elegí tu categoría —</option>
          {cats.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
        </select>
      </div>

      {/* Obra social (solo mono) */}
      {tipo === 'mono' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>
            Obra social
          </div>
          <select
            value={conOS ? 'si' : 'no'}
            onChange={e => setConOS(e.target.value === 'si')}
            style={{
              width: '100%', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
              padding: '10px 12px', fontFamily: 'Nunito, sans-serif',
              fontSize: 14, fontWeight: 600, color: 'var(--ink)',
              background: 'var(--bg)', outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="si">Incluir obra social</option>
            <option value="no">Sin obra social</option>
          </select>
        </div>
      )}

      {/* Resultado */}
      <div style={{
        background: 'linear-gradient(135deg, var(--teal-dark), var(--teal-mid))',
        borderRadius: 'var(--r-sm)', padding: '18px 16px',
        textAlign: 'center', minHeight: 90,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected ? (
          <>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 5 }}>
              {formatMoney(total)}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600, marginBottom: 10 }}>
              por mes · valores estimados 2026
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              {[
                ['Impositivo', selected.imp],
                ['Previsional', selected.prev],
                ...(os ? [['Obra social', os]] : []),
              ].map(([label, val]) => (
                <div key={label as string} style={{
                  flex: 1, background: 'rgba(255,255,255,.1)', borderRadius: 7, padding: '7px 8px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.55)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'white', marginTop: 2 }}>{formatMoney(val as number)}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,.4)' }}>
            Seleccioná una categoría
          </div>
        )}
      </div>
      <p style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>
        Valores estimados. Verificá el monto exacto en{' '}
        <a href="https://www.afip.gob.ar" target="_blank" rel="noopener" style={{ color: 'var(--teal)' }}>afip.gob.ar</a>
      </p>
    </div>
  )
}
