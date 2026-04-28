import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ReportsFilters } from '@/components/dashboard/reports-filters'
import { ReportsExport } from '@/components/dashboard/reports-export'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    desde?: string
    hasta?: string
    estado?: string
  }>
}

export default async function ReportesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date()
  const defaultStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const defaultEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  
  const desde = params.desde || defaultStart
  const hasta = params.hasta || defaultEnd
  const estado = params.estado || 'todos'

  // Query base
  let query = supabase
    .from('appointments')
    .select('*, appointment_type:appointment_types(*)')
    .eq('doctor_id', user?.id)
    .gte('date', desde)
    .lte('date', hasta)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })

  // Filtro por estado
  if (estado !== 'todos') {
    query = query.eq('status', estado)
  }

  const { data: appointments } = await query

  // Estadisticas
  const totalTurnos = appointments?.length || 0
  const turnosCompletados = appointments?.filter(a => a.status === 'completed').length || 0
  const turnosCancelados = appointments?.filter(a => a.status === 'cancelled').length || 0
  const turnosPendientes = appointments?.filter(a => a.status === 'pending_payment').length || 0
  
  const ingresosTotales = appointments
    ?.filter(a => a.payment_status === 'paid')
    .reduce((sum, a) => sum + (a.payment_amount || 0), 0) || 0

  // Pacientes unicos
  const pacientesUnicos = new Set(appointments?.map(a => a.patient_email.toLowerCase())).size

  // Mes anterior para comparacion
  const prevMonthStart = format(startOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
  const prevMonthEnd = format(endOfMonth(subMonths(today, 1)), 'yyyy-MM-dd')
  
  const { count: prevMonthCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user?.id)
    .gte('date', prevMonthStart)
    .lte('date', prevMonthEnd)
    .in('status', ['confirmed', 'completed'])

  const crecimiento = prevMonthCount && prevMonthCount > 0 
    ? Math.round(((totalTurnos - prevMonthCount) / prevMonthCount) * 100)
    : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>
      case 'completed':
        return <Badge className="bg-green-500">Completado</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      case 'pending_payment':
        return <Badge variant="outline">Pendiente Pago</Badge>
      case 'no_show':
        return <Badge variant="secondary">No Asistio</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700">Pagado</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-orange-600">Pendiente</Badge>
      case 'refunded':
        return <Badge variant="secondary">Reembolsado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes e Historial</h1>
          <p className="text-muted-foreground">
            Analisis completo de turnos y pacientes
          </p>
        </div>
        <ReportsExport appointments={appointments || []} desde={desde} hasta={hasta} />
      </div>

      {/* Filtros */}
      <ReportsFilters desde={desde} hasta={hasta} estado={estado} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Turnos</p>
                <p className="text-2xl font-bold">{totalTurnos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{turnosCompletados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes</p>
                <p className="text-2xl font-bold">{pacientesUnicos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold">${(ingresosTotales / 100).toLocaleString('es-AR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${crecimiento >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-5 w-5 ${crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">vs Mes Anterior</p>
                <p className={`text-2xl font-bold ${crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {crecimiento >= 0 ? '+' : ''}{crecimiento}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen por estado */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pendientes de Pago</p>
              <p className="text-2xl font-bold">{turnosPendientes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Completados</p>
              <p className="text-2xl font-bold">
                {totalTurnos > 0 ? Math.round((turnosCompletados / totalTurnos) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="flex items-center gap-4 p-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Cancelaciones</p>
              <p className="text-2xl font-bold">{turnosCancelados}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Detallado</CardTitle>
          <CardDescription>
            {totalTurnos} turnos encontrados del {format(new Date(desde), "d 'de' MMMM", { locale: es })} al {format(new Date(hasta), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Horario</th>
                    <th className="pb-3 font-medium">Paciente</th>
                    <th className="pb-3 font-medium">Contacto</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Pago</th>
                    <th className="pb-3 text-right font-medium">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="text-sm">
                      <td className="py-3">
                        <div className="font-medium">
                          {format(new Date(appointment.date), "d MMM yyyy", { locale: es })}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-mono text-muted-foreground">
                          {appointment.start_time.slice(0, 5)}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium">{appointment.patient_name}</div>
                        {appointment.patient_dni && (
                          <div className="text-xs text-muted-foreground">DNI: {appointment.patient_dni}</div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="text-muted-foreground">{appointment.patient_email}</div>
                        {appointment.patient_phone && (
                          <div className="text-xs text-muted-foreground">{appointment.patient_phone}</div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="text-muted-foreground">
                          {appointment.appointment_type?.name || 'Consulta'}
                        </div>
                      </td>
                      <td className="py-3">{getStatusBadge(appointment.status)}</td>
                      <td className="py-3">{getPaymentBadge(appointment.payment_status || 'pending')}</td>
                      <td className="py-3 text-right font-medium">
                        {appointment.payment_amount 
                          ? `$${(appointment.payment_amount / 100).toLocaleString('es-AR')}`
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron turnos en el periodo seleccionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
