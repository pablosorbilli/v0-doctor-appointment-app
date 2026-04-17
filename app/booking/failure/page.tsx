import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { XCircle, Stethoscope, RefreshCw } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ appointment_id?: string }>
}

export default async function BookingFailurePage({ searchParams }: PageProps) {
  const params = await searchParams
  const appointmentId = params.appointment_id

  let doctorSlug = ''

  if (appointmentId) {
    const supabase = await createClient()
    const { data: appointment } = await supabase
      .from('appointments')
      .select('doctor:doctors(slug)')
      .eq('id', appointmentId)
      .single()

    doctorSlug = appointment?.doctor?.slug || ''
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Pago No Procesado</CardTitle>
            <CardDescription>
              Hubo un problema al procesar tu pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm">
              <p className="text-red-800">
                El pago fue rechazado o cancelado. Tu turno no ha sido confirmado.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Puedes intentar nuevamente con otro método de pago o contactar 
              a tu banco si el problema persiste.
            </p>

            <div className="flex flex-col gap-3">
              {doctorSlug && (
                <Button asChild>
                  <Link href={`/dr/${doctorSlug}`}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Intentar Nuevamente
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/">
                  Volver al Inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
