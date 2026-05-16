'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const V = {
  tealDark:'#0d5c78', teal:'#1a7fa8', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
  gold:'#f5a623', goldLight:'#fff8ec',
  red:'#e53535', redBg:'#fff1f1', redRing:'#ffc8c8',
  amber:'#d97706', amberBg:'#fffbeb', amberRing:'#fde68a',
  green:'#16a34a', greenBg:'#f0fdf4', greenRing:'#bbf7d0',
  bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed',
  ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
}

// Tipos de comprobante según régimen
const COMPROBANTES_MONO = [
  { codigo: '11', label: 'Factura C' },
  { codigo: '15', label: 'Recibo C' },
]
const COMPROBANTES_RI = [
  { codigo: '1',  label: 'Factura A' },
  { codigo: '6',  label: 'Factura B' },
  { codigo: '51', label: 'Factura M' },
  { codigo: '3',  label: 'Nota de Crédito A' },
  { codigo: '8',  label: 'Nota de Crédito B' },
]

const ALICUOTAS_IVA = [
  { valor: 0,    label: 'Exento (0%)' },
  { valor: 10.5, label: '10.5%' },
  { valor: 21,   label: '21%' },
  { valor: 27,   label: '27%' },
]

const inp: React.CSSProperties = {
  border: `1.5px solid #e2e8ed`, borderRadius: 10, padding: '10px 14px',
  fontSize: 13, fontWeight: 600, color: '#0f2733', background: '#f4f7f9',
  outline: 'none', fontFamily: "'Nunito', sans-serif", width: '100%', boxSizing: 'border-box',
}

interface Perfil {
  tipo_contribuyente: string
  nombre: string
}

export default function FacturacionPage() {
  const [perfil, setPerfil]               = useState<Perfil|null>(null)
  const [loading, setLoading]             = useState(true)
  const [tab, setTab]                     = useState<'nueva'|'historial'|'como'>('nueva')

  // Campos de la factura
  const [tipoComp, setTipoComp]           = useState('')
  const [receptor, setReceptor]           = useState('')
  const [cuitReceptor, setCuitReceptor]   = useState('')
  const [concepto, setConcepto]           = useState('1') // 1=productos, 2=servicios, 3=ambos
  const [descripcion, setDescripcion]     = useState('')
  const [neto, setNeto]                   = useState('')
  const [alicuota, setAlicuota]           = useState(21)
  const [fechaServDesde, setFechaServDesde] = useState('')
  const [fechaServHasta, setFechaServHasta] = useState('')
  const [generando, setGenerando]         = useState(false)
  const [resultado, setResultado]         = useState<any>(null)
  const [error, setError]                 = useState('')

  // Historial (desde tabla facturas)
  const [historial, setHistorial]         = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const [{ data: profileData }, { data: facturasData }] = await Promise.all([
        supabase.from('profiles').select('tipo_contribuyente, nombre').eq('id', user.id).single(),
        supabase.from('facturas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])

      if (profileData) {
        setPerfil(profileData)
        // Default tipo comprobante según régimen
        if (profileData.tipo_contribuyente === 'mono') setTipoComp('11')
        else if (profileData.tipo_contribuyente === 'ri') setTipoComp('1')
      }
      setHistorial(facturasData || [])
      setLoading(false)
    }
    load()
  }, [])

  const netoNum   = parseFloat(neto) || 0
  const ivaNum    = netoNum * (alicuota / 100)
  const totalNum  = netoNum + ivaNum
  const esRI      = perfil?.tipo_contribuyente === 'ri'
  const comprobantes = perfil?.tipo_contribuyente === 'mono' ? COMPROBANTES_MONO : COMPROBANTES_RI

  const generarFactura = async () => {
    if (!receptor || !neto || !tipoComp) {
      setError('Completá receptor, monto y tipo de comprobante.')
      return
    }
    setGenerando(true)
    setError('')
    setResultado(null)

    try {
      // Llamar a la API route que comunica con AFIP
      const res = await fetch('/api/facturacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoComprobante: parseInt(tipoComp),
          receptor,
          cuitReceptor: cuitReceptor || null,
          concepto: parseInt(concepto),
          descripcion,
          importeNeto: netoNum,
          alicuotaIVA: esRI ? alicuota : 0,
          importeIVA: esRI ? ivaNum : 0,
          importeTotal: totalNum,
          fechaServicioDesde: concepto !== '1' ? fechaServDesde : null,
          fechaServicioHasta: concepto !== '1' ? fechaServHasta : null,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Error al generar la factura.')
      } else {
        setResultado(data)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", color:V.ink3 }}>Cargando...</div>
  )

  return (
    <div style={{ minHeight:'100vh', background:V.bg, fontFamily:"'Nunito',sans-serif", color:V.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Topbar */}
      <header style={{ background:V.surface, borderBottom:`1px solid ${V.border}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 4px rgba(13,92,120,.07)', position:'sticky', top:0, zIndex:100 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height:44, width:'auto' }} />
        </Link>
        <Link href="/mipanel" style={{ fontSize:13, fontWeight:700, color:V.ink3, textDecoration:'none' }}>← Mi panel</Link>
      </header>

      <main style={{ maxWidth:760, margin:'0 auto', padding:'28px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ fontSize:24, fontWeight:900, color:V.ink, margin:'0 0 4px' }}>🧾 Facturación electrónica</h1>
          <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0 }}>
            {perfil?.tipo_contribuyente === 'mono' ? 'Factura C para monotributistas' : 'Facturas A, B y M para Responsables Inscriptos'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:V.surface, borderRadius:12, padding:4, border:`1.5px solid ${V.border}` }}>
          {([
            { id:'nueva',     label:'✏️ Nueva factura' },
            { id:'historial', label:'📋 Historial' },
            { id:'como',      label:'❓ Cómo funciona' },
          ] as const).map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, padding:'10px', border:'none', borderRadius:8,
              background:tab===t.id?V.teal:'transparent',
              color:tab===t.id?'#fff':V.ink3,
              fontSize:12, fontWeight:tab===t.id?800:600,
              cursor:'pointer', fontFamily:"'Nunito',sans-serif",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── NUEVA FACTURA ── */}
        {tab === 'nueva' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Tipo de comprobante */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:800, color:V.ink, marginBottom:14 }}>Tipo de comprobante</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {comprobantes.map(c => (
                  <button key={c.codigo} onClick={()=>setTipoComp(c.codigo)} style={{
                    padding:'10px 18px', border:`2px solid ${tipoComp===c.codigo?V.teal:V.border}`,
                    borderRadius:10, background:tipoComp===c.codigo?V.tealLight:V.surface,
                    color:tipoComp===c.codigo?V.tealDark:V.ink2,
                    fontSize:13, fontWeight:tipoComp===c.codigo?800:600,
                    cursor:'pointer', fontFamily:"'Nunito',sans-serif",
                  }}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* Receptor */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:800, color:V.ink, marginBottom:14 }}>Receptor</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Nombre / Razón social *</label>
                  <input type="text" placeholder="Consumidor Final" value={receptor} onChange={e=>setReceptor(e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>CUIT (opcional para B y C)</label>
                  <input type="text" placeholder="20-12345678-9" value={cuitReceptor} onChange={e=>setCuitReceptor(e.target.value)} style={inp} />
                </div>
              </div>
            </div>

            {/* Concepto */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:800, color:V.ink, marginBottom:14 }}>Concepto y detalle</div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {[{v:'1',l:'Productos'},{v:'2',l:'Servicios'},{v:'3',l:'Productos y servicios'}].map(op=>(
                  <button key={op.v} onClick={()=>setConcepto(op.v)} style={{
                    padding:'8px 16px', border:`2px solid ${concepto===op.v?V.teal:V.border}`,
                    borderRadius:8, background:concepto===op.v?V.tealLight:V.surface,
                    color:concepto===op.v?V.tealDark:V.ink2,
                    fontSize:12, fontWeight:concepto===op.v?800:600,
                    cursor:'pointer', fontFamily:"'Nunito',sans-serif",
                  }}>{op.l}</button>
                ))}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Descripción</label>
                <input type="text" placeholder="Descripción del producto o servicio" value={descripcion} onChange={e=>setDescripcion(e.target.value)} style={inp} />
              </div>
              {concepto !== '1' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Período desde</label>
                    <input type="date" value={fechaServDesde} onChange={e=>setFechaServDesde(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Período hasta</label>
                    <input type="date" value={fechaServHasta} onChange={e=>setFechaServHasta(e.target.value)} style={inp} />
                  </div>
                </div>
              )}
            </div>

            {/* Importes */}
            <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:800, color:V.ink, marginBottom:14 }}>Importes</div>
              <div style={{ display:'grid', gridTemplateColumns: esRI ? '1fr 1fr' : '1fr', gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Importe neto *</label>
                  <input type="number" placeholder="Ej: 100000" value={neto} onChange={e=>setNeto(e.target.value)} style={inp} />
                </div>
                {esRI && (
                  <div>
                    <label style={{ fontSize:11, fontWeight:700, color:V.ink2, display:'block', marginBottom:5 }}>Alícuota IVA</label>
                    <select value={alicuota} onChange={e=>setAlicuota(Number(e.target.value))} style={inp}>
                      {ALICUOTAS_IVA.map(a=><option key={a.valor} value={a.valor}>{a.label}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Resumen */}
              {netoNum > 0 && (
                <div style={{ background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, borderRadius:12, padding:'16px 20px', color:'#fff' }}>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, opacity:.8 }}>
                      <span>Neto gravado</span>
                      <span>${netoNum.toLocaleString('es-AR')}</span>
                    </div>
                    {esRI && alicuota > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, opacity:.8 }}>
                        <span>IVA {alicuota}%</span>
                        <span>${ivaNum.toLocaleString('es-AR')}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:18, fontWeight:900, borderTop:'1px solid rgba(255,255,255,.2)', paddingTop:8, marginTop:2 }}>
                      <span>Total</span>
                      <span>${totalNum.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{ background:V.redBg, border:`1px solid ${V.redRing}`, borderRadius:10, padding:'12px 16px', fontSize:13, fontWeight:600, color:V.red }}>⚠️ {error}</div>
            )}

            {/* Resultado exitoso */}
            {resultado && (
              <div style={{ background:V.greenBg, border:`1.5px solid ${V.greenRing}`, borderRadius:14, padding:20 }}>
                <div style={{ fontSize:14, fontWeight:800, color:V.green, marginBottom:12 }}>✅ Factura generada correctamente</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'CAE', valor:resultado.cae },
                    { label:'Vto. CAE', valor:resultado.caeVto },
                    { label:'N° comprobante', valor:resultado.nroComprobante },
                    { label:'Fecha', valor:new Date().toLocaleDateString('es-AR') },
                  ].map((item,i)=>(
                    <div key={i} style={{ background:V.greenBg, border:`1px solid ${V.greenRing}`, borderRadius:8, padding:'10px 12px' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:V.green, textTransform:'uppercase', letterSpacing:'.04em' }}>{item.label}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginTop:3 }}>{item.valor}</div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setResultado(null)} style={{ marginTop:14, background:'none', border:`1.5px solid ${V.greenRing}`, borderRadius:8, padding:'8px 16px', fontSize:12, fontWeight:700, color:V.green, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}>
                  Nueva factura
                </button>
              </div>
            )}

            {!resultado && (
              <button onClick={generarFactura} disabled={generando||!receptor||!neto||!tipoComp} style={{
                background: receptor&&neto&&tipoComp ? `linear-gradient(135deg,${V.tealDark},${V.teal})` : V.border,
                color: receptor&&neto&&tipoComp ? '#fff' : V.ink3,
                border:'none', borderRadius:12, padding:'14px',
                fontSize:15, fontWeight:900, cursor:receptor&&neto&&tipoComp&&!generando?'pointer':'not-allowed',
                fontFamily:"'Nunito',sans-serif", opacity:generando?.6:1,
              }}>
                {generando ? 'Generando CAE en AFIP...' : 'Emitir factura →'}
              </button>
            )}
          </div>
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'historial' && (
          <div style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, overflow:'hidden' }}>
            {historial.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🧾</div>
                <p style={{ fontSize:13, color:V.ink3, fontWeight:600, margin:0 }}>Todavía no emitiste facturas. Las que generes van a aparecer acá.</p>
              </div>
            ) : historial.map((f,i)=>(
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 20px', borderBottom:i<historial.length-1?`1px solid ${V.border}`:'none', flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:V.ink }}>{f.cliente}</div>
                  {f.concepto && <div style={{ fontSize:11, color:V.ink3, fontWeight:600, marginTop:1 }}>{f.concepto}</div>}
                  <div style={{ fontSize:10, color:V.ink3, marginTop:1 }}>{new Date(f.fecha_emision).toLocaleDateString('es-AR')}</div>
                </div>
                <div style={{ fontSize:15, fontWeight:900, color:V.ink }}>${f.monto.toLocaleString('es-AR')}</div>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:f.estado==='cobrada'?V.greenBg:f.estado==='vencida'?V.redBg:V.amberBg, color:f.estado==='cobrada'?V.green:f.estado==='vencida'?V.red:V.amber }}>
                  {f.estado}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── CÓMO FUNCIONA ── */}
        {tab === 'como' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { num:'1', titulo:'Completá los datos', desc:'Ingresá el receptor, el concepto y el importe. Para servicios, indicá el período de prestación.' },
              { num:'2', titulo:'Revisá el total', desc:'El sistema calcula automáticamente el IVA según la alícuota que corresponda.' },
              { num:'3', titulo:'Emitís la factura', desc:'Fácil Fiscal se conecta con AFIP/ARCA y obtiene el CAE (Código de Autorización Electrónico) en segundos.' },
              { num:'4', titulo:'Descargá o compartí', desc:'Una vez aprobada, podés descargar el PDF o enviarla por email directamente al cliente.' },
            ].map((step,i)=>(
              <div key={i} style={{ background:V.surface, border:`1.5px solid ${V.border}`, borderRadius:14, padding:'18px 20px', display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${V.tealDark},${V.teal})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, flexShrink:0 }}>{step.num}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:800, color:V.ink, marginBottom:4 }}>{step.titulo}</div>
                  <div style={{ fontSize:13, color:V.ink3, fontWeight:600, lineHeight:1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ background:V.amberBg, border:`1px solid ${V.amberRing}`, borderRadius:12, padding:'14px 18px', fontSize:13, fontWeight:600, color:V.amber, lineHeight:1.6 }}>
              ⚠️ Para usar la facturación electrónica necesitás tener el certificado digital de AFIP configurado. Contactanos para la configuración inicial.
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
