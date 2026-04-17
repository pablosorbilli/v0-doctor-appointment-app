'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Plus, CalendarOff } from 'lucide-react'
import type { AvailabilityException } from '@/lib/types/database'

interface ExceptionsFormProps {
  exceptions: AvailabilityException[]
}

export function ExceptionsForm({ exceptions }: ExceptionsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newException, setNewException] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
  })
  const router = useRouter()

  const addException = async () => {
    if (!newException.date) return
    
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('availability_exceptions').insert({
      doctor_id: user?.id,
      date: newException.date,
      is_available: false,
      reason: newException.reason || null,
    })

    router.refresh()
    setIsLoading(false)
    setNewException({ date: '', reason: '' })
  }

  const removeException = async (exceptionId: string) => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.from('availability_exceptions').delete().eq('id', exceptionId)
    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Existing Exceptions */}
      {exceptions.length > 0 ? (
        <div className="space-y-2">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <CalendarOff className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {format(new Date(exception.date), "EEEE, d 'de' MMMM", { locale: es })}
                  </div>
                  {exception.reason && (
                    <div className="text-sm text-muted-foreground">{exception.reason}</div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeException(exception.id)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No tienes excepciones configuradas
        </p>
      )}

      {/* Add New Exception */}
      <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="exception-date">Fecha</Label>
          <Input
            id="exception-date"
            type="date"
            value={newException.date}
            onChange={(e) => setNewException({ ...newException, date: e.target.value })}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="exception-reason">Motivo (opcional)</Label>
          <Input
            id="exception-reason"
            type="text"
            placeholder="Ej: Vacaciones, Congreso..."
            value={newException.reason}
            onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
          />
        </div>
        <Button onClick={addException} disabled={isLoading || !newException.date}>
          <Plus className="mr-1 h-4 w-4" />
          Agregar
        </Button>
      </div>
    </div>
  )
}
