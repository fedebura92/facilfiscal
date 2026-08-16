import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Reemplaza al viejo app/auth/callback/page.tsx (client component). Con la
// sesión ahora en cookies + flowType 'pkce' (ver lib/supabase.ts), el link
// de confirmación de mail llega con ?code=... en vez del hash #access_token=
// de antes, y hay que canjearlo por una sesión ACÁ, en el servidor, para que
// la cookie quede seteada antes de que el navegador llegue a /mipanel.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/mipanel`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmacion`)
}
