'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Perfil {
  nombre: string
  provincia: string
  actividad: string
  tipo_contribuyente: string
  facturacion_estimada: number | null
}

interface Task {
  id: string
  label: string
  descripcion: string
  done: boolean
  done_at?: string | null
  // Si la tarea no está completada, a dónde llevar al usuario
  accion_href?: string
  accion_label?: string
  // Cómo verificar si la tarea está realmente completada en el perfil
  completada_si?: (p: Perfil) => boolean
}

// ── Tareas del checklist ─────────────────────────────────────────────────────

function buildTasks(perfil: Perfil | null): Task[] {
  return [
    {
      id: 'tipo',
      label: 'Elegir tu situación fiscal',
      descripcion: 'Monotributo, Responsable Inscripto o Autónomo.',
      done: !!perfil?.tipo_contribuyente,
      completada_si: (p) => !!p.tipo_contribuyente,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'actividad',
      label: 'Indicar tu tipo de actividad',
      descripcion: 'Comercio, servicios, gastronomía, tecnología...',
      done: !!perfil?.actividad,
      completada_si: (p) => !!p.actividad,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'provincia',
      label: 'Indicar tu provincia',
      descripcion: 'Para calcular Ingresos Brutos y vencimientos provinciales.',
      done: !!perfil?.provincia,
      completada_si: (p) => !!p.provincia,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'facturacion',
      label: 'Cargar facturación mensual estimada',
      descripcion: 'Para recomendarte la categoría correcta.',
      done: !!perfil?.facturacion_estimada,
      completada_si: (p) => !!p.facturacion_estimada,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'alertas',
      label: 'Activar alertas de vencimientos',
      descripcion: 'Recibí un email antes de cada vencimiento.',
      done: false, // Se verifica contra checklist de Supabase
      accion_href: '/#alertas',
      accion_label: 'Activar alertas',
    },
    {
      id: 'categoria',
      label: 'Verificar tu categoría de monotributo',
      descripcion: 'Revisá si la categoría actual es correcta.',
      done: false,
      accion_href: '/mi-categoria',
      accion_label: 'Ir a la calculadora',
    },
  ]
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const V = {
  tealDark: '#0d5c78', teal: '#1a7fa8', tealLight: '#e8f6fb', tealRing: '#a8ddf0',
  gold: '#f5a623', goldLight: '#fff8ec',
  red: '#e53535', redBg: '#fff1f1', redRing: '#ffc8c8',
  green: '#16a34a', greenBg: '#f0fdf4', greenRing: '#bbf7d0',
  bg: '#f4f7f9', surface: '#fff', border: '#e2e8ed', border2: '#c8d8e2',
  ink: '#0f2733', ink2: '#3d5a6b', ink3: '#7a9aaa',
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function MiPanel() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>(buildTasks(null))
  const [menuOpen, setMenuOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // ── IA ──
  const [aiQuery, setAiQuery] = useState('')
  const [aiResp, setAiResp] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const aiEndRef = useRef<HTMLDivElement>(null)

  // ── Auth + cargar datos ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUserId(user.id)

      // Cargar perfil
      const { data: profileData } = await supabase
        .from('users')
        .select('nombre, provincia, actividad, tipo_contribuyente, facturacion_estimada')
        .eq('id', user.id)
        .single()

      const p: Perfil = {
        nombre: profileData?.nombre || '',
        provincia: profileData?.provincia || '',
        actividad: profileData?.actividad || '',
        tipo_contribuyente: profileData?.tipo_contribuyente || '',
        facturacion_estimada: profileData?.facturacion_estimada || null,
      }
      setPerfil(p)

      // Cargar checklist de Supabase
      const { data: checklistData } = await supabase
        .from('user_checklist')
        .select('task_id, done, done_at')
        .eq('user_id', user.id)

      const checklistMap: Record<string, { done: boolean; done_at: string | null }> = {}
      for (const row of checklistData || []) {
        checklistMap[row.task_id] = { done: row.done, done_at: row.done_at }
      }

      // Construir tasks combinando perfil + checklist guardado
      const baseTasks = buildTasks(p)
      const mergedTasks = baseTasks.map(task => {
        // Si la tarea se verifica contra el perfil, usamos el perfil como fuente de verdad
        if (task.completada_si) {
          return { ...task, done: task.completada_si(p) }
        }
        // Si no, usamos el checklist de Supabase
        const saved = checklistMap[task.id]
        return { ...task, done: saved?.done ?? false, done_at: saved?.done_at }
      })

      setTasks(mergedTasks)
      setAuthChecked(true)
    }
    load()
  }, [])

  // ── Scroll al final del chat IA ──────────────────────────────────────────
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiHistory, aiLoading])

  // ── Toggle tarea (solo las que no dependen del perfil) ───────────────────
  const toggleTask = async (taskId: string) => {
    if (!userId) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Si depende del perfil y no está completada, no dejar tildar
    if (task.completada_si && !task.done) return

    const newDone = !task.done

    // Actualizar UI optimistamente
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: newDone } : t))

    // Guardar en Supabase
    await supabase
      .from('user_checklist')
      .upsert({
        user_id: userId,
        task_id: taskId,
        done: newDone,
        done_at: newDone ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,task_id' })
  }

  // ── Asistente IA ─────────────────────────────────────────────────────────
  const askAI = async (q?: string) => {
    const query = q || aiQuery
    if (!query.trim()) return
    setAiQuery('')
    setAiLoading(true)

    const newHistory = [...aiHistory, { role: 'user' as const, text: query }]
    setAiHistory(newHistory)

    // Construir contexto del perfil para la IA
    const perfilCtx = perfil ? `
Perfil del usuario:
- Régimen fiscal: ${perfil.tipo_contribuyente === 'mono' ? 'Monotributista' : perfil.tipo_contribuyente === 'ri' ? 'Responsable Inscripto' : perfil.tipo_contribuyente === 'aut' ? 'Autónomo' : 'No definido'}
- Actividad: ${perfil.actividad || 'No definida'}
- Provincia: ${perfil.provincia || 'No definida'}
- Facturación mensual estimada: ${perfil.facturacion_estimada ? `$${perfil.facturacion_estimada.toLocaleString('es-AR')}` : 'No definida'}
- Nombre: ${perfil.nombre || 'No definido'}
` : 'El usuario no tiene perfil completado.'

    try {
      const r = await fetch('/api/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          contexto: perfilCtx,
          historial: aiHistory.map(h => ({ role: h.role, content: h.text })),
        }),
      })
      const d = await r.json()
      const respuesta = d.response || 'Sin respuesta.'
      setAiHistory([...newHistory, { role: 'assistant', text: respuesta }])
    } catch {
      setAiHistory([...newHistory, { role: 'assistant', text: 'Error de conexión. Intentá de nuevo.' }])
    } finally {
      setAiLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: V.ink3 }}>
        Cargando...
      </div>
    )
  }

  const completedCount = tasks.filter(t => t.done).length
  const totalCount = tasks.length
  const progressPct = Math.round((completedCount / totalCount) * 100)
  const allDone = completedCount === totalCount
  const perfilCompleto = !!(perfil?.tipo_contribuyente && perfil?.actividad && perfil?.provincia)

  const tipoLabel = perfil?.tipo_contribuyente === 'mono' ? 'Monotributista'
    : perfil?.tipo_contribuyente === 'ri' ? 'Responsable Inscripto'
    : perfil?.tipo_contribuyente === 'aut' ? 'Autónomo'
    : null

  // Sugerencias de IA según perfil
  const sugerencias = perfilCompleto ? [
    `¿Cuánto pago de ${tipoLabel?.toLowerCase()} este mes?`,
    `¿Qué vencimientos tengo en ${new Date().toLocaleString('es-AR', { month: 'long' })}?`,
    `¿Cuándo tengo que recategorizarme?`,
    `¿Qué pasa si facturo más de lo que permite mi categoría?`,
  ] : [
    '¿Qué es el monotributo?',
    '¿Cuándo tengo que pagar el monotributo?',
    '¿Qué diferencia hay entre monotributo y responsable inscripto?',
    '¿Cuánto cuesta hacerse autónomo?',
  ]

  return (
    <div style={{ minHeight: '100vh', background: V.bg, fontFamily: "'Nunito', sans-serif", color: V.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* ── Topbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: V.surface, borderBottom: `1px solid ${V.border}`,
        boxShadow: '0 1px 4px rgba(13,92,120,.07)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/logo_apaisado_Facil_Fiscal.png" alt="Fácil Fiscal" style={{ height: 44, width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {perfil?.nombre && (
            <span style={{ fontSize: 13, color: V.ink3, fontWeight: 600 }}>
              Hola, {perfil.nombre} 👋
            </span>
          )}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${V.teal}, ${V.gold})`,
                border: 'none', cursor: 'pointer', color: '#fff',
                fontSize: 14, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {perfil?.nombre?.[0]?.toUpperCase() || '?'}
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 44, right: 0,
                background: V.surface, border: `1px solid ${V.border}`,
                borderRadius: 12, boxShadow: '0 8px 24px rgba(13,92,120,.12)',
                minWidth: 160, overflow: 'hidden', zIndex: 200,
              }}>
                <Link href="/mipanel/perfil" onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '11px 16px', fontSize: 13, fontWeight: 700, color: V.ink, textDecoration: 'none' }}>
                  ⚙️ Mi perfil
                </Link>
                <button
                  onClick={async () => { setMenuOpen(false); await supabase.auth.signOut(); window.location.href = '/login' }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, fontWeight: 700, color: V.red, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                  → Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Bloque 1: Estado del perfil ── */}
        <div style={{
          background: `linear-gradient(135deg, ${V.tealDark}, ${V.teal})`,
          borderRadius: 20, padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20, flexWrap: 'wrap', color: '#fff',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,.18)', borderRadius: 999,
              padding: '4px 12px', fontSize: 11, fontWeight: 800,
              letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 10,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: perfilCompleto ? '#4ade80' : V.gold, display: 'inline-block' }} />
              {perfilCompleto ? 'Perfil completo' : 'En preparación'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 6 }}>
              {perfilCompleto
                ? `Tu panel fiscal · ${tipoLabel}`
                : 'Completá tu perfil para personalizar tu panel'}
            </div>
            <div style={{ fontSize: 13, opacity: .8, maxWidth: 380, lineHeight: 1.6 }}>
              {perfilCompleto
                ? `${perfil?.actividad} · ${perfil?.provincia}${perfil?.facturacion_estimada ? ` · $${(perfil.facturacion_estimada / 1000).toFixed(0)}K/mes` : ''}`
                : 'Vencimientos, tareas y alertas personalizadas según tu situación.'}
            </div>
          </div>
          <Link href="/mipanel/perfil" style={{
            background: '#fff', color: V.tealDark, borderRadius: 10,
            padding: '11px 20px', fontSize: 13, fontWeight: 900,
            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,.1)',
          }}>
            {perfilCompleto ? 'Editar perfil' : 'Completar perfil →'}
          </Link>
        </div>

        {/* ── Bloque 2: Checklist ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: V.ink }}>✅ Lo que tenés que hacer</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: V.ink3 }}>{completedCount}/{totalCount} completadas</span>
          </div>

          {/* Barra de progreso */}
          <div style={{ height: 6, background: V.border, borderRadius: 999, marginBottom: 18, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: `linear-gradient(90deg, ${V.teal}, ${V.gold})`,
              width: `${progressPct}%`, transition: 'width .4s ease',
            }} />
          </div>

          {allDone ? (
            <div style={{ background: V.greenBg, border: `1px solid ${V.greenRing}`, borderRadius: 10, padding: '13px 16px', fontSize: 13, fontWeight: 700, color: V.green, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎉 ¡Todo listo! Tu panel está completamente configurado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((task) => {
                const bloqueada = task.completada_si && !task.done
                return (
                  <div key={task.id} style={{
                    border: `1.5px solid ${task.done ? V.tealRing : V.border}`,
                    borderRadius: 12, overflow: 'hidden',
                    background: task.done ? V.tealLight : V.surface,
                    opacity: 1,
                  }}>
                    <div
                      onClick={() => !bloqueada && toggleTask(task.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '13px 16px',
                        cursor: bloqueada ? 'default' : 'pointer',
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        border: `2px solid ${task.done ? V.teal : bloqueada ? V.border : V.border2}`,
                        background: task.done ? V.teal : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s',
                      }}>
                        {task.done && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {!task.done && bloqueada && (
                          <span style={{ fontSize: 10, color: V.ink3 }}>🔒</span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: task.done ? V.tealDark : V.ink,
                          textDecoration: task.done ? 'line-through' : 'none',
                        }}>
                          {task.label}
                        </div>
                        {!task.done && (
                          <div style={{ fontSize: 11, color: V.ink3, fontWeight: 600, marginTop: 2 }}>
                            {task.descripcion}
                          </div>
                        )}
                      </div>

                      {task.done && (
                        <span style={{ fontSize: 11, color: V.teal, fontWeight: 700, flexShrink: 0 }}>✓ Listo</span>
                      )}
                    </div>

                    {/* Link de acción si la tarea no está completada */}
                    {!task.done && task.accion_href && (
                      <div style={{
                        borderTop: `1px solid ${V.border}`,
                        padding: '10px 16px',
                        background: V.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}>
                        <span style={{ fontSize: 12, color: V.ink3, fontWeight: 600 }}>
                          {bloqueada ? '🔒 Completá esta tarea para marcarla como hecha' : 'Pendiente'}
                        </span>
                        <Link href={task.accion_href} style={{
                          fontSize: 12, fontWeight: 800, color: V.teal,
                          textDecoration: 'none', whiteSpace: 'nowrap',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}>
                          {task.accion_label} →
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Bloque 3: Asistente IA ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            background: '#0a0a1a', padding: '12px 18px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 0 3px rgba(76,175,80,.2)' }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
              Asistente fiscal IA
            </span>
            {perfilCompleto && tipoLabel && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>
                Modo: {tipoLabel}
              </span>
            )}
          </div>

          {/* Historial de chat */}
          <div style={{ padding: '16px 18px', maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                <p style={{ fontSize: 13, color: V.ink3, fontWeight: 600, margin: 0 }}>
                  {perfilCompleto
                    ? `Hola${perfil?.nombre ? ` ${perfil.nombre}` : ''}! Soy tu asistente fiscal. Ya cargué tu perfil — preguntame lo que quieras sobre tu situación impositiva.`
                    : 'Hola! Soy tu asistente fiscal. Podés preguntarme sobre impuestos, vencimientos y trámites en Argentina.'}
                </p>
              </div>
            )}

            {aiHistory.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? V.teal : V.bg,
                  color: msg.role === 'user' ? '#fff' : V.ink2,
                  fontSize: 13, fontWeight: 600, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  border: msg.role === 'assistant' ? `1px solid ${V.border}` : 'none',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {aiLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                  background: V.bg, border: `1px solid ${V.border}`,
                  fontSize: 13, color: V.ink3, fontWeight: 600,
                }}>
                  Consultando...
                </div>
              </div>
            )}
            <div ref={aiEndRef} />
          </div>

          {/* Sugerencias */}
          {aiHistory.length === 0 && (
            <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sugerencias.map(s => (
                <button key={s} onClick={() => askAI(s)} style={{
                  background: V.bg, border: `1px solid ${V.border}`,
                  borderRadius: 20, padding: '5px 12px',
                  fontSize: 11, fontWeight: 700, color: V.ink3,
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  textAlign: 'left',
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 18px', borderTop: `1px solid ${V.border}`, display: 'flex', gap: 8 }}>
            <input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && askAI()}
              placeholder="Preguntame sobre tu situación fiscal..."
              style={{
                flex: 1, border: `1.5px solid ${V.border}`, borderRadius: 10,
                padding: '10px 14px', fontSize: 13, fontWeight: 600,
                color: V.ink, background: V.bg, outline: 'none',
                fontFamily: "'Nunito', sans-serif",
              }}
            />
            <button
              onClick={() => askAI()}
              disabled={aiLoading || !aiQuery.trim()}
              style={{
                background: V.teal, color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 18px',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                opacity: aiLoading || !aiQuery.trim() ? .5 : 1,
                fontFamily: "'Nunito', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              Enviar →
            </button>
          </div>
        </div>

        {/* ── Bloque 4: Vencimientos ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: V.ink, marginBottom: 16 }}>📅 Próximos vencimientos</div>
          {perfilCompleto ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0 8px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: V.ink3, margin: 0 }}>
                Visitá el calendario completo para ver tus fechas.
              </p>
              <Link href="/calendario-fiscal" style={{ fontSize: 13, fontWeight: 800, color: V.teal, textDecoration: 'none' }}>
                Ver calendario fiscal 2026 →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0 8px', textAlign: 'center' }}>
              <span style={{ fontSize: 32, opacity: .25 }}>🔒</span>
              <p style={{ fontSize: 13, fontWeight: 600, color: V.ink3, maxWidth: 280, lineHeight: 1.6, margin: 0 }}>
                Completá tu perfil para ver los vencimientos que te aplican.
              </p>
              <Link href="/mipanel/perfil" style={{ fontSize: 13, fontWeight: 800, color: V.teal, textDecoration: 'none' }}>
                Completar perfil →
              </Link>
            </div>
          )}
        </div>

        {/* ── Bloque 5: Links rápidos ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: V.ink, marginBottom: 16 }}>💡 Accesos rápidos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '📊', label: 'Mi categoría', href: '/mi-categoria' },
              { icon: '📄', label: 'Cómo facturar', href: '/como-facturar' },
              { icon: '📅', label: 'Calendario fiscal', href: '/calendario-fiscal' },
              { icon: '🏗️', label: 'Crear negocio', href: '/crear-negocio' },
            ].map(c => (
              <Link key={c.label} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 16px', border: `1.5px solid ${V.border}`,
                borderRadius: 10, textDecoration: 'none',
                color: V.ink, fontSize: 13, fontWeight: 700,
                background: V.surface,
              }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                {c.label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
