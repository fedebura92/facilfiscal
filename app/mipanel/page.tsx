'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Perfil {
  nombre: string
  provincia: string
  actividad: string
  tipo_contribuyente: string
  facturacion_estimada: number | null
  terminacion_cuit: string
}

interface Task {
  id: string
  label: string
  descripcion: string
  done: boolean
  done_at?: string | null
  bloqueada: boolean          // true = no se puede tildar a mano
  accion_href?: string
  accion_label?: string
}

// ── Paleta ───────────────────────────────────────────────────────────────────

const V = {
  tealDark: '#0d5c78', teal: '#1a7fa8', tealLight: '#e8f6fb', tealRing: '#a8ddf0',
  gold: '#f5a623', goldLight: '#fff8ec', goldRing: '#fde4a0',
  red: '#e53535', redBg: '#fff1f1', redRing: '#ffc8c8',
  green: '#16a34a', greenBg: '#f0fdf4', greenRing: '#bbf7d0',
  bg: '#f4f7f9', surface: '#fff', border: '#e2e8ed', border2: '#c8d8e2',
  ink: '#0f2733', ink2: '#3d5a6b', ink3: '#7a9aaa',
}

// ── Helpers de vencimientos ──────────────────────────────────────────────────

// Días de vencimiento de autónomos por terminación de CUIT (mes actual)
const AUTONOMOS_POR_CUIT: Record<string, number> = {
  '0': 5, '1': 5, '2': 5, '3': 5,
  '4': 6, '5': 6, '6': 6,
  '7': 7, '8': 7, '9': 7,
}

// Días de vencimiento de IVA por terminación de CUIT
const IVA_POR_CUIT: Record<string, number> = {
  '0': 18, '1': 18,
  '2': 19, '3': 19,
  '4': 20, '5': 20,
  '6': 21, '7': 21,
  '8': 22, '9': 22,
}

// Días de vencimiento F.931 por terminación de CUIT
const F931_POR_CUIT: Record<string, number> = {
  '0': 9, '1': 9, '2': 9, '3': 9,
  '4': 10, '5': 10, '6': 10,
  '7': 11, '8': 11, '9': 11,
}

function getDiasRestantes(dia: number): number {
  const hoy = new Date()
  const venc = new Date(hoy.getFullYear(), hoy.getMonth(), dia)
  if (venc < hoy) venc.setMonth(venc.getMonth() + 1)
  return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

function fmtFecha(dia: number): string {
  const hoy = new Date()
  const venc = new Date(hoy.getFullYear(), hoy.getMonth(), dia)
  if (venc < hoy) venc.setMonth(venc.getMonth() + 1)
  return venc.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}

// ── Construir checklist según perfil ─────────────────────────────────────────

function buildTasks(perfil: Perfil | null, checklistDB: Record<string, { done: boolean; done_at: string | null }>): Task[] {
  const p = perfil

  const tasks: Task[] = [
    {
      id: 'tipo',
      label: 'Elegir tu situación fiscal',
      descripcion: 'Monotributo, Responsable Inscripto o Autónomo.',
      done: !!p?.tipo_contribuyente,
      bloqueada: true,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'actividad',
      label: 'Indicar tu tipo de actividad',
      descripcion: 'Comercio, servicios, gastronomía, tecnología...',
      done: !!p?.actividad,
      bloqueada: true,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'provincia',
      label: 'Indicar tu provincia',
      descripcion: 'Para calcular Ingresos Brutos y vencimientos provinciales.',
      done: !!p?.provincia,
      bloqueada: true,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'cuit',
      label: 'Cargar terminación de CUIT',
      descripcion: 'El último dígito de tu CUIT determina tus fechas exactas de vencimiento.',
      done: !!p?.terminacion_cuit,
      bloqueada: true,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'facturacion',
      label: 'Cargar facturación mensual estimada',
      descripcion: 'Para verificar que tu categoría de monotributo sea correcta.',
      done: !!p?.facturacion_estimada,
      bloqueada: true,
      accion_href: '/mipanel/perfil',
      accion_label: 'Completar perfil',
    },
    {
      id: 'alertas',
      label: 'Activar alertas de vencimientos',
      descripcion: 'Recibí un email antes de cada vencimiento para no llegar tarde.',
      done: checklistDB['alertas']?.done ?? false,
      done_at: checklistDB['alertas']?.done_at ?? null,
      bloqueada: false,
      accion_href: '/',
      accion_label: 'Activar alertas',
    },
    {
      id: 'categoria',
      label: 'Verificar tu categoría de monotributo',
      descripcion: 'Revisá si la categoría actual es correcta según tu facturación.',
      done: checklistDB['categoria']?.done ?? false,
      done_at: checklistDB['categoria']?.done_at ?? null,
      bloqueada: false,
      accion_href: '/mi-categoria',
      accion_label: 'Ir a la calculadora',
    },
  ]

  // Si no es monotributo, ocultar tarea de categoría
  if (p?.tipo_contribuyente && p.tipo_contribuyente !== 'mono') {
    return tasks.filter(t => t.id !== 'categoria')
  }

  return tasks
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function MiPanel() {
  const [perfil, setPerfil]           = useState<Perfil | null>(null)
  const [userId, setUserId]           = useState<string | null>(null)
  const [tasks, setTasks]             = useState<Task[]>(buildTasks(null, {}))
  const [authChecked, setAuthChecked] = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)

  // IA
  const [aiQuery, setAiQuery]   = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const aiEndRef = useRef<HTMLDivElement>(null)

  // ── Cargar datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUserId(user.id)

      // Perfil
      const { data: profileData } = await supabase
        .from('users')
        .select('nombre, provincia, actividad, tipo_contribuyente, facturacion_estimada, terminacion_cuit')
        .eq('id', user.id)
        .single()

      const p: Perfil = {
        nombre: profileData?.nombre || '',
        provincia: profileData?.provincia || '',
        actividad: profileData?.actividad || '',
        tipo_contribuyente: profileData?.tipo_contribuyente || '',
        facturacion_estimada: profileData?.facturacion_estimada || null,
        terminacion_cuit: profileData?.terminacion_cuit || '',
      }
      setPerfil(p)

      // Checklist de Supabase
      const { data: checklistData } = await supabase
        .from('user_checklist')
        .select('task_id, done, done_at')
        .eq('user_id', user.id)

      const checklistMap: Record<string, { done: boolean; done_at: string | null }> = {}
      for (const row of checklistData || []) {
        checklistMap[row.task_id] = { done: row.done, done_at: row.done_at }
      }

      setTasks(buildTasks(p, checklistMap))
      setAuthChecked(true)
    }
    load()
  }, [])

  // Scroll al final del chat
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiHistory, aiLoading])

  // ── Toggle tarea manual ─────────────────────────────────────────────────
  const toggleTask = async (taskId: string) => {
    if (!userId) return
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.bloqueada) return

    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: newDone } : t))

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

  // ── Asistente IA ────────────────────────────────────────────────────────
  const askAI = async (q?: string) => {
    const query = q || aiQuery
    if (!query.trim()) return
    setAiQuery('')
    setAiLoading(true)

    const newHistory = [...aiHistory, { role: 'user' as const, text: query }]
    setAiHistory(newHistory)

    const tipoLabel = perfil?.tipo_contribuyente === 'mono' ? 'Monotributista'
      : perfil?.tipo_contribuyente === 'ri' ? 'Responsable Inscripto'
      : perfil?.tipo_contribuyente === 'aut' ? 'Autónomo' : null

    const perfilCtx = perfil?.tipo_contribuyente ? `
Perfil del usuario:
- Régimen: ${tipoLabel}
- Actividad: ${perfil.actividad || 'No definida'}
- Provincia: ${perfil.provincia || 'No definida'}
- Terminación de CUIT: ${perfil.terminacion_cuit || 'No definida'}
- Facturación mensual estimada: ${perfil.facturacion_estimada ? `$${perfil.facturacion_estimada.toLocaleString('es-AR')}` : 'No definida'}
${perfil.terminacion_cuit ? `- Vencimiento IVA: día ${IVA_POR_CUIT[perfil.terminacion_cuit]} de cada mes` : ''}
${perfil.terminacion_cuit && perfil.tipo_contribuyente === 'aut' ? `- Vencimiento autónomos: día ${AUTONOMOS_POR_CUIT[perfil.terminacion_cuit]} de cada mes` : ''}
` : 'El usuario no tiene perfil completado aún.'

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
      setAiHistory([...newHistory, { role: 'assistant', text: d.response || 'Sin respuesta.' }])
    } catch {
      setAiHistory([...newHistory, { role: 'assistant', text: 'Error de conexión. Intentá de nuevo.' }])
    } finally {
      setAiLoading(false)
    }
  }

  // ── Derived ─────────────────────────────────────────────────────────────
  const perfilCompleto = !!(perfil?.tipo_contribuyente && perfil?.actividad && perfil?.provincia && perfil?.terminacion_cuit)
  const completedCount = tasks.filter(t => t.done).length
  const totalCount     = tasks.length
  const progressPct    = Math.round((completedCount / totalCount) * 100)
  const allDone        = completedCount === totalCount

  const tipoLabel = perfil?.tipo_contribuyente === 'mono' ? 'Monotributista'
    : perfil?.tipo_contribuyente === 'ri' ? 'Responsable Inscripto'
    : perfil?.tipo_contribuyente === 'aut' ? 'Autónomo' : null

  // Vencimientos personalizados según perfil
  const vencimientos = useMemo(() => {
    if (!perfil?.terminacion_cuit) return []
    const t = perfil.terminacion_cuit
    const tipo = perfil.tipo_contribuyente
    const items: { titulo: string; dia: number; urgente: boolean }[] = []

    if (tipo === 'mono') {
      items.push({ titulo: 'Monotributo — cuota mensual', dia: 20, urgente: getDiasRestantes(20) <= 5 })
    }
    if (tipo === 'ri' || tipo === 'aut') {
      const diaIVA = IVA_POR_CUIT[t]
      if (diaIVA) items.push({ titulo: `IVA — DJ mensual (CUIT …${t})`, dia: diaIVA, urgente: getDiasRestantes(diaIVA) <= 5 })
    }
    if (tipo === 'aut') {
      const diaAut = AUTONOMOS_POR_CUIT[t]
      if (diaAut) items.push({ titulo: `Autónomos — cuota mensual (CUIT …${t})`, dia: diaAut, urgente: getDiasRestantes(diaAut) <= 5 })
    }

    return items.sort((a, b) => getDiasRestantes(a.dia) - getDiasRestantes(b.dia))
  }, [perfil])

  const sugerencias = perfilCompleto ? [
    `¿Cuánto pago de ${tipoLabel?.toLowerCase()} este mes?`,
    `¿Cuándo vencen mis obligaciones con CUIT terminado en ${perfil?.terminacion_cuit}?`,
    `¿Qué impuestos pago en ${perfil?.provincia}?`,
    `¿Cuándo me tengo que recategorizar?`,
  ] : [
    '¿Qué es el monotributo?',
    '¿Cuándo vence el monotributo este mes?',
    '¿Qué diferencia hay entre monotributo y responsable inscripto?',
  ]

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito', sans-serif", color: V.ink3 }}>
        Cargando...
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: V.bg, fontFamily: "'Nunito', sans-serif", color: V.ink }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

      {/* Topbar */}
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
            <span style={{ fontSize: 13, color: V.ink3, fontWeight: 600 }}>Hola, {perfil.nombre} 👋</span>
          )}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${V.teal}, ${V.gold})`,
              border: 'none', cursor: 'pointer', color: '#fff',
              fontSize: 14, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {perfil?.nombre?.[0]?.toUpperCase() || '?'}
            </button>
            {menuOpen && (
              <div style={{
                position: 'absolute', top: 44, right: 0,
                background: V.surface, border: `1px solid ${V.border}`,
                borderRadius: 12, boxShadow: '0 8px 24px rgba(13,92,120,.12)',
                minWidth: 160, overflow: 'hidden', zIndex: 200,
              }}>
                <Link href="/mipanel/perfil" onClick={() => setMenuOpen(false)} style={{
                  display: 'block', padding: '11px 16px',
                  fontSize: 13, fontWeight: 700, color: V.ink, textDecoration: 'none',
                }}>⚙️ Mi perfil</Link>
                <button onClick={async () => {
                  setMenuOpen(false)
                  await supabase.auth.signOut()
                  window.location.href = '/login'
                }} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '11px 16px', fontSize: 13, fontWeight: 700,
                  color: V.red, background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                }}>→ Cerrar sesión</button>
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
                ? `${perfil?.actividad} · ${perfil?.provincia} · CUIT …${perfil?.terminacion_cuit}${perfil?.facturacion_estimada ? ` · $${(perfil.facturacion_estimada / 1000).toFixed(0)}K/mes` : ''}`
                : 'Vencimientos exactos, checklist y alertas personalizadas según tu situación.'}
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

          <div style={{ height: 6, background: V.border, borderRadius: 999, marginBottom: 18, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: `linear-gradient(90deg, ${V.teal}, ${V.gold})`,
              width: `${progressPct}%`, transition: 'width .4s ease',
            }} />
          </div>

          {allDone ? (
            <div style={{ background: V.greenBg, border: `1px solid ${V.greenRing}`, borderRadius: 10, padding: '13px 16px', fontSize: 13, fontWeight: 700, color: V.green }}>
              🎉 ¡Todo listo! Tu panel está completamente configurado.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map(task => (
                <div key={task.id} style={{
                  border: `1.5px solid ${task.done ? V.tealRing : V.border}`,
                  borderRadius: 12, overflow: 'hidden',
                  background: task.done ? V.tealLight : V.surface,
                }}>
                  <div
                    onClick={() => !task.bloqueada && toggleTask(task.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 16px',
                      cursor: task.bloqueada && !task.done ? 'default' : 'pointer',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                      border: `2px solid ${task.done ? V.teal : task.bloqueada ? V.border : V.border2}`,
                      background: task.done ? V.teal : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {task.done && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {!task.done && task.bloqueada && (
                        <span style={{ fontSize: 10 }}>🔒</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: task.done ? V.tealDark : V.ink,
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

                    {task.done && <span style={{ fontSize: 11, color: V.teal, fontWeight: 700, flexShrink: 0 }}>✓ Listo</span>}
                  </div>

                  {/* Acción si no está completada */}
                  {!task.done && task.accion_href && (
                    <div style={{
                      borderTop: `1px solid ${V.border}`, padding: '9px 16px',
                      background: V.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 11, color: V.ink3, fontWeight: 600 }}>
                        {task.bloqueada ? '🔒 Completá esta info en tu perfil' : 'Pendiente'}
                      </span>
                      <Link href={task.accion_href} style={{
                        fontSize: 12, fontWeight: 800, color: V.teal,
                        textDecoration: 'none', whiteSpace: 'nowrap',
                      }}>
                        {task.accion_label} →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bloque 3: Vencimientos personalizados ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: V.ink, marginBottom: 16 }}>📅 Tus próximos vencimientos</div>

          {!perfilCompleto ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0 8px', textAlign: 'center' }}>
              <span style={{ fontSize: 32, opacity: .25 }}>🔒</span>
              <p style={{ fontSize: 13, fontWeight: 600, color: V.ink3, maxWidth: 280, lineHeight: 1.6, margin: 0 }}>
                Completá tu perfil (incluyendo la terminación de CUIT) para ver tus fechas exactas.
              </p>
              <Link href="/mipanel/perfil" style={{ fontSize: 13, fontWeight: 800, color: V.teal, textDecoration: 'none' }}>
                Completar perfil →
              </Link>
            </div>
          ) : vencimientos.length === 0 ? (
            <div style={{ fontSize: 13, color: V.ink3, fontWeight: 600 }}>Sin vencimientos próximos calculados.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {vencimientos.map((v, i) => {
                const dias = getDiasRestantes(v.dia)
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: `1.5px solid ${v.urgente ? '#fca5a5' : V.border}`,
                    borderRadius: 10,
                    background: v.urgente ? '#fff1f1' : V.surface,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>{v.titulo}</div>
                      <div style={{ fontSize: 12, color: V.ink3, fontWeight: 600, marginTop: 2 }}>{fmtFecha(v.dia)}</div>
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 800, padding: '4px 10px',
                      borderRadius: 20, whiteSpace: 'nowrap',
                      background: dias === 0 ? '#fff1f1' : dias <= 5 ? '#fff1f1' : V.tealLight,
                      color: dias <= 5 ? V.red : V.teal,
                      border: `1px solid ${dias <= 5 ? '#fca5a5' : V.tealRing}`,
                    }}>
                      {dias === 0 ? '¡Hoy!' : dias === 1 ? 'Mañana' : `En ${dias} días`}
                    </div>
                  </div>
                )
              })}
              <Link href="/calendario-fiscal" style={{ fontSize: 13, fontWeight: 800, color: V.teal, textDecoration: 'none', marginTop: 6, display: 'block' }}>
                Ver calendario completo 2026 →
              </Link>
            </div>
          )}
        </div>

        {/* ── Bloque 4: Asistente IA ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, overflow: 'hidden' }}>
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
                {tipoLabel} · CUIT …{perfil?.terminacion_cuit}
              </span>
            )}
          </div>

          {/* Chat */}
          <div style={{ padding: '16px 18px', maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiHistory.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                <p style={{ fontSize: 13, color: V.ink3, fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                  {perfilCompleto
                    ? `Hola${perfil?.nombre ? ` ${perfil.nombre}` : ''}! Ya tengo tu perfil cargado. Preguntame lo que quieras sobre tu situación fiscal.`
                    : 'Hola! Soy tu asistente fiscal. Podés preguntarme sobre impuestos, vencimientos y trámites.'}
                </p>
              </div>
            )}
            {aiHistory.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '10px 14px',
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
                }}>Consultando...</div>
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
                fontSize: 13, fontWeight: 800,
                cursor: aiLoading || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                opacity: aiLoading || !aiQuery.trim() ? .5 : 1,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Enviar →
            </button>
          </div>
        </div>

        {/* ── Bloque 5: Accesos rápidos ── */}
        <div style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: V.ink, marginBottom: 16 }}>💡 Accesos rápidos</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '📊', label: 'Mi categoría',     href: '/mi-categoria' },
              { icon: '📄', label: 'Cómo facturar',    href: '/como-facturar' },
              { icon: '📅', label: 'Calendario fiscal', href: '/calendario-fiscal' },
              { icon: '🗺️', label: 'Por provincia',     href: '/impuestos-por-provincia' },
            ].map(c => (
              <Link key={c.label} href={c.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '13px 16px', border: `1.5px solid ${V.border}`,
                borderRadius: 10, textDecoration: 'none',
                color: V.ink, fontSize: 13, fontWeight: 700,
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
