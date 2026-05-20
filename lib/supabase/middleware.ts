import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Rutas públicas que no necesitan verificar sesión
  const publicRoutes = ['/dr/', '/api/appointments', '/booking/', '/api/webhooks/', '/auth/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Verificar que las variables de entorno estén configuradas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Si las variables no están configuradas, permitir acceso solo a rutas públicas
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicRoute || pathname === '/') {
      return NextResponse.next({ request })
    }
    // Redirigir a home si intenta acceder a rutas protegidas sin config
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
  // Para rutas públicas, simplemente continuar sin verificar auth
  if (isPublicRoute) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas del dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Si está logueado y va a login/signup, redirigir a dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/auth/login' ||
      request.nextUrl.pathname === '/auth/sign-up')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
