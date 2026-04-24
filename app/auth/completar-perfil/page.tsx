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
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Stethoscope } from 'lucide-react'

export default function CompletarPerfilPage() {
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUserEmail(user.email || null)
      
      // Check if doctor profile already exists
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (doctor) {
        router.push('/dashboard')
      }
    }
    
    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No hay sesion activa')
      }

      const { error: insertError } = await supabase
        .from('doctors')
        .insert({
          id: user.id,
          email: user.email,
          name,
          specialty,
          phone,
        })

      if (insertError) throw insertError
      
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el perfil')
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
              <CardTitle className="text-2xl">Completar Perfil</CardTitle>
              <CardDescription>
                Ingresa tus datos para comenzar a usar MediTurnos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  {userEmail && (
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={userEmail}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dr. Juan Perez"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="specialty">Especialidad</Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder="Medicina General"
                      required
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+54 11 1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Comenzar'}
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
