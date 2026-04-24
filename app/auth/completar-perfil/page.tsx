"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Stethoscope } from "lucide-react"

function generateSlug(firstName: string, lastName: string): string {
  const cleanName = `dr-${firstName}-${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return cleanName
}

export default function CompletarPerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialty: "",
    licenseNumber: "",
    phone: "",
    address: "",
    bio: "",
    consultationFee: "5000",
    consultationDuration: "30",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const slug = generateSlug(formData.firstName, formData.lastName)

      const { error: insertError } = await supabase
        .from("doctors")
        .insert({
          id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          specialty: formData.specialty,
          license_number: formData.licenseNumber,
          slug: slug,
          consultation_fee: parseInt(formData.consultationFee),
          consultation_duration: parseInt(formData.consultationDuration),
          phone: formData.phone || null,
          email: user.email!,
          address: formData.address || null,
          bio: formData.bio || null,
        })

      if (insertError) {
        if (insertError.code === "23505") {
          setError("Ya existe un perfil con estos datos. Por favor, intenta con otros valores.")
        } else {
          setError(insertError.message)
        }
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor, intenta nuevamente.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Completa tu perfil profesional</CardTitle>
          <CardDescription>
            Necesitamos algunos datos para configurar tu consultorio virtual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad *</Label>
                <Input
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                  placeholder="Cardiología"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Matrícula Profesional *</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="MP-12345"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección del consultorio</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Valor de consulta (ARS) *</Label>
                <Input
                  id="consultationFee"
                  name="consultationFee"
                  type="number"
                  min="0"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  required
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationDuration">Duración de consulta (min) *</Label>
                <Input
                  id="consultationDuration"
                  name="consultationDuration"
                  type="number"
                  min="15"
                  max="120"
                  value={formData.consultationDuration}
                  onChange={handleChange}
                  required
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía profesional</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Cuéntanos sobre tu experiencia y especialización..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Completar perfil y continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
