import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Stethoscope, Mail } from 'lucide-react'

export default function RegistroExitosoPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Stethoscope className="h-8 w-8" />
            <span className="text-2xl font-bold">MediTurnos</span>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Registro Exitoso</CardTitle>
              <CardDescription>
                Tu cuenta ha sido creada correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-muted p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Te enviamos un email de confirmación. Por favor, revisa tu bandeja de entrada.
                </p>
              </div>
              
              <p className="mb-6 text-sm text-muted-foreground">
                Una vez que confirmes tu email, podrás acceder a tu panel de administración
                y comenzar a configurar tu agenda de turnos.
              </p>

              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Ir a Iniciar Sesión
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
