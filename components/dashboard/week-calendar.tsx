'use client'

import { useMemo } from 'react'
import { format, startOfWeek, addDays, isToday, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  patient_name: string
  date: string
  start_time: string
  end_time: string
  status: string
  visit_reason?: string
  appointment_type?: {
    name: string
  } | null
}

interface WeekCalendarProps {
  appointments: Appointment[]
  weekStart: Date
  onAppointmentClick?: (appointment: Appointment) => void
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

const DAY_NAMES = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM']

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getAppointmentPosition(startTime: string, endTime: string) {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  const startHour = 7 // Calendar starts at 7 AM
  const top = ((startMinutes - startHour * 60) / 60) * 64 // 64px per hour
  const height = ((endMinutes - startMinutes) / 60) * 64
  return { top, height: Math.max(height, 24) } // Minimum 24px height
}

export function WeekCalendar({ appointments, weekStart, onAppointmentClick }: WeekCalendarProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      map.set(dateStr, appointments.filter(a => a.date === dateStr))
    })
    return map
  }, [appointments, days])

  const currentTimePosition = useMemo(() => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    if (hours < 7 || hours >= 21) return null
    return ((hours - 7) * 60 + minutes) / 60 * 64
  }, [])

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-background">
      {/* Header with days */}
      <div className="flex border-b">
        <div className="w-16 shrink-0 border-r bg-muted/30 p-2 text-center text-xs font-medium text-muted-foreground">
          GMT-03
        </div>
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 border-r p-2 text-center last:border-r-0",
              isToday(day) && "bg-primary/5"
            )}
          >
            <div className="text-xs font-medium text-muted-foreground">
              {DAY_NAMES[i]}
            </div>
            <div
              className={cn(
                "mx-auto mt-1 flex h-10 w-10 items-center justify-center text-xl font-semibold",
                isToday(day) && "rounded-full bg-primary text-primary-foreground"
              )}
            >
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Hours column */}
        <div className="w-16 shrink-0 border-r bg-muted/30">
          {HOURS.map(hour => (
            <div
              key={hour}
              className="relative h-16 border-b text-right pr-2 text-xs text-muted-foreground"
            >
              <span className="absolute -top-2 right-2">
                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
            </div>
          ))}
        </div>

        {/* Days columns */}
        {days.map((day, dayIndex) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayAppointments = appointmentsByDay.get(dateStr) || []

          return (
            <div
              key={dayIndex}
              className={cn(
                "relative flex-1 border-r last:border-r-0",
                isToday(day) && "bg-primary/5"
              )}
            >
              {/* Hour lines */}
              {HOURS.map(hour => (
                <div key={hour} className="h-16 border-b border-dashed" />
              ))}

              {/* Current time indicator */}
              {isToday(day) && currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: currentTimePosition }}
                >
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-0.5 flex-1 bg-red-500" />
                </div>
              )}

              {/* Appointments */}
              {dayAppointments.map(appointment => {
                const { top, height } = getAppointmentPosition(
                  appointment.start_time,
                  appointment.end_time
                )
                const statusColors: Record<string, string> = {
                  confirmed: 'bg-sky-500 hover:bg-sky-600',
                  completed: 'bg-emerald-500 hover:bg-emerald-600',
                  pending_payment: 'bg-amber-500 hover:bg-amber-600',
                  cancelled: 'bg-red-400 hover:bg-red-500 opacity-60',
                  no_show: 'bg-gray-400 hover:bg-gray-500',
                }

                return (
                  <button
                    key={appointment.id}
                    onClick={() => onAppointmentClick?.(appointment)}
                    className={cn(
                      "absolute left-0.5 right-0.5 z-10 overflow-hidden rounded px-1.5 py-0.5 text-left text-xs text-white transition-colors",
                      statusColors[appointment.status] || 'bg-sky-500'
                    )}
                    style={{ top, height }}
                  >
                    <div className="truncate font-medium">
                      {appointment.patient_name}
                    </div>
                    {height > 32 && (
                      <div className="truncate opacity-90">
                        {appointment.start_time.slice(0, 5)} - {appointment.end_time.slice(0, 5)}
                      </div>
                    )}
                    {height > 48 && appointment.appointment_type?.name && (
                      <div className="truncate opacity-80">
                        {appointment.appointment_type.name}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 border-t bg-muted/30 px-4 py-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-sky-500" />
          <span>Confirmado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-500" />
          <span>Pend. Pago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-400 opacity-60" />
          <span>Cancelado</span>
        </div>
      </div>
    </div>
  )
}
