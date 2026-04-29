'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Stethoscope, CheckCircle, AlertCircle } from 'lucide-react'

export default function NuevaPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
    }
    checkSession()
  }, [])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
      if (error) throw error
      setSuccess(true)
      // Redirigir al dashboard despues de 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la contraseña'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
        <div className="text-muted-foreground">Verificando sesion...</div>
      </div>
    )
  }

  // Invalid session - show error
  if (!isValidSession) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
        <div className="w-full max-w-sm">
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
                <CardTitle className="text-2xl">Enlace Invalido</CardTitle>
                <CardDescription>
                  El enlace ha expirado o es invalido
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-sm text-muted-foreground">
                  Por favor, solicita un nuevo enlace de recuperacion de contraseña.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/recuperar-password">
                    Solicitar Nuevo Enlace
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
        <div className="w-full max-w-sm">
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
                <CardTitle className="text-2xl">Contraseña Actualizada</CardTitle>
                <CardDescription>
                  Tu contraseña ha sido cambiada exitosamente
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-sm text-muted-foreground">
                  Redirigiendo al dashboard...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Stethoscope className="h-8 w-8" />
            <span className="text-2xl font-bold">MediTurnos</span>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Nueva Contraseña</CardTitle>
              <CardDescription>
                Ingresa tu nueva contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
