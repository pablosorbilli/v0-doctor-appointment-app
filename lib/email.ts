import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface AppointmentConfirmationData {
  patientName: string
  patientEmail: string
  doctorName: string
  doctorSpecialty: string
  date: string
  time: string
  appointmentType?: string
  address?: string
}

interface DoctorNotificationData {
  doctorEmail: string
  doctorName: string
  patientName: string
  patientEmail: string
  patientPhone?: string
  date: string
  time: string
  appointmentType?: string
  visitReason?: string
}

export async function sendAppointmentConfirmation(data: AppointmentConfirmationData) {
  if (!resend) {
    console.log('[Email] Resend not configured, skipping email')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'MediTurnos <notificaciones@mediturnos.app>',
      to: data.patientEmail,
      subject: `Turno Confirmado - Dr. ${data.doctorName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Turno Confirmado</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0066cc 0%, #004499 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Turno Confirmado</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Hola <strong>${data.patientName}</strong>,</p>
            
            <p>Tu turno ha sido confirmado exitosamente.</p>
            
            <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #0066cc; font-size: 18px;">Detalles del Turno</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Médico:</td>
                  <td style="padding: 8px 0; font-weight: 500;">Dr. ${data.doctorName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Especialidad:</td>
                  <td style="padding: 8px 0;">${data.doctorSpecialty}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Fecha:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Horario:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${data.time} hs</td>
                </tr>
                ${data.appointmentType ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tipo:</td>
                  <td style="padding: 8px 0;">${data.appointmentType}</td>
                </tr>
                ` : ''}
                ${data.address ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Dirección:</td>
                  <td style="padding: 8px 0;">${data.address}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Por favor, llegá 10 minutos antes de tu turno. 
              Si necesitás cancelar o reprogramar, contactá al consultorio con anticipación.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Este email fue enviado por MediTurnos.<br>
              Si no solicitaste este turno, ignorá este mensaje.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('[Email] Error sending confirmation:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[Email] Exception:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendDoctorNotification(data: DoctorNotificationData) {
  if (!resend) {
    console.log('[Email] Resend not configured, skipping doctor notification')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'MediTurnos <notificaciones@mediturnos.app>',
      to: data.doctorEmail,
      subject: `Nuevo Turno: ${data.patientName} - ${data.date}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo Turno</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #10b981; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nuevo Turno Reservado</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Dr. ${data.doctorName},</p>
            
            <p>Se ha confirmado un nuevo turno en tu agenda:</p>
            
            <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Paciente:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${data.patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0;">${data.patientEmail}</td>
                </tr>
                ${data.patientPhone ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Teléfono:</td>
                  <td style="padding: 8px 0;">${data.patientPhone}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #666;">Fecha:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Horario:</td>
                  <td style="padding: 8px 0; font-weight: 500;">${data.time} hs</td>
                </tr>
                ${data.appointmentType ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Tipo:</td>
                  <td style="padding: 8px 0;">${data.appointmentType}</td>
                </tr>
                ` : ''}
                ${data.visitReason ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Motivo:</td>
                  <td style="padding: 8px 0;">${data.visitReason}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              MediTurnos - Sistema de Gestión de Turnos Médicos
            </p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('[Email] Error sending doctor notification:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[Email] Exception:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
