"use client";

import { useState } from "react";
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
  { icon: "📋", label: "Monotributo", href: "/monotributo" },
  { icon: "🧾", label: "Cómo facturar", href: "/como-facturar" },
  { icon: "🤖", label: "Asistente IA", href: "/" },
];

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Fácil Fiscal" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-slate-500 font-semibold">
              Hola, Federico 👋
            </span>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition"
                aria-label="Menú de usuario"
              >
                F
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <Link
                    href="/mipanel/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-600 text-slate-700 hover:bg-slate-50 transition"
                  >
                    ⚙️ Mi perfil
                  </Link>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="block w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-slate-50 transition"
                  >
                    → Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Bloque 1 — Estado */}
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              En preparación
            </div>
            <div className="text-2xl font-extrabold mb-1">Tu panel fiscal está listo</div>
            <div className="text-sm text-white/80 max-w-sm leading-relaxed">
              Completá tu perfil y te armamos un plan personalizado: vencimientos, tareas y alertas según tu situación.
            </div>
          </div>
          <Link
            href="/mipanel/perfil"
            className="shrink-0 bg-white text-teal-700 font-extrabold text-sm px-5 py-3 rounded-xl hover:shadow-lg transition"
          >
            Completar perfil →
          </Link>
        </div>

        {/* Bloque 2 — Tareas */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-extrabold text-slate-800">✅ Lo que tenés que hacer hoy</div>
            <span className="text-xs font-semibold text-slate-400">{completedCount}/{totalCount} completadas</span>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {allDone ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-bold text-green-700">
              🎉 ¡Perfil completo! Ya podemos personalizar tu panel.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  role="checkbox"
                  aria-checked={task.done}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === " " && toggleTask(task.id)}
                  className={`flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition select-none
                    ${task.done
                      ? "border-slate-100 opacity-50"
                      : "border-slate-200 hover:border-teal-200 hover:bg-teal-50"
                    }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition
                    ${task.done ? "bg-teal-500 border-teal-500" : "border-slate-300"}`}
                  >
                    {task.done && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-semibold flex-1 ${task.done ? "line-through text-slate-400" : "text-slate-700"}`}>
                    {task.label}
                  </span>
                  <span className="text-slate-300 text-sm">›</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bloque 3 — Vencimientos */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="text-base font-extrabold text-slate-800 mb-4">📅 Próximos vencimientos</div>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-4xl opacity-30">🔒</span>
            <p className="text-sm font-semibold text-slate-400 max-w-xs leading-relaxed">
              Completá tu perfil para ver los vencimientos de AFIP, IIBB y Autónomos que te aplican.
            </p>
            <Link href="/mipanel/perfil" className="text-sm font-bold text-teal-600 hover:underline">
              Completar perfil →
            </Link>
          </div>
        </div>

        {/* Bloque 4 — Ayuda rápida */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="text-base font-extrabold text-slate-800 mb-4">💡 Centro de ayuda</div>
          <div className="grid grid-cols-2 gap-3">
            {HELP_CARDS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-teal-200 hover:bg-teal-50 transition"
              >
                <span className="text-xl">{c.icon}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
