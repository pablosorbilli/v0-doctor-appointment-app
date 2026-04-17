'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Doctor } from '@/lib/types/database'
import { MEDICAL_SPECIALTIES } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
  doctor: Doctor
}

export function ProfileForm({ doctor }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: doctor.first_name,
    last_name: doctor.last_name,
    specialty: doctor.specialty,
    license_number: doctor.license_number,
    phone: doctor.phone || '',
    address: doctor.address || '',
    bio: doctor.bio || '',
    consultation_fee: doctor.consultation_fee / 100,
    consultation_duration: doctor.consultation_duration,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()

    await supabase
      .from('doctors')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        specialty: formData.specialty,
        license_number: formData.license_number,
        phone: formData.phone || null,
        address: formData.address || null,
        bio: formData.bio || null,
        consultation_fee: Math.round(formData.consultation_fee * 100),
        consultation_duration: formData.consultation_duration,
      })
      .eq('id', doctor.id)

    router.refresh()
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="specialty">Especialidad</Label>
          <Select
            value={formData.specialty}
            onValueChange={(value) => setFormData({ ...formData, specialty: value })}
          >
            <SelectTrigger id="specialty">
              <SelectValue />
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
          <Label htmlFor="license_number">Matrícula</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Dirección del Consultorio</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Av. Corrientes 1234, CABA"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Breve descripción sobre ti y tu práctica médica..."
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="consultation_fee">Seña de la Sesion (ARS)</Label>
          <p className="text-xs text-muted-foreground">La seña corresponde al 30% del valor total de la consulta</p>
          <Input
            id="consultation_fee"
            type="number"
            min={0}
            step={100}
            value={formData.consultation_fee}
            onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="consultation_duration">Duración por defecto (min)</Label>
          <Input
            id="consultation_duration"
            type="number"
            min={5}
            step={5}
            value={formData.consultation_duration}
            onChange={(e) => setFormData({ ...formData, consultation_duration: parseInt(e.target.value) || 30 })}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar Cambios
      </Button>
    </form>
  )
}
