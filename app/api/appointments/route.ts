import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      doctorId,
      appointmentTypeId,
      date,
      startTime,
      endTime,
      patientName,
      patientEmail,
      patientPhone,
      patientDni,
      visitReason,
      consentTemplateId,
      paymentAmount,
    } = body

    // Validaciones básicas
    if (!doctorId || !date || !startTime || !patientName || !patientEmail) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar que el slot no esté ocupado
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('date', date)
      .eq('start_time', startTime)
      .in('status', ['confirmed', 'pending_payment'])
      .single()

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Este horario ya no está disponible' },
        { status: 409 }
      )
    }

    // Obtener IP del cliente para el consentimiento
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Crear el turno
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        appointment_type_id: appointmentTypeId || null,
        date,
        start_time: startTime,
        end_time: endTime,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone || null,
        patient_dni: patientDni || null,
        visit_reason: visitReason || null,
        consent_template_id: consentTemplateId || null,
        consent_accepted_at: consentTemplateId ? new Date().toISOString() : null,
        consent_ip_address: consentTemplateId ? clientIp : null,
        status: paymentAmount > 0 ? 'pending_payment' : 'confirmed',
        payment_status: paymentAmount > 0 ? 'pending' : 'paid',
        payment_amount: paymentAmount || 0,
      })
      .select()
      .single()

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Error al crear el turno' },
        { status: 500 }
      )
    }

    // Si hay monto a pagar, crear preferencia de Mercado Pago
    if (paymentAmount > 0 && process.env.MERCADOPAGO_ACCESS_TOKEN) {
      try {
        const client = new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        })

        const preference = new Preference(client)

        const { data: doctor } = await supabase
          .from('doctors')
          .select('first_name, last_name, specialty')
          .eq('id', doctorId)
          .single()

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''

        const preferenceData = await preference.create({
          body: {
            items: [
              {
                id: appointment.id,
                title: `Consulta médica - Dr. ${doctor?.first_name} ${doctor?.last_name}`,
                description: `${doctor?.specialty} - ${date} ${startTime.slice(0, 5)}`,
                quantity: 1,
                unit_price: paymentAmount / 100,
                currency_id: 'ARS',
              },
            ],
            payer: {
              name: patientName.split(' ')[0],
              surname: patientName.split(' ').slice(1).join(' ') || patientName,
              email: patientEmail,
            },
            back_urls: {
              success: `${baseUrl}/booking/success?appointment_id=${appointment.id}`,
              failure: `${baseUrl}/booking/failure?appointment_id=${appointment.id}`,
              pending: `${baseUrl}/booking/pending?appointment_id=${appointment.id}`,
            },
            auto_return: 'approved',
            external_reference: appointment.id,
            notification_url: `${baseUrl}/api/webhooks/mercadopago`,
          },
        })

        // Actualizar appointment con la referencia de preferencia
        await supabase
          .from('appointments')
          .update({ payment_id: preferenceData.id })
          .eq('id', appointment.id)

        // Crear registro de pago
        await supabase.from('payments').insert({
          appointment_id: appointment.id,
          mercadopago_preference_id: preferenceData.id,
          amount: paymentAmount,
          status: 'pending',
          payer_email: patientEmail,
        })

        return NextResponse.json({
          appointment,
          paymentUrl: preferenceData.init_point,
        })
      } catch (mpError) {
        console.error('Error creating MercadoPago preference:', mpError)
        // Aún así devolvemos el appointment, pero sin URL de pago
        return NextResponse.json({
          appointment,
          paymentUrl: null,
          warning: 'No se pudo generar el link de pago',
        })
      }
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Error in POST /api/appointments:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
