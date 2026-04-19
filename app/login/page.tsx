'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre },
            emailRedirectTo: 'https://www.facilfiscal.com.ar/auth/callback',
          },
        })
        if (error) throw error
        setSuccess('¡Cuenta creada! Revisá tu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/mipanel'
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error'
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos.')
      else if (msg.includes('already registered')) setError('Este email ya está registrado.')
      else if (msg.includes('Password should')) setError('La contraseña debe tener al menos 6 caracteres.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--r)',
    fontSize: 14,
    fontFamily: "'Nunito', sans-serif",
    color: 'var(--ink)',
    background: 'var(--surface)',
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Nunito', sans-serif", padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1.5px solid var(--border)',
        borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh)',
        width: '100%', maxWidth: 420, padding: '40px 36px',
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'block', textAlign: 'center', marginBottom: 28, textDecoration: 'none' }}>
          <img src="/logo.png" alt="Fácil Fiscal" style={{ height: 120, width: 'auto' }} />
        </Link>

        {/* Título */}
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', textAlign: 'center', marginBottom: 6 }}>
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta gratis'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink3)', textAlign: 'center', marginBottom: 28, fontWeight: 600 }}>
          {mode === 'login' ? 'Ingresá para ver tu panel fiscal' : 'Empezá a organizar tu situación fiscal hoy'}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--r)', padding: 4, marginBottom: 24, gap: 4 }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--teal)' : 'var(--ink3)',
                boxShadow: mode === m ? 'var(--sh-sm)' : 'none',
                transition: 'all .15s',
              }}
            >
              {m === 'login' ? 'Ingresar' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Mensajes */}
        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red-ring)', borderRadius: 'var(--r)', padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 14 }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'var(--green-bg)', border: '1px solid var(--green-ring)', borderRadius: 'var(--r)', padding: '11px 14px', fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 14 }}>
            ✅ {success}
          </div>
        )}

        {/* Campos */}
        {mode === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Email</label>
          <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>Contraseña</label>
          <input
            type="password"
            placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />
        </div>

        {/* Botón */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: 14, border: 'none',
            borderRadius: 'var(--r)', marginTop: 8,
            background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))',
            color: '#fff', fontSize: 14, fontWeight: 900,
            fontFamily: "'Nunito', sans-serif",
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? .6 : 1,
          }}
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar a mi panel →' : 'Crear cuenta gratis →'}
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--ink3)' }}>
          <Link href="/" style={{ color: 'var(--teal)', fontWeight: 700, textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  )
}
