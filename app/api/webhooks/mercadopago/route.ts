import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { sendAppointmentConfirmation, sendDoctorNotification } from '@/lib/email'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar que sea una notificación de pago
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    const supabase = await createClient()

    // Primero intentamos obtener el appointment para saber qué doctor es
    // El external_reference puede venir en el body o necesitamos obtenerlo del pago
    // Usamos el token global para la verificación inicial
    const globalToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!globalToken) {
      return NextResponse.json({ error: 'MercadoPago not configured' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({
      accessToken: globalToken,
    })

    const payment = new Payment(client)
    let paymentData
    
    try {
      paymentData = await payment.get({ id: paymentId })
    } catch (mpError) {
      // Si falla con el token global, puede que sea de un doctor específico
      // En ese caso, necesitamos buscar el appointment primero
      console.log('Payment not found with global token, trying to find doctor token...')
      
      // Intentamos buscar un payment pendiente con este ID
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('appointment_id')
        .eq('mercadopago_payment_id', paymentId.toString())
        .single()
      
      if (!paymentRecord) {
        // Si no existe, probablemente es un pago nuevo, retornamos ok y esperamos el siguiente webhook
        return NextResponse.json({ received: true })
      }
      
      // Obtener el doctor del appointment
      const { data: appointment } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('id', paymentRecord.appointment_id)
        .single()
      
      if (appointment) {
        const { data: doctor } = await supabase
          .from('doctors')
          .select('mercadopago_access_token')
          .eq('id', appointment.doctor_id)
          .single()
        
        if (doctor?.mercadopago_access_token) {
          const doctorClient = new MercadoPagoConfig({
            accessToken: doctor.mercadopago_access_token,
          })
          const doctorPayment = new Payment(doctorClient)
          paymentData = await doctorPayment.get({ id: paymentId })
        }
      }
      
      if (!paymentData) {
        return NextResponse.json({ error: 'Could not fetch payment' }, { status: 500 })
      }
    }

    const externalReference = paymentData.external_reference
    const status = paymentData.status
    const paymentMethod = paymentData.payment_method_id

    if (!externalReference) {
      return NextResponse.json({ error: 'No external reference' }, { status: 400 })
    }

    // Mapear estado de MercadoPago a nuestro sistema
    let paymentStatus: string
    let appointmentStatus: string

    switch (status) {
      case 'approved':
        paymentStatus = 'approved'
        appointmentStatus = 'confirmed'
        break
      case 'pending':
      case 'in_process':
        paymentStatus = 'in_process'
        appointmentStatus = 'pending_payment'
        break
      case 'rejected':
      case 'cancelled':
        paymentStatus = 'rejected'
        appointmentStatus = 'pending_payment'
        break
      case 'refunded':
        paymentStatus = 'refunded'
        appointmentStatus = 'cancelled'
        break
      default:
        paymentStatus = 'pending'
        appointmentStatus = 'pending_payment'
    }

    // Actualizar el pago
    await supabase
      .from('payments')
      .update({
        mercadopago_payment_id: paymentId.toString(),
        status: paymentStatus,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('appointment_id', externalReference)

    // Actualizar el turno
    await supabase
      .from('appointments')
      .update({
        status: appointmentStatus,
        payment_status: status === 'approved' ? 'paid' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', externalReference)

    // Si el pago fue aprobado, enviar email de confirmación
    if (status === 'approved') {
      try {
        const { data: appointment } = await supabase
          .from('appointments')
          .select(`
            *,
            doctor:doctors(*),
            appointment_type:appointment_types(*)
          `)
          .eq('id', externalReference)
          .single()

        if (appointment) {
          const dateFormatted = format(
            new Date(appointment.date),
            "EEEE d 'de' MMMM 'de' yyyy",
            { locale: es }
          )

          // Enviar al paciente
          await sendAppointmentConfirmation({
            patientName: appointment.patient_name,
            patientEmail: appointment.patient_email,
            doctorName: `${appointment.doctor.first_name} ${appointment.doctor.last_name}`,
            doctorSpecialty: appointment.doctor.specialty,
            date: dateFormatted,
            time: appointment.start_time.slice(0, 5),
            appointmentType: appointment.appointment_type?.name,
            address: appointment.doctor.address,
          })

          // Enviar al médico
          await sendDoctorNotification({
            doctorEmail: appointment.doctor.email,
            doctorName: `${appointment.doctor.first_name} ${appointment.doctor.last_name}`,
            patientName: appointment.patient_name,
            patientEmail: appointment.patient_email,
            patientPhone: appointment.patient_phone,
            date: dateFormatted,
            time: appointment.start_time.slice(0, 5),
            appointmentType: appointment.appointment_type?.name,
            visitReason: appointment.visit_reason,
          })
        }
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError)
      }
    }

    return NextResponse.json({ received: true, status: paymentStatus })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Mercado Pago también puede enviar GETs para verificar el endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
