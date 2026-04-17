import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Clock, Stethoscope, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PageProps {
  searchParams: Promise<{ appointment_id?: string }>
}

export default async function BookingPendingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const appointmentId = params.appointment_id

  let appointment = null
  
  if (appointmentId) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(first_name, last_name, slug)
      `)
      .eq('id', appointmentId)
      .single()
    
    appointment = data
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Pago Pendiente</CardTitle>
            <CardDescription>
              Tu pago está siendo procesado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-sm">
              <p className="text-yellow-800">
                El pago está en proceso de verificación. Esto puede tomar unos minutos.
              </p>
            </div>

            {appointment && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 font-semibold">Tu Turno Reservado</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(appointment.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.start_time.slice(0, 5)} hs</span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Te enviaremos un email de confirmación cuando el pago sea aprobado.
            </p>

            <Button asChild className="w-full">
              <Link href={appointment?.doctor?.slug ? `/dr/${appointment.doctor.slug}` : '/'}>
                Volver
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
