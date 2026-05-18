import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Inicia el flujo OAuth de Mercado Pago
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const appId = process.env.MERCADOPAGO_APP_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/callback`

    if (!appId) {
      return NextResponse.json(
        { error: 'Mercado Pago no está configurado correctamente' },
        { status: 500 }
      )
    }

    // URL de autorización de Mercado Pago
    const authUrl = new URL('https://auth.mercadopago.com.ar/authorization')
    authUrl.searchParams.set('client_id', appId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('platform_id', 'mp')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', user.id) // Usamos el user ID como state para seguridad

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Error iniciando OAuth de Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Error al conectar con Mercado Pago' },
      { status: 500 }
    )
  }
}
