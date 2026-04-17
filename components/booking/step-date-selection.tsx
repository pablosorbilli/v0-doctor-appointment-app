'use client'

import { useState } from 'react'
import { format, addDays, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Availability, AvailabilityException } from '@/lib/types/database'

interface StepDateSelectionProps {
  availability: Availability[]
  exceptions: AvailabilityException[]
  selectedDate: string | null
  onSelect: (date: string) => void
}

export function StepDateSelection({
  availability,
  exceptions,
  selectedDate,
  onSelect,
}: StepDateSelectionProps) {
  const [weekOffset, setWeekOffset] = useState(0)
  const today = startOfDay(new Date())

  // Obtener días disponibles de la semana
  const availableDays = new Set(availability.map((a) => a.day_of_week))

  // Generar las próximas 2 semanas
  const generateDays = () => {
    const days = []
    const startDate = addDays(today, weekOffset * 7)
    
    for (let i = 0; i < 14; i++) {
      const date = addDays(startDate, i)
      const dayOfWeek = date.getDay()
      const dateStr = format(date, 'yyyy-MM-dd')
      
      // Verificar si hay excepción para este día
      const exception = exceptions.find((e) => e.date === dateStr)
      const isException = exception && !exception.is_available
      
      // Verificar si el médico atiende este día de la semana
      const isAvailable = availableDays.has(dayOfWeek) && !isException && date >= today
      
      days.push({
        date,
        dateStr,
        dayOfWeek,
        isAvailable,
        isToday: isSameDay(date, today),
      })
    }
    
    return days
  }

  const days = generateDays()
  const firstWeek = days.slice(0, 7)
  const secondWeek = days.slice(7, 14)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecciona la fecha para tu consulta
      </p>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(addDays(today, weekOffset * 7), "MMMM yyyy", { locale: es })}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 4}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Semana 1 */}
      <div className="grid grid-cols-7 gap-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {firstWeek.map((day) => (
          <DayButton
            key={day.dateStr}
            day={day}
            isSelected={selectedDate === day.dateStr}
            onSelect={() => day.isAvailable && onSelect(day.dateStr)}
          />
        ))}
      </div>

      {/* Semana 2 */}
      <div className="grid grid-cols-7 gap-2">
        {secondWeek.map((day) => (
          <DayButton
            key={day.dateStr}
            day={day}
            isSelected={selectedDate === day.dateStr}
            onSelect={() => day.isAvailable && onSelect(day.dateStr)}
          />
        ))}
      </div>
    </div>
  )
}

interface DayButtonProps {
  day: {
    date: Date
    dateStr: string
    isAvailable: boolean
    isToday: boolean
  }
  isSelected: boolean
  onSelect: () => void
}

function DayButton({ day, isSelected, onSelect }: DayButtonProps) {
  return (
    <button
      onClick={onSelect}
      disabled={!day.isAvailable}
      className={`flex h-12 w-full flex-col items-center justify-center rounded-lg border text-sm transition-colors ${
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : day.isAvailable
            ? 'hover:border-primary hover:bg-primary/5'
            : 'cursor-not-allowed bg-muted/50 text-muted-foreground'
      } ${day.isToday ? 'ring-1 ring-primary ring-offset-1' : ''}`}
    >
      <span className="font-medium">{format(day.date, 'd')}</span>
    </button>
  )
}
