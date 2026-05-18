import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Callback de OAuth de Mercado Pago
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') // user.id que enviamos

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/configuracion?mp_error=no_code', request.url)
      )
    }

    const supabase = await createClient()
    
    // Verificar que el usuario esté autenticado y coincida con el state
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== state) {
      return NextResponse.redirect(
        new URL('/dashboard/configuracion?mp_error=auth_mismatch', request.url)
      )
    }

    // Intercambiar el code por access_token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: process.env.MERCADOPAGO_APP_ID!,
        client_secret: process.env.MERCADOPAGO_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Error obteniendo token de MP:', errorData)
      return NextResponse.redirect(
        new URL('/dashboard/configuracion?mp_error=token_error', request.url)
      )
    }

    const tokenData = await tokenResponse.json()

    // Guardar las credenciales en la tabla doctors
    const { error: updateError } = await supabase
      .from('doctors')
      .update({
        mercadopago_access_token: tokenData.access_token,
        mercadopago_refresh_token: tokenData.refresh_token,
        mercadopago_user_id: tokenData.user_id?.toString(),
        mercadopago_connected_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error guardando credenciales de MP:', updateError)
      return NextResponse.redirect(
        new URL('/dashboard/configuracion?mp_error=save_error', request.url)
      )
    }

    // Redirigir con éxito
    return NextResponse.redirect(
      new URL('/dashboard/configuracion?mp_success=true', request.url)
    )
  } catch (error) {
    console.error('Error en callback de Mercado Pago:', error)
    return NextResponse.redirect(
      new URL('/dashboard/configuracion?mp_error=unknown', request.url)
    )
  }
}
