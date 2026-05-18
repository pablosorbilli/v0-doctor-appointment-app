import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Desconecta la cuenta de Mercado Pago
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Limpiar las credenciales de MP
    const { error: updateError } = await supabase
      .from('doctors')
      .update({
        mercadopago_access_token: null,
        mercadopago_refresh_token: null,
        mercadopago_user_id: null,
        mercadopago_connected_at: null,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error desconectando MP:', updateError)
      return NextResponse.json(
        { error: 'Error al desconectar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en disconnect de Mercado Pago:', error)
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}
