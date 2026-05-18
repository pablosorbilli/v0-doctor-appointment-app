import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Obtiene el estado de conexión de Mercado Pago del doctor
export async function GET() {
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

    // Obtener datos del doctor
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('mercadopago_user_id, mercadopago_connected_at')
      .eq('id', user.id)
      .single()

    if (doctorError) {
      return NextResponse.json(
        { error: 'Doctor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      connected: !!doctor.mercadopago_user_id,
      userId: doctor.mercadopago_user_id,
      connectedAt: doctor.mercadopago_connected_at,
    })
  } catch (error) {
    console.error('Error obteniendo estado de MP:', error)
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    )
  }
}
