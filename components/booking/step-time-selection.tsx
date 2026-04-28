'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parse, addMinutes, isBefore } from 'date-fns'
import { Loader2 } from 'lucide-react'
import type { Availability } from '@/lib/types/database'

interface StepTimeSelectionProps {
  doctorId: string
  availability: Availability[]
  selectedDate: string
  duration: number
  selectedTime: string | null
  onSelect: (time: string) => void
}

export function StepTimeSelection({
  doctorId,
  availability,
  selectedDate,
  duration,
  selectedTime,
  onSelect,
}: StepTimeSelectionProps) {
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBookedSlots = async () => {
      setIsLoading(true)
      const supabase = createClient()
      
      const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('doctor_id', doctorId)
        .eq('date', selectedDate)
        .in('status', ['confirmed', 'pending_payment'])

      const booked = appointments?.map((a) => a.start_time) || []
      setBookedSlots(booked)
      setIsLoading(false)
    }

    fetchBookedSlots()
  }, [doctorId, selectedDate])

  // Obtener el día de la semana de la fecha seleccionada
  // La DB usa el mismo sistema que JS: 0=Domingo, 1=Lunes, 2=Martes, etc.
  // Parseamos la fecha como local para evitar desfases de timezone
  const [year, month, day] = selectedDate.split('-').map(Number)
  const selectedDateObj = new Date(year, month - 1, day)
  const dayOfWeek = selectedDateObj.getDay()
  
  // Obtener disponibilidad para ese día
  const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek)

  // Generar slots de tiempo
  const generateTimeSlots = () => {
    const slots: string[] = []
    const now = new Date()
    // Usar la fecha parseada correctamente (sin problemas de timezone)
    const isToday = selectedDateObj.toDateString() === now.toDateString()

    dayAvailability.forEach((slot) => {
      const startTime = parse(slot.start_time, 'HH:mm:ss', new Date())
      const endTime = parse(slot.end_time, 'HH:mm:ss', new Date())
      
      let currentSlot = startTime
      
      while (isBefore(addMinutes(currentSlot, duration), addMinutes(endTime, 1))) {
        const slotStr = format(currentSlot, 'HH:mm:ss')
        
        // Si es hoy, solo mostrar slots futuros
        if (isToday) {
          const slotDateTime = new Date(year, month - 1, day)
          const [hours, minutes] = slotStr.split(':')
          slotDateTime.setHours(parseInt(hours), parseInt(minutes))
          
          if (slotDateTime > now) {
            slots.push(slotStr)
          }
        } else {
          slots.push(slotStr)
        }
        
        currentSlot = addMinutes(currentSlot, duration)
      }
    })

    return slots
  }

  const timeSlots = generateTimeSlots()
  const availableSlots = timeSlots.filter((slot) => !bookedSlots.includes(slot))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Horarios disponibles para el{' '}
        {format(selectedDateObj, "d 'de' MMMM", { locale: require('date-fns/locale/es').es })}
      </p>

      {availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {availableSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`rounded-lg border px-4 py-3 text-center transition-colors ${
                selectedTime === slot
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:border-primary hover:bg-primary/5'
              }`}
            >
              {slot.slice(0, 5)}
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground">
          No hay horarios disponibles para esta fecha
        </div>
      )}
    </div>
  )
}
