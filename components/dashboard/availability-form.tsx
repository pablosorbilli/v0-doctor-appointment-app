'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Clock } from 'lucide-react'
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
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '18:00' })
  const router = useRouter()

  const addSlot = async (dayIndex: number) => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('[v0] No user found')
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase.from('availability').insert({
      doctor_id: user.id,
      day_of_week: dayIndex,
      start_time: newSlot.startTime + ':00',
      end_time: newSlot.endTime + ':00',
      is_active: true,
    }).select()

    if (error) {
      console.error('[v0] Error adding slot:', error)
      alert('Error al agregar horario: ' + error.message)
    } else {
      console.log('[v0] Slot added successfully:', data)
    }

    router.refresh()
    setIsLoading(false)
    setNewSlot({ startTime: '09:00', endTime: '18:00' })
  }

  const removeSlot = async (slotId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.from('availability').delete().eq('id', slotId)
    router.refresh()
    setIsLoading(false)
  }

  const toggleSlot = async (slotId: string, isActive: boolean) => {
    const supabase = createClient()
    await supabase
      .from('availability')
      .update({ is_active: isActive })
      .eq('id', slotId)
    router.refresh()
  }

  return (
    <div className="space-y-4">
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
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
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
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
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
