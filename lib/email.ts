import { Resend } from 'resend'

// Lazy initialization del cliente Resend para asegurar que lee la API key en runtime
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

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
  console.log('[v0] sendAppointmentConfirmation called with:', JSON.stringify(data, null, 2))
  console.log('[v0] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  
  const resend = getResendClient()
  console.log('[v0] resend client created:', !!resend)
  
  if (!resend) {
    console.log('[Email] Resend not configured, skipping email')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    console.log('[v0] Attempting to send email to:', data.patientEmail)
    const { error, data: emailData } = await resend.emails.send({
      from: 'MediTurnos <onboarding@resend.dev>',
      to: data.patientEmail,
      subject: `TURNO CONFIRMADO - Dr. ${data.doctorName} - ${data.date}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Turno Confirmado</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Container -->
          <div style="margin: 20px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header con logo -->
            <div style="background: #0f172a; padding: 24px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 8px; display: inline-block;"></div>
                <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">MediTurnos</span>
              </div>
            </div>
            
            <!-- Banner de confirmacion -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
              <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 100px; margin-bottom: 16px;">
                <span style="color: white; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Reserva Exitosa</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">TURNO CONFIRMADO</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">Tu cita ha sido registrada correctamente</p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; margin: 0 0 24px 0;">Hola <strong>${data.patientName}</strong>,</p>
              
              <!-- Card de detalles -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: #0f172a; padding: 16px 20px;">
                  <h2 style="margin: 0; color: white; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Detalles del Turno</h2>
                </div>
                <div style="padding: 20px;">
                  <!-- Medico -->
                  <div style="display: flex; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                    <div style="width: 48px; height: 48px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                      <span style="color: white; font-weight: 600; font-size: 16px;">${data.doctorName.split(' ').map((n: string) => n[0]).join('').slice(0,2)}</span>
                    </div>
                    <div>
                      <div style="font-weight: 600; font-size: 16px; color: #0f172a;">Dr. ${data.doctorName}</div>
                      <div style="color: #64748b; font-size: 14px;">${data.doctorSpecialty}</div>
                    </div>
                  </div>
                  
                  <!-- Fecha y hora destacados -->
                  <div style="background: white; border: 2px solid #3b82f6; border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: center;">
                    <div style="color: #3b82f6; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Fecha y Hora</div>
                    <div style="font-size: 18px; font-weight: 700; color: #0f172a;">${data.date}</div>
                    <div style="font-size: 24px; font-weight: 700; color: #3b82f6; margin-top: 4px;">${data.time} hs</div>
                  </div>
                  
                  <!-- Detalles adicionales -->
                  <table style="width: 100%; border-collapse: collapse;">
                    ${data.appointmentType ? `
                    <tr>
                      <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">Tipo de consulta</td>
                      <td style="padding: 10px 0; font-weight: 500; font-size: 14px; color: #0f172a;">${data.appointmentType}</td>
                    </tr>
                    ` : ''}
                    ${data.address ? `
                    <tr>
                      <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">Direccion</td>
                      <td style="padding: 10px 0; font-weight: 500; font-size: 14px; color: #0f172a;">${data.address}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              </div>
              
              <!-- Recordatorio -->
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; margin-top: 24px;">
                <div style="font-weight: 600; color: #92400e; font-size: 14px; margin-bottom: 4px;">Recordatorio importante</div>
                <p style="color: #a16207; font-size: 13px; margin: 0; line-height: 1.5;">
                  Por favor, llega 10 minutos antes de tu turno. Si necesitas cancelar o reprogramar, contacta al consultorio con anticipacion.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                Este email fue enviado por <strong>MediTurnos</strong><br>
                Sistema de Gestion de Turnos Medicos
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 12px 0 0 0;">
                Si no solicitaste este turno, ignora este mensaje.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('[v0] Error sending confirmation:', error)
      return { success: false, error: error.message }
    }

    console.log('[v0] Email sent successfully! Response:', emailData)
    return { success: true }
  } catch (error) {
    console.error('[Email] Exception:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendDoctorNotification(data: DoctorNotificationData) {
  const resend = getResendClient()
  
  if (!resend) {
    console.log('[Email] Resend not configured, skipping doctor notification')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const { error } = await resend.emails.send({
      from: 'MediTurnos <onboarding@resend.dev>',
      to: data.doctorEmail,
      subject: `NUEVO TURNO - ${data.patientName} - ${data.date} ${data.time} hs`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Turno</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
          <!-- Container -->
          <div style="margin: 20px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            
            <!-- Header con logo -->
            <div style="background: #0f172a; padding: 24px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 8px; display: inline-block;"></div>
                <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">MediTurnos</span>
              </div>
            </div>
            
            <!-- Banner de nuevo turno -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
              <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 100px; margin-bottom: 16px;">
                <span style="color: white; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Nueva Reserva</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">NUEVO TURNO</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">Se ha registrado una nueva cita en tu agenda</p>
            </div>
            
            <!-- Contenido principal -->
            <div style="padding: 32px 24px;">
              <p style="font-size: 16px; margin: 0 0 24px 0;">Dr. <strong>${data.doctorName}</strong>,</p>
              
              <!-- Fecha y hora destacados -->
              <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <div style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Fecha y Hora del Turno</div>
                <div style="font-size: 20px; font-weight: 700; color: white;">${data.date}</div>
                <div style="font-size: 32px; font-weight: 700; color: #3b82f6; margin-top: 4px;">${data.time} hs</div>
              </div>
              
              <!-- Card de datos del paciente -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: #10b981; padding: 16px 20px;">
                  <h2 style="margin: 0; color: white; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Datos del Paciente</h2>
                </div>
                <div style="padding: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; width: 35%; border-bottom: 1px solid #e2e8f0;">Nombre</td>
                      <td style="padding: 12px 0; font-weight: 600; font-size: 15px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.patientName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Email</td>
                      <td style="padding: 12px 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                        <a href="mailto:${data.patientEmail}" style="color: #3b82f6; text-decoration: none;">${data.patientEmail}</a>
                      </td>
                    </tr>
                    ${data.patientPhone ? `
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Telefono</td>
                      <td style="padding: 12px 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                        <a href="tel:${data.patientPhone}" style="color: #3b82f6; text-decoration: none;">${data.patientPhone}</a>
                      </td>
                    </tr>
                    ` : ''}
                    ${data.appointmentType ? `
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; border-bottom: 1px solid #e2e8f0;">Tipo de consulta</td>
                      <td style="padding: 12px 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data.appointmentType}</td>
                    </tr>
                    ` : ''}
                    ${data.visitReason ? `
                    <tr>
                      <td style="padding: 12px 0; color: #64748b; font-size: 14px; vertical-align: top;">Motivo de consulta</td>
                      <td style="padding: 12px 0; font-size: 14px; color: #0f172a;">${data.visitReason}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                <strong>MediTurnos</strong> - Sistema de Gestion de Turnos Medicos
              </p>
            </div>
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
