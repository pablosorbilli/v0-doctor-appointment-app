import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, CreditCard, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')

  // Turnos de hoy
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('*, appointment_type:appointment_types(*)')
    .eq('doctor_id', user?.id)
    .eq('date', todayStr)
    .in('status', ['confirmed', 'completed'])
    .order('start_time')

  // Turnos esta semana
  const { count: weekCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user?.id)
    .gte('date', weekStart)
    .lte('date', weekEnd)
    .in('status', ['confirmed', 'completed'])

  // Turnos pendientes de pago
  const { count: pendingCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user?.id)
    .eq('status', 'pending_payment')

  // Ingresos del mes
  const { data: monthPayments } = await supabase
    .from('appointments')
    .select('payment_amount')
    .eq('doctor_id', user?.id)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .eq('payment_status', 'paid')

  const monthlyIncome = monthPayments?.reduce((sum, a) => sum + (a.payment_amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground">
          {format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Turnos Hoy"
          value={todayAppointments?.length || 0}
          icon={Calendar}
          description="confirmados"
        />
        <StatCard
          title="Esta Semana"
          value={weekCount || 0}
          icon={Clock}
          description="turnos"
        />
        <StatCard
          title="Pendientes de Pago"
          value={pendingCount || 0}
          icon={Users}
          description="turnos"
          variant={pendingCount && pendingCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${(monthlyIncome / 100).toLocaleString('es-AR')}`}
          icon={CreditCard}
          description="cobrados"
        />
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Turnos de Hoy</CardTitle>
            <CardDescription>
              {todayAppointments?.length || 0} turnos programados
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/turnos">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {todayAppointments && todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {appointment.start_time.slice(0, 5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.end_time.slice(0, 5)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{appointment.patient_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.appointment_type?.name || 'Consulta'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={appointment.status === 'completed' ? 'secondary' : 'default'}>
                    {appointment.status === 'confirmed' ? 'Confirmado' : 'Completado'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No tienes turnos programados para hoy
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'default',
}: {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  description: string
  variant?: 'default' | 'warning'
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${variant === 'warning' ? 'text-orange-600' : ''}`}>
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`rounded-full p-3 ${variant === 'warning' ? 'bg-orange-100' : 'bg-primary/10'}`}>
            <Icon className={`h-5 w-5 ${variant === 'warning' ? 'text-orange-600' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
