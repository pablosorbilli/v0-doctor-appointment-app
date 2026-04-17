'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Appointment } from '@/lib/types/database'
import { MoreHorizontal, Check, X, UserX } from 'lucide-react'

interface AppointmentActionsProps {
  appointment: Appointment
}

export function AppointmentActions({ appointment }: AppointmentActionsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (status: string) => {
    setIsLoading(true)
    const supabase = createClient()
    
    await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointment.id)
    
    router.refresh()
    setIsLoading(false)
  }

  const handleCancel = async () => {
    await updateStatus('cancelled')
    setShowCancelDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {appointment.status === 'confirmed' && (
            <>
              <DropdownMenuItem onClick={() => updateStatus('completed')}>
                <Check className="mr-2 h-4 w-4" />
                Marcar como completado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('no_show')}>
                <UserX className="mr-2 h-4 w-4" />
                No se presentó
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {(appointment.status === 'pending_payment' || appointment.status === 'confirmed') && (
            <DropdownMenuItem
              onClick={() => setShowCancelDialog(true)}
              className="text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar turno
            </DropdownMenuItem>
          )}
          {appointment.status === 'cancelled' && (
            <DropdownMenuItem onClick={() => updateStatus('confirmed')}>
              <Check className="mr-2 h-4 w-4" />
              Reactivar turno
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará el turno de {appointment.patient_name}.
              El paciente recibirá una notificación por email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground">
              Sí, cancelar turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
