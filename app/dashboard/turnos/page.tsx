import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Mail, Phone, Calendar } from 'lucide-react'
import { AppointmentActions } from '@/components/dashboard/appointment-actions'
import { WeekCalendarWrapper } from '@/components/dashboard/week-calendar-wrapper'

interface PageProps {
  searchParams: Promise<{ date?: string; view?: string }>
}

export default async function TurnosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Determine the current week based on date param or today
  const baseDate = params.date ? new Date(params.date) : new Date()
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 }) // Sunday
  
  const prevWeekStart = format(subWeeks(weekStart, 1), 'yyyy-MM-dd')
  const nextWeekStart = format(addWeeks(weekStart, 1), 'yyyy-MM-dd')
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Fetch all appointments for the week
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, appointment_type:appointment_types(*)')
    .eq('doctor_id', user?.id)
    .gte('date', format(weekStart, 'yyyy-MM-dd'))
    .lte('date', format(weekEnd, 'yyyy-MM-dd'))
    .order('date')
    .order('start_time')

  const statusLabels: Record<string, string> = {
    pending_payment: 'Pendiente de Pago',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    completed: 'Completado',
    no_show: 'No se presento',
  }

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending_payment: 'outline',
    confirmed: 'default',
    cancelled: 'destructive',
    completed: 'secondary',
    no_show: 'destructive',
  }

  // Group appointments by date for the list view
  const appointmentsByDate = (appointments || []).reduce((acc, apt) => {
    const date = apt.date
    if (!acc[date]) acc[date] = []
    acc[date].push(apt)
    return acc
  }, {} as Record<string, typeof appointments>)

  const weekLabel = `${format(weekStart, "d 'de' MMMM", { locale: es })} - ${format(weekEnd, "d 'de' MMMM, yyyy", { locale: es })}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turnos</h1>
          <p className="text-muted-foreground">
            Vista semanal de tus turnos y citas medicas
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/turnos?date=${todayStr}`}>
            <Calendar className="mr-2 h-4 w-4" />
            Hoy
          </Link>
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/turnos?date=${prevWeekStart}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="text-center">
            <div className="text-lg font-semibold">
              Semana del {weekLabel}
            </div>
            <div className="text-sm text-muted-foreground">
              {appointments?.filter(a => a.status === 'confirmed' || a.status === 'completed').length || 0} turnos programados
            </div>
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/turnos?date=${nextWeekStart}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Week Calendar View */}
      <div className="h-[calc(100vh-20rem)] min-h-[500px]">
        <WeekCalendarWrapper
          appointments={appointments || []}
          weekStart={weekStart}
        />
      </div>

      {/* Appointments List by Day */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Turnos</CardTitle>
          <CardDescription>
            Lista completa de turnos de la semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(appointmentsByDate).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(appointmentsByDate).map(([date, dayAppointments]) => (
                <div key={date}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="text-sm font-semibold capitalize">
                      {format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {dayAppointments?.length} turno{dayAppointments?.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {dayAppointments?.map((appointment) => (
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
                                <> - ${(appointment.payment_amount / 100).toLocaleString('es-AR')}</>
                              )}
                            </div>
                            {appointment.visit_reason && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium">Motivo:</span> {appointment.visit_reason}
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
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No hay turnos para esta semana</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
