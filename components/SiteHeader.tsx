'use client'
import { useState, useEffect } from 'react'
import { NAV_ITEMS } from '@/lib/data'

interface SiteHeaderProps {
  currentPath: string
  onAlertasClick?: () => void
}

const TIPO_PATHS = ['/', '/responsable-inscripto', '/autonomos']
const TIPO_LABELS = ['Monotributo', 'Resp. Inscripto', 'Autónomo']

export default function SiteHeader({ currentPath, onAlertasClick }: SiteHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cerrar sidebar al hacer resize a desktop
  useEffect(() => {
    const close = () => { if (window.innerWidth >= 1024) setSidebarOpen(false) }
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  // Bloquear scroll del body cuando el sidebar está abierto en mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const NAV_GROUPS = [
    { key: 'regimen',       label: 'Régimen fiscal' },
    { key: 'herramientas',  label: 'Herramientas' },
    { key: 'calculadoras',  label: 'Calculadoras' },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* ── Sidebar ── */
        .ff-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 236px; background: #fff;
          border-right: 1px solid #e2e8ed;
          display: flex; flex-direction: column;
          z-index: 200; overflow-y: auto;
          transition: transform .22s cubic-bezier(.4,0,.2,1);
        }
        .ff-sidebar-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(13,34,44,.35); z-index: 199;
          backdrop-filter: blur(2px);
        }

        /* Desktop: siempre visible */
        @media (min-width: 1024px) {
          .ff-sidebar { transform: none !important; }
          .ff-sidebar-overlay { display: none !important; }
          .ff-topbar { padding-left: 236px !important; }
          .ff-page-content { margin-left: 236px; }
          .ff-hamburger { display: none !important; }
        }

        /* Mobile/tablet: oculto por defecto, se abre */
        @media (max-width: 1023px) {
          .ff-sidebar { transform: translateX(-100%); box-shadow: 4px 0 24px rgba(13,92,120,.18); }
          .ff-sidebar.open { transform: translateX(0); }
          .ff-sidebar-overlay.open { display: block; }
          .ff-page-content { margin-left: 0; }
        }

        /* ── Topbar ── */
        .ff-topbar {
          position: sticky; top: 0; z-index: 100;
          background: #fff; border-bottom: 1px solid #e2e8ed;
          box-shadow: 0 1px 4px rgba(13,92,120,.07);
        }
        .ff-topbar-inner {
          max-width: 100%; margin: 0 auto;
          padding: 0 16px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px;
          flex-wrap: wrap;
          min-height: 56px;
        }
        .ff-topbar-row1 {
          display: flex; align-items: center;
          justify-content: space-between;
          gap: 8px; width: 100%; height: 56px;
        }

        /* ── Tipo switcher en topbar (solo en páginas de régimen) ── */
        .ff-switcher {
          display: flex; background: #f4f7f9;
          border: 1.5px solid #e2e8ed; border-radius: 10px;
          padding: 3px; gap: 2px;
        }
        .ff-tipo-btn {
          padding: 6px 14px; border-radius: 7px; border: none;
          background: none; font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer;
          white-space: nowrap; transition: all .18s; color: #7a9aaa;
          flex: 1;
        }
        .ff-tipo-btn.active {
          background: #1a7fa8; color: white;
          box-shadow: 0 1px 4px rgba(13,92,120,.18);
        }

        /* Mobile: switcher baja a segunda fila, ancho completo */
        @media (max-width: 767px) {
          .ff-switcher-desktop { display: none !important; }
          .ff-switcher-mobile {
            width: 100%;
            margin-bottom: 8px;
            justify-content: stretch;
          }
          .ff-switcher-mobile .ff-tipo-btn {
            text-align: center;
            font-size: 12px;
            padding: 7px 4px;
            flex: 1;
          }
        }

        /* Tablet y desktop: switcher en línea, mobile switcher oculto */
        @media (min-width: 768px) {
          .ff-switcher-mobile { display: none !important; }
          .ff-switcher-desktop {
            width: auto;
            margin-bottom: 0;
            flex-shrink: 0;
          }
          .ff-switcher-desktop .ff-tipo-btn {
            flex: none;
            padding: 6px 14px;
          }
          .ff-topbar-row1 {
            width: auto;
            flex: 1;
          }
        }

        /* ── Hamburger ── */
        .ff-hamburger {
          width: 36px; height: 36px; border: none;
          background: #f4f7f9; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          border: 1px solid #e2e8ed;
        }
        .ff-hamburger span {
          display: block; width: 16px; height: 1.5px;
          background: #0f2733; border-radius: 2px;
          transition: all .2s;
          box-shadow: 0 5px 0 #0f2733, 0 -5px 0 #0f2733;
        }

        /* ── Alerta CTA ── */
        .ff-alert-cta {
          background: #f5a623; color: #0f2733; border: none;
          border-radius: 8px; padding: 7px 14px;
          font-family: 'Nunito', sans-serif; font-size: 12px;
          font-weight: 800; cursor: pointer; white-space: nowrap;
          box-shadow: 0 2px 8px rgba(245,166,35,.35); flex-shrink: 0;
        }
        @media (max-width: 400px) {
          .ff-alert-cta { display: none; }
        }

        /* ── Sidebar nav items ── */
        .ff-nav-group-label {
          font-size: 10px; font-weight: 800; letter-spacing: 1.2px;
          text-transform: uppercase; color: #7a9aaa;
          padding: 16px 16px 6px;
        }
        .ff-nav-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 16px; margin: 1px 8px;
          border-radius: 8px; text-decoration: none;
          font-size: 13px; font-weight: 700; color: #3d5a6b;
          cursor: pointer; transition: background .13s, color .13s;
          border: none; background: none; width: calc(100% - 16px);
          text-align: left;
        }
        .ff-nav-item:hover { background: #f4f7f9; color: #0d5c78; }
        .ff-nav-item.active {
          background: #e8f6fb; color: #0d5c78;
          font-weight: 800;
        }
        .ff-nav-item.active::before {
          content: ''; display: block; width: 3px; height: 100%;
          position: absolute; left: 8px; border-radius: 2px;
          background: #1a7fa8;
        }
        .ff-nav-item { position: relative; }
        .ff-nav-emoji { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }

        /* ── Sidebar logo zone ── */
        .ff-sidebar-logo {
          padding: 16px 16px 12px; border-bottom: 1px solid #e2e8ed;
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex-shrink: 0;
        }
        .ff-sidebar-logo img { height: 40px; }
        .ff-sidebar-logo-text { display: flex; flex-direction: column; line-height: 1; }
        .ff-sidebar-logo-name { font-size: 16px; font-weight: 900; color: #0d5c78; letter-spacing: -0.2px; }
        .ff-sidebar-logo-sub { font-size: 9px; font-weight: 600; color: #7a9aaa; margin-top: 3px; letter-spacing: 0.2px; }

        /* ── Page content wrapper ── */
        .ff-page-content { min-height: 100vh; transition: margin-left .22s; }
      ` }} />

      {/* ── SIDEBAR ── */}
      <div className={`ff-sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <nav className={`ff-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Navegación principal">
        {/* Logo en sidebar */}
        <a href="/" className="ff-sidebar-logo" onClick={() => setSidebarOpen(false)}>
          <img src="/logo.svg" alt="Fácil Fiscal" />
          <div className="ff-sidebar-logo-text">
            <span className="ff-sidebar-logo-name">Fácil Fiscal</span>
            <span className="ff-sidebar-logo-sub">Tu solución fiscal simplificada</span>
          </div>
        </a>

        {/* Nav groups */}
        {NAV_GROUPS.map(group => (
          <div key={group.key}>
            <div className="ff-nav-group-label">{group.label}</div>
            {NAV_ITEMS.filter(item => item.group === group.key).map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`ff-nav-item${currentPath === item.href ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="ff-nav-emoji">{item.emoji}</span>
                {item.label}
              </a>
            ))}
          </div>
        ))}

        {/* Separador y link a AFIP */}
        <div style={{ marginTop: 'auto', padding: '12px 8px 16px', borderTop: '1px solid #e2e8ed' }}>
          <a
            href="https://www.afip.gob.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="ff-nav-item"
          >
            <span className="ff-nav-emoji">🏛️</span>
            Ir a AFIP / ARCA
          </a>
        </div>
      </nav>

      {/* ── TOPBAR ── */}
      <header className="ff-topbar">
        <div className="ff-topbar-inner">

          {/* Fila 1: hamburguesa + logo + switcher (tablet/desktop) + alertas */}
          <div className="ff-topbar-row1">
            <button
              className="ff-hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Abrir menú"
            >
              <span />
            </button>

            <a
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}
              className="ff-topbar-logo"
            >
              <img src="/logo.svg" alt="Fácil Fiscal" style={{ height: 40 }} />
            </a>

            <div style={{ flex: 1 }} />

            {/* Switcher inline en tablet/desktop — centrado — oculto en mobile (va en fila 2) */}
            {TIPO_PATHS.includes(currentPath) && (
              <div className="ff-switcher ff-switcher-desktop">
                {TIPO_PATHS.map((path, i) => (
                  <button
                    key={path}
                    className={`ff-tipo-btn${currentPath === path ? ' active' : ''}`}
                    onClick={() => { window.location.href = path }}
                  >
                    {TIPO_LABELS[i]}
                  </button>
                ))}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {onAlertasClick && (
              <button className="ff-alert-cta" onClick={onAlertasClick}>
                🔔 Alertas
              </button>
            )}
          </div>

          {/* Fila 2: switcher solo en mobile */}
          {TIPO_PATHS.includes(currentPath) && (
            <div className="ff-switcher ff-switcher-mobile">
              {TIPO_PATHS.map((path, i) => (
                <button
                  key={path}
                  className={`ff-tipo-btn${currentPath === path ? ' active' : ''}`}
                  onClick={() => { window.location.href = path }}
                >
                  {TIPO_LABELS[i]}
                </button>
              ))}
            </div>
          )}

        </div>
      </header>
    </>
  )
}
