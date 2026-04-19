'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
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
            emailRedirectTo: 'https://www.facilfiscal.com.ar/mipanel',
          },
      })
        if (error) throw error
        setSuccess('¡Cuenta creada! Revisá tu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/mipanel')
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

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          padding: 20px;
        }

        .login-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,.07);
          width: 100%;
          max-width: 420px;
          padding: 40px 36px;
        }

        .login-logo {
          display: block;
          text-align: center;
          margin-bottom: 28px;
          text-decoration: none;
        }

        .login-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          text-align: center;
          margin-bottom: 6px;
        }

        .login-sub {
          font-size: .875rem;
          color: #64748b;
          text-align: center;
          margin-bottom: 28px;
        }

        .tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 24px;
        }

        .tab {
          flex: 1;
          padding: 9px;
          border: none;
          background: none;
          border-radius: 8px;
          font-size: .875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, color .15s;
          color: #64748b;
          font-family: 'Nunito', sans-serif;
        }

        .tab.active {
          background: #fff;
          color: #0d9488;
          box-shadow: 0 1px 4px rgba(0,0,0,.08);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .field label {
          font-size: .8rem;
          font-weight: 700;
          color: #475569;
        }

        .field input {
          padding: 11px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: .9rem;
          font-family: 'Nunito', sans-serif;
          color: #1e293b;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }

        .field input:focus {
          border-color: #0d9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,.1);
        }

        .btn-primary {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #0d9488, #0f766e);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: .95rem;
          font-weight: 800;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          transition: opacity .2s, transform .15s;
        }

        .btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }

        .error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: .85rem;
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .success-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: .85rem;
          color: #166534;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
          font-size: .8rem;
          color: #94a3b8;
        }

        .login-footer a {
          color: #0d9488;
          font-weight: 700;
          text-decoration: none;
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <Link href="/" className="login-logo">
            <img src="/logo.png" alt="Fácil Fiscal" style={{ height: '120px', width: 'auto' }} />
          </Link>

          <div className="login-title">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Creá tu cuenta gratis'}
          </div>
          <div className="login-sub">
            {mode === 'login'
              ? 'Ingresá para ver tu panel fiscal'
              : 'Empezá a organizar tu situación fiscal hoy'}
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            >
              Ingresar
            </button>
            <button
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(''); setSuccess('') }}
            >
              Registrarse
            </button>
          </div>

          {/* Messages */}
          {error && <div className="error-box">⚠️ {error}</div>}
          {success && <div className="success-box">✅ {success}</div>}

          {/* Fields */}
          {mode === 'register' && (
            <div className="field">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? 'Cargando...'
              : mode === 'login'
              ? 'Ingresar a mi panel →'
              : 'Crear cuenta gratis →'}
          </button>

          <div className="login-footer">
            <Link href="/">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </>
  )
}
