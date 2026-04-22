"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Task {
  id: string;
  label: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: "actividad", label: "Elegir tipo de actividad", done: false },
  { id: "provincia", label: "Indicar tu provincia", done: false },
  { id: "facturacion", label: "Cargar facturación estimada", done: false },
];

const HELP_CARDS = [
  { icon: "🏗️", label: "Crear negocio", href: "/crear-negocio" },
  { icon: "📋", label: "Monotributo", href: "/" },
  { icon: "🧾", label: "Cómo facturar", href: "/como-facturar" },
  { icon: "🤖", label: "Asistente IA", href: "/" },
];

export default function MiPanel() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session
      if (!session) {
        window.location.href = '/login'
      } else {
        setAuthChecked(true)
      }
    })
  }, [])

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: 'var(--ink3)' }}>
        Cargando...
      </div>
    )
  }

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
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Nunito', sans-serif", color: "var(--ink)" }}>

      {/* ── Top bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        boxShadow: "var(--sh-sm)", padding: "0 24px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo.png" alt="Fácil Fiscal" style={{ height: 40, width: "auto" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--ink3)", fontWeight: 600 }}>
            Hola, Federico 👋
          </span>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú de usuario"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--teal), var(--gold))",
                border: "none", cursor: "pointer", color: "#fff",
                fontSize: 14, fontWeight: 800, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              F
            </button>
            {menuOpen && (
              <div style={{
                position: "absolute", top: 44, right: 0,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--r)", boxShadow: "var(--sh)",
                minWidth: 160, overflow: "hidden", zIndex: 200,
              }}>
                <Link
                  href="/mipanel/perfil"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "block", padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}
                >
                  ⚙️ Mi perfil
                </Link>
                <button
                  onClick={async () => {
                    setMenuOpen(false)
                    await supabase.auth.signOut()
                    window.location.href = '/login'
                  }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: 13, fontWeight: 700, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}
                >
                  → Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Bloque 1 — Estado */}
        <div style={{
          background: "linear-gradient(135deg, var(--teal-dark), var(--teal))",
          borderRadius: "var(--r-xl)", padding: "28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 20, flexWrap: "wrap", color: "#fff",
        }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.18)", borderRadius: 999,
              padding: "4px 12px", fontSize: 11, fontWeight: 800,
              letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 10,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--gold-light)", display: "inline-block" }} />
              En preparación
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Tu panel fiscal está listo</div>
            <div style={{ fontSize: 13, opacity: .85, maxWidth: 340, lineHeight: 1.6 }}>
              Completá tu perfil y te armamos un plan personalizado: vencimientos, tareas y alertas según tu situación.
            </div>
          </div>
          <Link
            href="/mipanel/perfil"
            style={{
              background: "#fff", color: "var(--teal-dark)", borderRadius: "var(--r)",
              padding: "12px 22px", fontSize: 13, fontWeight: 900,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }}
          >
            Completar perfil →
          </Link>
        </div>

        {/* Bloque 2 — Tareas */}
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-lg)", boxShadow: "var(--sh-sm)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>✅ Lo que tenés que hacer hoy</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)" }}>{completedCount}/{totalCount} completadas</span>
          </div>

          <div style={{ height: 6, background: "var(--border)", borderRadius: 999, marginBottom: 18, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, var(--teal), var(--gold))",
              width: `${progressPct}%`, transition: "width .4s ease",
            }} />
          </div>

          {allDone ? (
            <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-ring)", borderRadius: "var(--r)", padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "var(--green)", display: "flex", alignItems: "center", gap: 8 }}>
              🎉 ¡Perfil completo! Ya podemos personalizar tu panel.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  role="checkbox"
                  aria-checked={task.done}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && toggleTask(task.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", border: "1.5px solid var(--border)",
                    borderRadius: "var(--r)", cursor: "pointer",
                    opacity: task.done ? .5 : 1,
                    transition: "all .15s",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${task.done ? "var(--teal)" : "var(--border2)"}`,
                    background: task.done ? "var(--teal)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .2s",
                  }}>
                    {task.done && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: "var(--ink2)", textDecoration: task.done ? "line-through" : "none" }}>
                    {task.label}
                  </span>
                  <span style={{ color: "var(--ink4)", fontSize: 13 }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloque 3 — Vencimientos */}
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-lg)", boxShadow: "var(--sh-sm)", padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginBottom: 16 }}>📅 Próximos vencimientos</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 0 8px", textAlign: "center" }}>
            <span style={{ fontSize: 36, opacity: .3 }}>🔒</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink3)", maxWidth: 280, lineHeight: 1.6 }}>
              Completá tu perfil para ver los vencimientos de AFIP, IIBB y Autónomos que te aplican.
            </p>
            <Link href="/mipanel/perfil" style={{ fontSize: 13, fontWeight: 800, color: "var(--teal)", textDecoration: "none" }}>
              Completar perfil →
            </Link>
          </div>
        </div>

        {/* Bloque 4 — Ayuda rápida */}
        <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "var(--r-lg)", boxShadow: "var(--sh-sm)", padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginBottom: 16 }}>💡 Centro de ayuda</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {HELP_CARDS.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "13px 16px", border: "1.5px solid var(--border)",
                  borderRadius: "var(--r)", textDecoration: "none",
                  color: "var(--ink)", fontSize: 13, fontWeight: 700,
                  background: "var(--surface)",
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
