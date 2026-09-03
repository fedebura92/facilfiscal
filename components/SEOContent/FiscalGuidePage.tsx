import type { ReactNode } from 'react'

export function FiscalGuidePage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', background: '#f4f7f9', color: '#0f2733' }}>
      <header style={{ background: 'linear-gradient(135deg,#0d5c78,#1a7fa8)', color: '#fff', padding: 'clamp(42px,7vw,66px) 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .8, marginBottom: 10 }}>{eyebrow}</div>
        <h1 style={{ maxWidth: 820, margin: '0 auto 12px', fontSize: 'clamp(30px,5vw,46px)', lineHeight: 1.15, fontWeight: 900 }}>{title}</h1>
        <p style={{ maxWidth: 720, margin: '0 auto', fontSize: 'clamp(16px,2vw,18px)', lineHeight: 1.6, opacity: .9 }}>{intro}</p>
      </header>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(26px,5vw,42px) 18px 70px' }}>{children}</div>
    </main>
  )
}

export function GuideSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #e2e8ed', borderRadius: 14, padding: 'clamp(20px,4vw,28px)', marginBottom: 16, boxShadow: '0 2px 12px rgba(13,92,120,.06)', lineHeight: 1.7 }}>
      <h2 style={{ margin: '0 0 10px', fontSize: 23 }}>{title}</h2>
      {children}
    </section>
  )
}

export const guideListStyle = { margin: '8px 0 0', paddingLeft: 22, lineHeight: 1.8 } as const
export const guideNoteStyle = { padding: 16, background: '#fff8ec', border: '1px solid #fde4a0', borderRadius: 10, lineHeight: 1.65 } as const
export const guideCTAStyle = { display: 'inline-block', padding: '12px 18px', borderRadius: 9, background: '#f5a623', color: '#0f2733', textDecoration: 'none', fontWeight: 900 } as const
