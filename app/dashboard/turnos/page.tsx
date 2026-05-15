import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react'
import { AppointmentActions } from '@/components/dashboard/appointment-actions'

interface PageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function TurnosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const selectedDate = params.date || format(new Date(), 'yyyy-MM-dd')
  const prevDate = format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd')
  const nextDate = format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, appointment_type:appointment_types(*)')
    .eq('doctor_id', user?.id)
    .eq('date', selectedDate)
    .order('start_time')

  const statusLabels: Record<string, string> = {
    pending_payment: 'Pendiente de Pago',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
    no_show: 'No se presentó',
  }

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending_payment: 'outline',
    confirmed: 'default',
    cancelled: 'destructive',
    completed: 'secondary',
    no_show: 'destructive',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turnos</h1>
          <p className="text-muted-foreground">
            Gestiona tus turnos y citas médicas
          </p>
        </div>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/turnos?date=${prevDate}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {format(new Date(selectedDate), "EEEE", { locale: es })}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(selectedDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/turnos?date=${nextDate}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Turnos del día</CardTitle>
          <CardDescription>
            {appointments?.length || 0} turno{appointments?.length !== 1 ? 's' : ''} programado{appointments?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-muted text-center">
                      <div className="text-lg font-bold leading-none">
                        {appointment.start_time.slice(0, 5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.end_time.slice(0, 5)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{appointment.patient_name}</span>
                        <Badge variant={statusVariants[appointment.status]}>
                          {statusLabels[appointment.status]}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {appointment.appointment_type?.name || 'Consulta General'}
                        {appointment.payment_amount && (
                          <> · ${(appointment.payment_amount / 100).toLocaleString('es-AR')}</>
                        )}
                      </div>
                      {appointment.visit_reason && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Motivo:</span> {appointment.visit_reason}
                        </div>
                      )}
                      {appointment.notes && (
                        <div className="mt-1 text-sm text-muted-foreground italic">
                          <span className="font-medium not-italic">Notas del paciente:</span> {appointment.notes}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {appointment.patient_email}
                        </span>
                        {appointment.patient_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.patient_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <AppointmentActions appointment={appointment} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No hay turnos para esta fecha</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
