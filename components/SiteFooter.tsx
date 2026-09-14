import Link from 'next/link'

export default function SiteFooter(){
  return <footer style={{borderTop:'1px solid #e2e8ed',background:'#fff',padding:'28px 20px 34px',fontFamily:'Nunito, sans-serif'}}>
    <div style={{maxWidth:980,margin:'0 auto',display:'flex',gap:24,justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap'}}>
      <div style={{maxWidth:420}}><strong style={{color:'#0d5c78'}}>Fácil Fiscal</strong><p style={{fontSize:12,lineHeight:1.6,color:'#64748b',margin:'7px 0 0'}}>Plataforma independiente para entender obligaciones fiscales argentinas con explicaciones simples, calculadoras y vencimientos. No pertenece a ARCA ni a ningún organismo gubernamental.</p></div>
      <nav aria-label="Información institucional" style={{display:'flex',gap:'8px 18px',flexWrap:'wrap',maxWidth:430}}>
        <Link href="/acerca-de" style={link}>Acerca de</Link><Link href="/metodologia" style={link}>Metodología y fuentes</Link><Link href="/contacto" style={link}>Contacto</Link><Link href="/privacidad" style={link}>Privacidad</Link><Link href="/terminos" style={link}>Términos y aviso legal</Link>
      </nav>
    </div>
  </footer>
}
const link={fontSize:12,fontWeight:700,color:'#3d5a6b',textDecoration:'none'}
