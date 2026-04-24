'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Clock, Check } from 'lucide-react'
import type { Availability } from '@/lib/types/database'

interface DayAvailability {
  dayIndex: number
  dayName: string
  slots: Availability[]
}

interface AvailabilityFormProps {
  availabilityByDay: DayAvailability[]
}

export function AvailabilityForm({ availabilityByDay }: AvailabilityFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  // Estado separado por día para evitar conflictos
  const [newSlots, setNewSlots] = useState<Record<number, { startTime: string; endTime: string }>>(
    Object.fromEntries(availabilityByDay.map(d => [d.dayIndex, { startTime: '09:00', endTime: '18:00' }]))
  )
  const router = useRouter()
  
  const showSavedMessage = (message: string) => {
    setSavedMessage(message)
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const getNewSlot = (dayIndex: number) => newSlots[dayIndex] || { startTime: '09:00', endTime: '18:00' }
  
  const setNewSlot = (dayIndex: number, slot: { startTime: string; endTime: string }) => {
    setNewSlots(prev => ({ ...prev, [dayIndex]: slot }))
  }

  const addSlot = async (dayIndex: number) => {
    const slotToAdd = getNewSlot(dayIndex)
    
    // Validar que el horario no esté duplicado
    const existingSlots = availabilityByDay.find(d => d.dayIndex === dayIndex)?.slots || []
    const isDuplicate = existingSlots.some(
      s => s.start_time.slice(0, 5) === slotToAdd.startTime
    )
    
    if (isDuplicate) {
      alert('Ya existe un horario que comienza a las ' + slotToAdd.startTime + ' para este día. Por favor, elige otro horario de inicio.')
      return
    }
    
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from('availability').insert({
      doctor_id: user.id,
      day_of_week: dayIndex,
      start_time: slotToAdd.startTime + ':00',
      end_time: slotToAdd.endTime + ':00',
      is_active: true,
    }).select()

    if (error) {
      alert('Error al agregar horario: ' + error.message)
    } else {
      showSavedMessage('Horario agregado correctamente')
    }

    router.refresh()
    setIsLoading(false)
    // Reiniciar con un horario diferente basado en el último agregado
    setNewSlot(dayIndex, { startTime: '14:00', endTime: '18:00' })
  }

  const removeSlot = async (slotId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('availability').delete().eq('id', slotId)
    if (!error) {
      showSavedMessage('Horario eliminado')
    }
    router.refresh()
    setIsLoading(false)
  }

  const toggleSlot = async (slotId: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('availability')
      .update({ is_active: isActive })
      .eq('id', slotId)
    if (!error) {
      showSavedMessage(isActive ? 'Horario activado' : 'Horario desactivado')
    }
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Mensaje de confirmacion */}
      {savedMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">{savedMessage}</span>
        </div>
      )}
      
      {availabilityByDay.map((day) => (
        <div key={day.dayIndex} className="rounded-lg border">
          <button
            type="button"
            onClick={() => setExpandedDay(expandedDay === day.dayIndex ? null : day.dayIndex)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">{day.dayName}</span>
              {day.slots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {day.slots.filter(s => s.is_active).map((slot) => (
                    <Badge key={slot.id} variant="secondary" className="text-xs">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No disponible</span>
              )}
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </button>

          {expandedDay === day.dayIndex && (
            <div className="border-t p-4">
              <div className="space-y-3">
                {day.slots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-4">
                    <Switch
                      checked={slot.is_active}
                      onCheckedChange={(checked) => toggleSlot(slot.id, checked)}
                    />
                    <span className={slot.is_active ? '' : 'text-muted-foreground line-through'}>
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(slot.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-end gap-3 pt-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`start-${day.dayIndex}`} className="text-xs">
                      Desde
                    </Label>
                    <Input
                      id={`start-${day.dayIndex}`}
                      type="time"
                      value={getNewSlot(day.dayIndex).startTime}
                      onChange={(e) => setNewSlot(day.dayIndex, { ...getNewSlot(day.dayIndex), startTime: e.target.value })}
                      className="w-28"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`end-${day.dayIndex}`} className="text-xs">
                      Hasta
                    </Label>
                    <Input
                      id={`end-${day.dayIndex}`}
                      type="time"
                      value={getNewSlot(day.dayIndex).endTime}
                      onChange={(e) => setNewSlot(day.dayIndex, { ...getNewSlot(day.dayIndex), endTime: e.target.value })}
                      className="w-28"
                    />
                  </div>
                  <Button
                    onClick={() => addSlot(day.dayIndex)}
                    disabled={isLoading}
                    size="sm"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
