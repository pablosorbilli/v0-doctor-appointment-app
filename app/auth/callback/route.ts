import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // Handle PKCE code exchange (for email confirmation links)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Si es recovery (recuperar contraseña), redirigir a nueva-password
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/nueva-password`)
      }
      // Si es verificacion de email (signup), redirigir a pagina de verificado
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(`${origin}/auth/verificado`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[v0] Error exchanging code for session:', error)
  }

  // Handle token_hash for email verification (older method)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery' | 'invite',
    })
    if (!error) {
      // Redirigir a pagina de verificado exitoso
      return NextResponse.redirect(`${origin}/auth/verificado`)
    }
    console.error('[v0] Error verifying OTP:', error)
  }

  // If we have an error_description in URL, redirect to error page with it
  const errorDescription = searchParams.get('error_description')
  const errorCode = searchParams.get('error_code')
  if (errorDescription) {
    const params = new URLSearchParams()
    params.set('message', errorDescription)
    if (errorCode) params.set('error_code', errorCode)
    return NextResponse.redirect(`${origin}/auth/error?${params.toString()}`)
  }

  return NextResponse.redirect(`${origin}/auth/error?message=No se pudo verificar el email`)
}
