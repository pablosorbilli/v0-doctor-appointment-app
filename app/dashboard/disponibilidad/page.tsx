import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DAYS_OF_WEEK } from '@/lib/types/database'
import { AvailabilityForm } from '@/components/dashboard/availability-form'
import { ExceptionsForm } from '@/components/dashboard/exceptions-form'

export default async function DisponibilidadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('doctor_id', user?.id)
    .order('day_of_week')
    .order('start_time')

  const { data: exceptions } = await supabase
    .from('availability_exceptions')
    .select('*')
    .eq('doctor_id', user?.id)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date')

  // Agrupar disponibilidad por día
  const availabilityByDay = DAYS_OF_WEEK.map((day, index) => ({
    dayIndex: index,
    dayName: day,
    slots: availability?.filter((a) => a.day_of_week === index) || [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disponibilidad</h1>
        <p className="text-muted-foreground">
          Configura tus horarios de atención semanales
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Horarios Semanales</CardTitle>
            <CardDescription>
              Define los horarios en los que atiendes cada día de la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityForm availabilityByDay={availabilityByDay} />
          </CardContent>
        </Card>

        {/* Exceptions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Excepciones</CardTitle>
            <CardDescription>
              Marca días específicos como no disponibles (vacaciones, feriados, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExceptionsForm exceptions={exceptions || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
