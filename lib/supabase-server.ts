import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente para Server Components y Route Handlers que necesitan la sesión
// del usuario autenticado (a diferencia de supabaseAdmin(), que usa la
// service role y bypassea RLS — este respeta las políticas normales).
export function supabaseServer() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Se está llamando desde un Server Component (no puede escribir
            // cookies). No pasa nada: middleware.ts se encarga de refrescar
            // la sesión en esos casos.
          }
        },
      },
    }
  )
}
