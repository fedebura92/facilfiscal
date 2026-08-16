import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// Cliente para Client Components (usa anon key). Con @supabase/ssr, la
// sesión se guarda en cookies en vez de localStorage — es lo que le permite
// a middleware.ts leerla del lado del servidor y proteger /mipanel de verdad.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cliente para el servidor (usa service role — solo en API Routes)
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
