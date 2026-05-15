'use client'

import { useState } from 'react'
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
import type { BookingData } from './booking-wizard'

interface StepPatientInfoProps {
  bookingData: BookingData
  onSubmit: (data: Partial<BookingData>) => void
}

const VISIT_REASONS = [
  'Primera consulta',
  'Control de rutina',
  'Seguimiento de tratamiento',
  'Renovación de recetas',
  'Segunda opinión',
  'Urgencia leve',
  'Otro',
]

export function StepPatientInfo({ bookingData, onSubmit }: StepPatientInfoProps) {
  const [formData, setFormData] = useState({
    patientName: bookingData.patientName,
    patientEmail: bookingData.patientEmail,
    patientPhone: bookingData.patientPhone,
    patientDni: bookingData.patientDni,
    visitReason: bookingData.visitReason,
    patientNotes: bookingData.patientNotes || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'El nombre es requerido'
    }
    
    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Email inválido'
    }
    
    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'El teléfono es requerido'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Completa tus datos para reservar el turno
      </p>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="patientName">Nombre Completo *</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            placeholder="Juan Pérez"
          />
          {errors.patientName && (
            <p className="text-xs text-destructive">{errors.patientName}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="patientEmail">Email *</Label>
          <Input
            id="patientEmail"
            type="email"
            value={formData.patientEmail}
            onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
            placeholder="juan@email.com"
          />
          {errors.patientEmail && (
            <p className="text-xs text-destructive">{errors.patientEmail}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="patientPhone">Teléfono *</Label>
            <Input
              id="patientPhone"
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
              placeholder="+54 11 1234-5678"
            />
            {errors.patientPhone && (
              <p className="text-xs text-destructive">{errors.patientPhone}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="patientDni">DNI (opcional)</Label>
            <Input
              id="patientDni"
              value={formData.patientDni}
              onChange={(e) => setFormData({ ...formData, patientDni: e.target.value })}
              placeholder="12.345.678"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="visitReason">Motivo de la Consulta</Label>
          <Select
            value={formData.visitReason}
            onValueChange={(value) => setFormData({ ...formData, visitReason: value })}
          >
            <SelectTrigger id="visitReason">
              <SelectValue placeholder="Selecciona el motivo" />
            </SelectTrigger>
            <SelectContent>
              {VISIT_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="patientNotes">Notas adicionales (opcional)</Label>
          <Textarea
            id="patientNotes"
            value={formData.patientNotes}
            onChange={(e) => {
              if (e.target.value.length <= 150) {
                setFormData({ ...formData, patientNotes: e.target.value })
              }
            }}
            placeholder="Agrega cualquier aclaracion que quieras que el medico sepa antes de la consulta..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {formData.patientNotes.length}/150 caracteres
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Continuar
      </Button>
    </form>
  )
}
