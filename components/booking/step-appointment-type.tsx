'use client'

import type { AppointmentType } from '@/lib/types/database'
import { Clock, DollarSign } from 'lucide-react'

interface StepAppointmentTypeProps {
  appointmentTypes: AppointmentType[]
  selectedTypeId: string | null
  onSelect: (type: AppointmentType) => void
}

export function StepAppointmentType({
  appointmentTypes,
  selectedTypeId,
  onSelect,
}: StepAppointmentTypeProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Selecciona el tipo de consulta que necesitas
      </p>
      
      <div className="grid gap-3">
        {appointmentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type)}
            className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 ${
              selectedTypeId === type.id ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <div>
              <div className="font-medium">{type.name}</div>
              {type.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {type.description}
                </div>
              )}
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {type.duration} min
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-semibold">
                <DollarSign className="h-4 w-4" />
                {(type.fee / 100).toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-muted-foreground">ARS</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
