import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function PagosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const thisMonthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const thisMonthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  const lastMonthStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
  const lastMonthEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')

  // Pagos de este mes
  const { data: thisMonthPayments } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', user?.id)
    .gte('date', thisMonthStart)
    .lte('date', thisMonthEnd)
    .eq('payment_status', 'paid')

  // Pagos del mes pasado
  const { data: lastMonthPayments } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', user?.id)
    .gte('date', lastMonthStart)
    .lte('date', lastMonthEnd)
    .eq('payment_status', 'paid')

  // Pagos pendientes
  const { data: pendingPayments } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', user?.id)
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })

  // Últimos pagos recibidos
  const { data: recentPayments } = await supabase
    .from('appointments')
    .select('*, appointment_type:appointment_types(*)')
    .eq('doctor_id', user?.id)
    .eq('payment_status', 'paid')
    .order('updated_at', { ascending: false })
    .limit(10)

  const thisMonthTotal = thisMonthPayments?.reduce((sum, a) => sum + (a.payment_amount || 0), 0) || 0
  const lastMonthTotal = lastMonthPayments?.reduce((sum, a) => sum + (a.payment_amount || 0), 0) || 0
  const pendingTotal = pendingPayments?.reduce((sum, a) => sum + (a.payment_amount || 0), 0) || 0
  
  const growth = lastMonthTotal > 0 
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : 0

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    paid: 'Pagado',
    refunded: 'Reembolsado',
    failed: 'Fallido',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagos</h1>
        <p className="text-muted-foreground">
          Resumen de tus ingresos y pagos recibidos
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                <p className="text-2xl font-bold">
                  ${(thisMonthTotal / 100).toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {thisMonthPayments?.length || 0} pagos
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mes Anterior</p>
                <p className="text-2xl font-bold">
                  ${(lastMonthTotal / 100).toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lastMonthPayments?.length || 0} pagos
                </p>
              </div>
              <div className="rounded-full bg-muted p-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Crecimiento</p>
                <p className={`text-2xl font-bold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth >= 0 ? '+' : ''}{growth}%
                </p>
                <p className="text-xs text-muted-foreground">vs mes anterior</p>
              </div>
              <div className={`rounded-full p-3 ${growth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-5 w-5 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${(pendingTotal / 100).toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pendingPayments?.length || 0} turnos
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Pagos Recibidos</CardTitle>
          <CardDescription>
            Historial de tus pagos más recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments && recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{payment.patient_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.appointment_type?.name || 'Consulta'} ·{' '}
                        {format(new Date(payment.date), "d 'de' MMM", { locale: es })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${((payment.payment_amount || 0) / 100).toLocaleString('es-AR')}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {statusLabels[payment.payment_status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No hay pagos registrados aún
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
