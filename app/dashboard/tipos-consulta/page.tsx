import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppointmentTypesForm } from '@/components/dashboard/appointment-types-form'

export default async function TiposConsultaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: appointmentTypes } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('doctor_id', user?.id)
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tipos de Consulta</h1>
        <p className="text-muted-foreground">
          Configura los diferentes tipos de consulta que ofreces
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Consulta</CardTitle>
          <CardDescription>
            Define diferentes tipos de cita con precios y duraciones específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentTypesForm appointmentTypes={appointmentTypes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
