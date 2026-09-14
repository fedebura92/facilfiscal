import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'La página solicitada no existe o cambió de dirección.',
  robots: { index:false, follow:true },
}

export default function NotFound(){
  return <main style={{minHeight:'70vh',display:'grid',placeItems:'center',padding:'48px 20px',fontFamily:'Nunito, sans-serif',background:'#f8fafc',color:'#183744'}}>
    <div style={{maxWidth:560,textAlign:'center',background:'#fff',border:'1px solid #e2e8f0',borderRadius:18,padding:'36px 28px',boxShadow:'0 4px 24px #0f172a12'}}>
      <div style={{fontSize:54,lineHeight:1}}>🧭</div>
      <h1 style={{fontSize:30,margin:'16px 0 8px'}}>Esta página no existe</h1>
      <p style={{color:'#526675',lineHeight:1.65,margin:'0 0 24px'}}>La dirección puede haber cambiado o estar mal escrita. Volvé al inicio o consultá el calendario fiscal.</p>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        <Link href="/" style={{background:'#0d5c78',color:'#fff',padding:'11px 16px',borderRadius:9,textDecoration:'none',fontWeight:800}}>Ir al inicio</Link>
        <Link href="/calendario-fiscal" style={{background:'#eef7fb',color:'#0d5c78',padding:'11px 16px',borderRadius:9,textDecoration:'none',fontWeight:800,border:'1px solid #b9dce9'}}>Ver calendario fiscal</Link>
      </div>
    </div>
  </main>
}
