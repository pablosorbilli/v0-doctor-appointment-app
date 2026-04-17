import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendAppointmentConfirmation, sendDoctorNotification } from '@/lib/email'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*),
        appointment_type:appointment_types(*)
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const dateFormatted = format(
      new Date(appointment.date),
      "EEEE d 'de' MMMM 'de' yyyy",
      { locale: es }
    )

    // Enviar confirmación al paciente
    const patientResult = await sendAppointmentConfirmation({
      patientName: appointment.patient_name,
      patientEmail: appointment.patient_email,
      doctorName: `${appointment.doctor.first_name} ${appointment.doctor.last_name}`,
      doctorSpecialty: appointment.doctor.specialty,
      date: dateFormatted,
      time: appointment.start_time.slice(0, 5),
      appointmentType: appointment.appointment_type?.name,
      address: appointment.doctor.address,
    })

    // Enviar notificación al médico
    const doctorResult = await sendDoctorNotification({
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

    return NextResponse.json({
      patientEmail: patientResult,
      doctorEmail: doctorResult,
    })
  } catch (error) {
    console.error('Error sending confirmation emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}
