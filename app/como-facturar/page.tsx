'use client'
import { useState, useEffect } from 'react'
import SiteHeader from '@/components/SiteHeader'
import { SEOComoFacturar } from '@/components/SEOContent'

export default function ComoFacturar() {
  const [aiQuery, setAiQuery] = useState('')
  const [aiResp, setAiResp]   = useState('')
  const [aiLoad, setAiLoad]   = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  async function askAI(q?: string) {
    const query = q || aiQuery
    if (!query.trim()) return
    if (q) setAiQuery(q)
    setAiLoad(true); setAiResp('')
    try {
      const r = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const d = await r.json()
      setAiResp(d.response || 'Sin respuesta.')
    } catch { setAiResp('Error de conexión.') }
    finally { setAiLoad(false) }
  }

  const V = {
    tealDark:'#0d5c78', teal:'#1a7fa8', tealLight:'#e8f6fb', tealRing:'#a8ddf0',
    gold:'#f5a623', goldLight:'#fff8ec', goldRing:'#fde4a0',
    bg:'#f4f7f9', surface:'#fff', border:'#e2e8ed',
    ink:'#0f2733', ink2:'#3d5a6b', ink3:'#7a9aaa',
  }

  const pasos = [
    {
      num: 1,
      titulo: 'Ingresá a ARCA con Clave Fiscal',
      desc: 'Entrá a arca.gob.ar o afip.gob.ar → "Con Clave Fiscal" → ingresá tu CUIT y contraseña.',
      nota: 'Necesitás Clave Fiscal nivel 3 o superior.',
    },
    {
      num: 2,
      titulo: 'Buscá "Comprobantes en línea"',
      desc: 'En "Mis Servicios" buscá el servicio "Comprobantes en línea" y hacé click en tu CUIT.',
      nota: null,
    },
    {
      num: 3,
      titulo: 'Habilitá tu Punto de Venta (primera vez)',
      desc: 'Si es tu primera vez, andá a "ABM Puntos de Venta" → habilitá un punto de venta electrónico (número 1 recomendado) → tipo "Comprobantes en línea".',
      nota: 'Solo se hace una vez. Después lo usás siempre.',
    },
    {
      num: 4,
      titulo: 'Seleccioná "Generar Comprobantes"',
      desc: 'Elegí tu punto de venta → Tipo de comprobante: Factura C (para monotributistas) → Concepto: Productos, Servicios o ambos.',
      nota: 'Como monotributista siempre emitís Factura C.',
    },
    {
      num: 5,
      titulo: 'Completá los datos del cliente',
      desc: 'Ingresá el CUIT/CUIL del cliente (el sistema valida automáticamente). Si es consumidor final sin CUIT, usá el CUIT genérico 00000000000.',
      nota: null,
    },
    {
      num: 6,
      titulo: 'Cargá el detalle de la operación',
      desc: 'Descripción del producto o servicio → cantidad → precio unitario. El sistema calcula el total automáticamente.',
      nota: null,
    },
    {
      num: 7,
      titulo: 'Confirmá y descargá el PDF',
      desc: 'ARCA genera el CAE (Código de Autorización Electrónica) que valida la factura. Descargá el PDF y enviáselo a tu cliente.',
      nota: 'Sin CAE la factura no es válida. Verificá que aparezca antes de entregar.',
    },
  ]

  if (!mounted) return null

  return (
    <>
      <SiteHeader currentPath="/como-facturar" />
      <div className="ff-page-content">
      <main style={{maxWidth:860,margin:'0 auto',padding:'32px 24px 80px'}}>

        {/* HERO */}
        <div style={{background:`linear-gradient(135deg,${V.tealDark},${V.teal})`,borderRadius:16,padding:'28px 32px',marginBottom:28,color:'white'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,.6)',marginBottom:6}}>Guía paso a paso</div>
          <div style={{fontSize:26,fontWeight:900,letterSpacing:'-0.3px',marginBottom:6}}>Cómo emitir tu Factura C electrónica</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.7)'}}>Para monotributistas · ARCA/AFIP · Actualizado 2026</div>
        </div>

        {/* VIDEO */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>
            🎥 Tutorial oficial AFIP/ARCA
          </div>
          <div style={{position:'relative',paddingBottom:'56.25%',height:0}}>
            <iframe
              src="https://www.youtube.com/embed/88p5Kl8Oh3o"
              title="Tutorial facturación electrónica AFIP ARCA"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
            />
          </div>
        </div>

        {/* PASOS */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${V.border}`,fontSize:14,fontWeight:800,color:V.ink}}>
            📋 Pasos para emitir tu factura
          </div>
          {pasos.map((p, i) => (
            <div key={p.num} style={{display:'flex',gap:16,padding:'16px 18px',borderBottom:i<pasos.length-1?`1px solid ${V.border}`:'none'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:V.tealLight,border:`2px solid ${V.teal}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:14,fontWeight:900,color:V.teal}}>
                {p.num}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:V.ink,marginBottom:4}}>{p.titulo}</div>
                <div style={{fontSize:13,color:V.ink2,lineHeight:1.6,marginBottom:p.nota?6:0}}>{p.desc}</div>
                {p.nota && (
                  <div style={{background:V.goldLight,border:`1px solid ${V.goldRing}`,borderRadius:6,padding:'5px 10px',fontSize:11,fontWeight:700,color:'#a06000'}}>
                    💡 {p.nota}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* INFO EXTRA */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
          <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:12,padding:'16px 18px',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
            <div style={{fontSize:13,fontWeight:800,color:V.ink,marginBottom:10}}>¿A quién le emito Factura C?</div>
            {[
              '✅ Consumidores finales (personas)',
              '✅ Responsables inscriptos en IVA',
              '✅ Otros monotributistas',
              '✅ Exentos y no responsables',
            ].map(t => <div key={t} style={{fontSize:12,color:V.ink2,fontWeight:600,marginBottom:4}}>{t}</div>)}
          </div>
          <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:12,padding:'16px 18px',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
            <div style={{fontSize:13,fontWeight:800,color:V.ink,marginBottom:10}}>Datos que necesitás del cliente</div>
            {[
              '📋 CUIT o CUIL del cliente',
              '📍 Sin CUIT: usá 00000000000',
              '💰 Descripción y monto del servicio',
              '📅 Fecha de emisión (hasta 10 días atrás)',
            ].map(t => <div key={t} style={{fontSize:12,color:V.ink2,fontWeight:600,marginBottom:4}}>{t}</div>)}
          </div>
        </div>

        {/* LINKS ÚTILES */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:12,padding:'16px 18px',marginBottom:24,boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{fontSize:13,fontWeight:800,color:V.ink,marginBottom:12}}>🔗 Links oficiales</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[
              {label:'Comprobantes en línea (ARCA)',href:'https://serviciosweb.afip.gob.ar/genericos/guiaspasopaso/VerGuia.aspx?id=163'},
              {label:'Facturador móvil (Android)',href:'https://www.afip.gob.ar/facturacion/facturadorMovil.asp'},
              {label:'Habilitar punto de venta',href:'https://www.argentina.gob.ar/emitir-factura-electronica-para-monotributistas'},
              {label:'Verificar CAE de una factura',href:'https://serviciosweb.arca.gob.ar/clavefiscal/qr/'},
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener" style={{
                background:V.tealLight,border:`1px solid ${V.tealRing}`,borderRadius:6,
                padding:'6px 12px',fontSize:12,fontWeight:700,color:V.tealDark,textDecoration:'none',
              }}>
                {l.label} →
              </a>
            ))}
          </div>
        </div>

        {/* AI */}
        <div style={{background:V.surface,border:`1.5px solid ${V.border}`,borderRadius:16,overflow:'hidden',boxShadow:`0 1px 4px rgba(13,92,120,.07)`}}>
          <div style={{background:'#0a0a1a',color:'white',padding:'10px 16px',display:'flex',alignItems:'center',gap:8,fontSize:11,letterSpacing:'1.5px',textTransform:'uppercase',fontWeight:700}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#4caf50',boxShadow:'0 0 0 3px rgba(76,175,80,.2)'}}/>
            Asistente Fiscal IA · Dudas sobre facturación
          </div>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askAI()}
                placeholder="Ej: ¿Puedo facturar al exterior como monotributista?"
                style={{flex:1,border:`1.5px solid ${V.border}`,borderRadius:8,padding:'10px 12px',fontSize:13,fontWeight:600,color:V.ink,background:V.bg,outline:'none'}}/>
              <button onClick={()=>askAI()} disabled={aiLoad}
                style={{background:V.teal,color:'white',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,fontWeight:800,opacity:aiLoad?.6:1,whiteSpace:'nowrap'}}>
                {aiLoad?'…':'Consultar →'}
              </button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {[
                '¿Puedo facturar en dólares?',
                '¿Qué pasa si no facturo?',
                '¿Cómo anulo una factura?',
                '¿Puedo facturar al exterior?',
              ].map(c=>(
                <button key={c} onClick={()=>askAI(c)} style={{background:V.bg,border:`1px solid ${V.border}`,borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:700,color:V.ink3}}>
                  {c}
                </button>
              ))}
            </div>
            {(aiLoad||aiResp)&&<div style={{marginTop:12,padding:'12px 14px',background:V.bg,borderRadius:8,borderLeft:`3px solid ${V.teal}`,fontSize:13,color:V.ink2,fontWeight:600,lineHeight:1.75,whiteSpace:'pre-wrap'}}>
              {aiLoad?<span style={{color:V.ink3}}>Consultando ARCA/AFIP…</span>:aiResp}
            </div>}
          </div>
        </div>

      {/* SEO: Contenido informativo */}
      <div style={{maxWidth:860,margin:'0 auto',padding:'0 16px 40px'}}>
        <SEOComoFacturar />
      </div>

      </main>
      </div>
    </>
  )
}
