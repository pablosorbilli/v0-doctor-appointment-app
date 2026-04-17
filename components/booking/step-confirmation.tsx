'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Doctor } from '@/lib/types/database'
import type { BookingData } from './booking-wizard'
import { Calendar, Clock, User, Mail, Phone, FileText, CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { addMinutes, parse } from 'date-fns'

interface StepConfirmationProps {
  doctor: Doctor
  bookingData: BookingData
  consentTemplateId: string | null
}

export function StepConfirmation({
  doctor,
  bookingData,
  consentTemplateId,
}: StepConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fee = bookingData.appointmentType?.fee || doctor.consultation_fee
  const duration = bookingData.appointmentType?.duration || doctor.consultation_duration

  const startTime = bookingData.time ? parse(bookingData.time, 'HH:mm:ss', new Date()) : new Date()
  const endTime = addMinutes(startTime, duration)

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          appointmentTypeId: bookingData.appointmentTypeId,
          date: bookingData.date,
          startTime: bookingData.time,
          endTime: format(endTime, 'HH:mm:ss'),
          patientName: bookingData.patientName,
          patientEmail: bookingData.patientEmail,
          patientPhone: bookingData.patientPhone,
          patientDni: bookingData.patientDni,
          visitReason: bookingData.visitReason,
          consentTemplateId,
          paymentAmount: fee,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el turno')
      }

      // Si hay un link de pago, redirigir
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setIsComplete(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (isComplete) {
    return (
      <div className="space-y-6 py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Turno Reservado</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu turno ha sido creado exitosamente. Recibirás un email de confirmación.
          </p>
        </div>
        <Button onClick={() => router.push(`/dr/${doctor.slug}`)}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Revisa los detalles de tu turno antes de confirmar
      </p>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Resumen del Turno</h3>
        
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {bookingData.date && format(new Date(bookingData.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {bookingData.time?.slice(0, 5)} - {format(endTime, 'HH:mm')} ({duration} min)
            </span>
          </div>

          {bookingData.appointmentType && (
            <div className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{bookingData.appointmentType.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Tus Datos</h3>
        
        <div className="grid gap-3">
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{bookingData.patientName}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{bookingData.patientEmail}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{bookingData.patientPhone}</span>
          </div>

          {bookingData.visitReason && (
            <div className="text-sm">
              <span className="font-medium">Motivo:</span> {bookingData.visitReason}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted p-4">
        <div>
          <div className="text-sm text-muted-foreground">Total a pagar</div>
          <div className="text-2xl font-bold">
            ${(fee / 100).toLocaleString('es-AR')}
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          Mercado Pago
        </Badge>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : fee > 0 ? (
          'Confirmar y Pagar'
        ) : (
          'Confirmar Turno'
        )}
      </Button>
    </div>
  )
}
