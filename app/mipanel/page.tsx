"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  label: string;
  done: boolean;
  href: string;
}

// ─── Mock data (reemplazá con Supabase luego) ─────────────────────────────────
const INITIAL_TASKS: Task[] = [
  { id: "actividad", label: "Elegir tipo de actividad", done: false, href: "/mipanel/perfil" },
  { id: "provincia", label: "Indicar tu provincia", done: false, href: "/mipanel/perfil" },
  { id: "facturacion", label: "Cargar facturación estimada", done: false, href: "/mipanel/perfil" },
];

const HELP_CARDS = [
  { icon: "🏗️", label: "Crear negocio", href: "/crear-negocio", color: "var(--teal)" },
  { icon: "📋", label: "Monotributo", href: "/monotributo", color: "var(--gold)" },
  { icon: "🧾", label: "Facturación", href: "/facturacion", color: "var(--teal-dark)" },
  { icon: "🤖", label: "Asistente IA", href: "/asistente", color: "var(--gold-dark)" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MiPanel() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [menuOpen, setMenuOpen] = useState(false);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const allDone = completedCount === totalCount;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  return (
    <>
      <style>{`
        /* ── Variables ── */
        :root {
          --teal:       #0d9488;
          --teal-light: #99f6e4;
          --teal-dark:  #0f766e;
          --gold:       #d97706;
          --gold-light: #fde68a;
          --gold-dark:  #b45309;
          --bg:         #f8fafc;
          --surface:    #ffffff;
          --border:     #e2e8f0;
          --text:       #1e293b;
          --muted:      #64748b;
          --radius:     14px;
          --shadow:     0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.06);
        }

        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .panel-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Nunito', sans-serif;
          color: var(--text);
        }

        /* ── Top bar ── */
        .topbar {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--teal-dark);
          text-decoration: none;
        }
        .topbar-brand span {
          background: linear-gradient(135deg, var(--teal), var(--gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .greeting {
          font-size: .9rem;
          color: var(--muted);
          font-weight: 600;
        }
        .avatar-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--teal), var(--gold));
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          position: relative;
          transition: opacity .2s;
        }
        .avatar-btn:hover { opacity: .85; }
        .dropdown {
          position: absolute;
          top: 48px;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          min-width: 160px;
          overflow: hidden;
          z-index: 200;
        }
        .dropdown a, .dropdown button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 11px 16px;
          font-size: .875rem;
          color: var(--text);
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          transition: background .15s;
        }
        .dropdown a:hover, .dropdown button:hover { background: var(--bg); }
        .dropdown .danger { color: #ef4444; }

        /* ── Main grid ── */
        .panel-main {
          max-width: 860px;
          margin: 0 auto;
          padding: 32px 20px 64px;
          display: grid;
          gap: 20px;
        }

        /* ── Card base ── */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 24px;
        }

        /* ── Status card ── */
        .status-card {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,.18);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: .78rem;
          font-weight: 700;
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold-light);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
        .status-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .status-subtitle {
          font-size: .9rem;
          opacity: .85;
          max-width: 340px;
          line-height: 1.5;
        }
        .status-cta {
          background: #fff;
          color: var(--teal-dark);
          border: none;
          border-radius: 10px;
          padding: 12px 22px;
          font-size: .9rem;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          text-decoration: none;
          display: inline-block;
          transition: transform .15s, box-shadow .15s;
          font-family: 'Nunito', sans-serif;
        }
        .status-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,.15); }

        /* ── Section heading ── */
        .section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-meta {
          font-size: .8rem;
          color: var(--muted);
          font-weight: 600;
        }

        /* ── Progress bar ── */
        .progress-wrap {
          background: #e2e8f0;
          border-radius: 999px;
          height: 6px;
          margin-bottom: 18px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--teal), var(--gold));
          transition: width .4s ease;
        }

        /* ── Task list ── */
        .task-list { display: flex; flex-direction: column; gap: 10px; }
        .task-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: background .15s, border-color .15s;
          text-decoration: none;
          color: var(--text);
        }
        .task-item:hover { background: #f1faf9; border-color: var(--teal-light); }
        .task-item.done { opacity: .55; }
        .task-check {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background .2s, border-color .2s;
        }
        .task-item.done .task-check {
          background: var(--teal);
          border-color: var(--teal);
        }
        .task-check svg { display: none; }
        .task-item.done .task-check svg { display: block; }
        .task-label {
          font-size: .9rem;
          font-weight: 600;
          flex: 1;
        }
        .task-item.done .task-label { text-decoration: line-through; }
        .task-arrow { color: var(--muted); font-size: .8rem; }

        /* ── All done banner ── */
        .all-done {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 14px 18px;
          font-size: .9rem;
          font-weight: 700;
          color: #166534;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Deadlines empty ── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 24px 0 8px;
          text-align: center;
        }
        .empty-icon {
          font-size: 2.2rem;
          opacity: .4;
        }
        .empty-text {
          font-size: .875rem;
          color: var(--muted);
          font-weight: 600;
          max-width: 280px;
          line-height: 1.5;
        }
        .empty-link {
          font-size: .85rem;
          font-weight: 700;
          color: var(--teal);
          text-decoration: none;
        }
        .empty-link:hover { text-decoration: underline; }

        /* ── Help grid ── */
        .help-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .help-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          text-decoration: none;
          color: var(--text);
          font-weight: 700;
          font-size: .875rem;
          transition: background .15s, border-color .15s, transform .15s;
        }
        .help-card:hover {
          background: #f8fafc;
          border-color: var(--teal-light);
          transform: translateY(-1px);
        }
        .help-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .topbar { padding: 0 16px; }
          .greeting { display: none; }
          .panel-main { padding: 20px 14px 56px; }
          .status-card { flex-direction: column; align-items: flex-start; }
          .help-grid { grid-template-columns: repeat(2, 1fr); }
          .card { padding: 18px; }
        }
      `}</style>

      <div className="panel-root">
        {/* ── Top bar ── */}
        <header className="topbar">
          <Link href="/" className="topbar-brand">
            <span>Fácil Fiscal</span>
          </Link>
          <div className="topbar-right">
            <span className="greeting">Hola, Federico 👋</span>
            <div style={{ position: "relative" }}>
              <button
                className="avatar-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menú de usuario"
              >
                👤
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <Link href="/mipanel/perfil" onClick={() => setMenuOpen(false)}>
                    ⚙️ Mi perfil
                  </Link>
                  <button className="danger" onClick={() => setMenuOpen(false)}>
                    → Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="panel-main">

          {/* Bloque 1 — Estado general */}
          <div className="card status-card">
            <div>
              <div className="status-badge">
                <span className="status-dot" />
                En preparación
              </div>
              <div className="status-title">Tu panel fiscal está listo</div>
              <div className="status-subtitle">
                Completá tu perfil y te armamos un plan personalizado: vencimientos, tareas y alertas según tu situación.
              </div>
            </div>
            <Link href="/mipanel/perfil" className="status-cta">
              Completar perfil →
            </Link>
          </div>

          {/* Bloque 2 — Tareas de hoy */}
          <div className="card">
            <div className="section-head">
              <div className="section-title">
                ✅ Lo que tenés que hacer hoy
              </div>
              <span className="section-meta">
                {completedCount}/{totalCount} completadas
              </span>
            </div>

            <div className="progress-wrap">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {allDone ? (
              <div className="all-done">
                🎉 ¡Perfil completo! Ya podemos personalizar tu panel.
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-item ${task.done ? "done" : ""}`}
                    onClick={() => toggleTask(task.id)}
                    role="checkbox"
                    aria-checked={task.done}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && toggleTask(task.id)}
                  >
                    <div className="task-check">
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="task-label">{task.label}</span>
                    <span className="task-arrow">›</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bloque 3 — Próximos vencimientos */}
          <div className="card">
            <div className="section-head">
              <div className="section-title">📅 Próximos vencimientos</div>
            </div>
            <div className="empty-state">
              <div className="empty-icon">🔒</div>
              <div className="empty-text">
                Completá tu perfil para ver los vencimientos de AFIP, IIBB y Autónomos que te aplican.
              </div>
              <Link href="/mipanel/perfil" className="empty-link">
                Completar perfil →
              </Link>
            </div>
          </div>

          {/* Bloque 4 — Ayuda rápida */}
          <div className="card">
            <div className="section-head">
              <div className="section-title">💡 Centro de ayuda</div>
            </div>
            <div className="help-grid">
              {HELP_CARDS.map((c) => (
                <Link key={c.href} href={c.href} className="help-card">
                  <div
                    className="help-icon"
                    style={{ background: c.color + "18" }}
                  >
                    {c.icon}
                  </div>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
