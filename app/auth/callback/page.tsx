'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // window.location.href (no router.push): fuerza un reload completo
        // para que la cookie de sesión de Supabase se propague antes de que
        // /mipanel intente leerla. Es justo el flujo más sensible a esto
        // (primera vez que el usuario confirma su cuenta).
        window.location.href = '/mipanel'
      } else {
        // Escucha el evento de login por hash
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            window.location.href = '/mipanel'
          }
        })
      }
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Nunito, sans-serif', color: '#64748b'
    }}>
      Verificando tu cuenta...
    </div>
  )
}