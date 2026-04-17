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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Stethoscope } from 'lucide-react'
import { MEDICAL_SPECIALTIES } from '@/lib/types/database'

export default function RegistroPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repeatPassword: '',
    firstName: '',
    lastName: '',
    specialty: '',
    licenseNumber: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.repeatPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            specialty: formData.specialty,
            license_number: formData.licenseNumber,
          },
        },
      })
      if (error) throw error
      router.push('/auth/registro-exitoso')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

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
              <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
              <CardDescription>
                Registrate para comenzar a gestionar tus turnos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Juan"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Pérez"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="specialty">Especialidad</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => handleChange('specialty', value)}
                      required
                    >
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Selecciona tu especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="licenseNumber">Matrícula Profesional</Label>
                    <Input
                      id="licenseNumber"
                      type="text"
                      placeholder="MN 12345"
                      required
                      value={formData.licenseNumber}
                      onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@email.com"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="repeatPassword">Repetir Contraseña</Label>
                    <Input
                      id="repeatPassword"
                      type="password"
                      required
                      value={formData.repeatPassword}
                      onChange={(e) => handleChange('repeatPassword', e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary underline underline-offset-4"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
