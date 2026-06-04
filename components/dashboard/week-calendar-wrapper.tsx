'use client'

import { useState } from 'react'
import { WeekCalendar } from './week-calendar'
import { AppointmentActions } from './appointment-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
  id: string
  patient_name: string
  patient_email: string
  patient_phone?: string | null
  patient_dni?: string | null
  date: string
  start_time: string
  end_time: string
  status: string
  visit_reason?: string | null
  notes?: string | null
  payment_amount?: number | null
  appointment_type?: {
    name: string
  } | null
}

interface WeekCalendarWrapperProps {
  appointments: Appointment[]
  weekStart: Date
}

const statusLabels: Record<string, string> = {
  pending_payment: 'Pendiente de Pago',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  no_show: 'No se presento',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending_payment: 'outline',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'secondary',
  no_show: 'destructive',
}

export function WeekCalendarWrapper({ appointments, weekStart }: WeekCalendarWrapperProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  return (
    <>
      <WeekCalendar
        appointments={appointments}
        weekStart={weekStart}
        onAppointmentClick={(apt) => setSelectedAppointment(apt as Appointment)}
      />

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-xl">{selectedAppointment.patient_name}</DialogTitle>
                  <Badge variant={statusVariants[selectedAppointment.status]}>
                    {statusLabels[selectedAppointment.status]}
                  </Badge>
                </div>
                <DialogDescription>
                  {selectedAppointment.appointment_type?.name || 'Consulta General'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Fecha y hora */}
                <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {format(new Date(selectedAppointment.date), "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedAppointment.start_time.slice(0, 5)} - {selectedAppointment.end_time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Contacto</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedAppointment.patient_email}`} className="hover:underline">
                        {selectedAppointment.patient_email}
                      </a>
                    </div>
                    {selectedAppointment.patient_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedAppointment.patient_phone}`} className="hover:underline">
                          {selectedAppointment.patient_phone}
                        </a>
                      </div>
                    )}
                    {selectedAppointment.patient_dni && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>DNI: {selectedAppointment.patient_dni}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo de consulta */}
                {selectedAppointment.visit_reason && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Motivo de consulta</h4>
                    <p className="text-sm">{selectedAppointment.visit_reason}</p>
                  </div>
                )}

                {/* Notas */}
                {selectedAppointment.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Notas del paciente</h4>
                    <p className="text-sm italic text-muted-foreground">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Pago */}
                {selectedAppointment.payment_amount && selectedAppointment.payment_amount > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Pago</h4>
                    <p className="text-sm font-semibold">
                      ${(selectedAppointment.payment_amount / 100).toLocaleString('es-AR')}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex justify-end pt-2 border-t">
                  <AppointmentActions appointment={selectedAppointment} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
