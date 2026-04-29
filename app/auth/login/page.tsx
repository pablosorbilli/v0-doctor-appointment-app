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
import { useState } from 'react'
import { Stethoscope } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos. Por favor, verifica tus datos.')
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Tu email aun no ha sido confirmado. Revisa tu bandeja de entrada.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
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
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </div>
                <div className="mt-4 space-y-2 text-center text-sm">
                  <div>
                    <Link
                      href="/auth/recuperar-password"
                      className="text-primary underline underline-offset-4"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div>
                    ¿No tienes cuenta?{' '}
                    <Link
                      href="/auth/registro"
                      className="text-primary underline underline-offset-4"
                    >
                      Registrate
                    </Link>
                  </div>
                  <div className="text-muted-foreground">
                    ¿No recibiste el email de confirmacion?{' '}
                    <Link
                      href="/auth/reenviar-confirmacion"
                      className="text-primary underline underline-offset-4"
                    >
                      Reenviar
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
