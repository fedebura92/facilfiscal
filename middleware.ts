import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protección real de /mipanel: ahora que la sesión vive en cookies (ver
// lib/supabase.ts), el middleware puede leerla del lado del servidor y
// redirigir ANTES de que el navegador reciba una sola línea de /mipanel
// sin sesión válida. Antes esta función no hacía nada porque no tenía
// forma de ver la sesión (estaba en localStorage, invisible para el server).
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() (no getSession()): revalida el token contra el servidor de
  // Supabase en cada request en vez de confiar ciegamente en la cookie.
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const esRutaProtegida = path.startsWith('/mipanel')
  const esLogin = path === '/login'

  if (esRutaProtegida && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (esLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/mipanel'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/mipanel/:path*', '/login'],
}