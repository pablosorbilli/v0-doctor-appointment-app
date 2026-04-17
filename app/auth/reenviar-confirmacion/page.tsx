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
import { useState } from 'react'
import { Stethoscope, Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Si el usuario ya esta confirmado, el error sera diferente
        if (error.message.includes('already confirmed') || error.message.includes('User already registered')) {
          setStatus('success')
          setMessage('Tu email ya esta confirmado. Podes iniciar sesion directamente.')
        } else {
          throw error
        }
      } else {
        setStatus('success')
        setMessage('Te enviamos un nuevo email de confirmacion. Revisalo en tu bandeja de entrada (y en spam).')
      }
    } catch (error: unknown) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error al reenviar el email')
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Reenviar Confirmacion</CardTitle>
              <CardDescription>
                Ingresa tu email para recibir un nuevo enlace de confirmacion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === 'success' ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">{message}</p>
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Ir a Iniciar Sesion</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResend}>
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
                        disabled={status === 'loading'}
                      />
                    </div>

                    {status === 'error' && (
                      <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {message}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={status === 'loading'}>
                      {status === 'loading' ? 'Enviando...' : 'Reenviar Email'}
                    </Button>
                  </div>

                  <div className="mt-4 text-center text-sm">
                    <Link
                      href="/auth/login"
                      className="text-primary underline underline-offset-4"
                    >
                      Volver a Iniciar Sesion
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
