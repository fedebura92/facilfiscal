'use client'
import { useState } from 'react'
import { TipoContribuyente } from '@/lib/types'
import { CATEGORIAS_MONO, formatMoney } from '@/lib/data'

export default function Calculadora({ tipo }: { tipo: TipoContribuyente }) {
  const [catIdx, setCatIdx] = useState<string>('')
  const [conOS, setConOS]   = useState(true)
  const [actividad, setActividad] = useState<'servicios'|'productos'>('servicios')

  const cats =
    tipo === 'mono' ? CATEGORIAS_MONO.map((c, i) => ({ label: `Categoría ${c.letra} — hasta $${(c.limite_anual/1000000).toFixed(1)}M/año`, imp: actividad==='productos'?(c.imp_productos??c.imp):c.imp, prev: c.prev, os:c.os??0, idx: i })) : []

  const selected = catIdx !== '' ? cats[parseInt(catIdx)] : null
  const os    = conOS && tipo === 'mono' ? (selected?.os ?? 0) : 0
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
          <div style={{ fontSize:11,fontWeight:800,marginBottom:6 }}>Actividad</div>
          <select value={actividad} onChange={e=>setActividad(e.target.value as 'servicios'|'productos')} style={{width:'100%',padding:10,border:'1.5px solid var(--border)',borderRadius:8,marginBottom:12}}><option value="servicios">Servicios / locaciones</option><option value="productos">Venta de cosas muebles</option></select>
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
              por mes · vigente desde agosto de 2026
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
        Fuente oficial:{' '}<a href="https://www.arca.gob.ar/monotributo/categorias.asp" target="_blank" rel="noopener" style={{ color: 'var(--teal)' }}>ARCA</a>
      </p>
    </div>
  )
}
