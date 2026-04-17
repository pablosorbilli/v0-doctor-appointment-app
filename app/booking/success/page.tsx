import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Calendar, Clock, User, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PageProps {
  searchParams: Promise<{ appointment_id?: string }>
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams
  const appointmentId = params.appointment_id

  if (!appointmentId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p>No se encontró información del turno</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctors(*),
      appointment_type:appointment_types(*)
    `)
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p>Turno no encontrado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Actualizar el estado si viene de MercadoPago
  if (appointment.status === 'pending_payment') {
    await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
      })
      .eq('id', appointmentId)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-4 text-primary">
          <Stethoscope className="h-6 w-6" />
          <span className="font-bold">MediTurnos</span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Turno Confirmado</CardTitle>
            <CardDescription>
              Tu pago ha sido procesado exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 font-semibold">Detalles del Turno</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Dr. {appointment.doctor?.first_name} {appointment.doctor?.last_name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(appointment.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {appointment.start_time.slice(0, 5)} hs
                  </span>
                </div>
                {appointment.appointment_type && (
                  <div className="pt-2 text-muted-foreground">
                    {appointment.appointment_type.name}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
              Te enviamos un email de confirmación a{' '}
              <span className="font-medium text-foreground">
                {appointment.patient_email}
              </span>
            </div>

            <Button asChild className="w-full">
              <Link href={`/dr/${appointment.doctor?.slug}`}>
                Volver a la página del médico
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
