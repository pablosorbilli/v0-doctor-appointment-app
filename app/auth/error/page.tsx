import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, Stethoscope } from 'lucide-react'

interface AuthErrorPageProps {
  searchParams: Promise<{ message?: string; error_code?: string }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const errorCode = params.error_code
  const isExpiredLink = params.message?.includes('expired') || errorCode === 'otp_expired'
  
  const errorMessage = isExpiredLink
    ? 'El enlace de confirmacion ha expirado. Los enlaces son validos por 1 hora.'
    : params.message || 'El enlace de confirmacion puede haber expirado o ya fue utilizado.'
  
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Error de Autenticacion</CardTitle>
              <CardDescription>
                Hubo un problema al verificar tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-6 text-sm text-muted-foreground">
                {errorMessage}
              </p>
              <p className="mb-6 text-sm text-muted-foreground">
                Por favor, intenta iniciar sesion o solicita un nuevo enlace de confirmacion.
              </p>

              <div className="flex flex-col gap-3">
                {isExpiredLink && (
                  <Button asChild className="w-full">
                    <Link href="/auth/reenviar-confirmacion">
                      Reenviar Email de Confirmacion
                    </Link>
                  </Button>
                )}
                <Button asChild variant={isExpiredLink ? "outline" : "default"} className="w-full">
                  <Link href="/auth/login">
                    Ir a Iniciar Sesion
                  </Link>
                </Button>
                {!isExpiredLink && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/registro">
                      Crear Nueva Cuenta
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
