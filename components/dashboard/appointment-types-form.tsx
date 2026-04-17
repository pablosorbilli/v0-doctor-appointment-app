'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Clock, DollarSign } from 'lucide-react'
import type { AppointmentType } from '@/lib/types/database'

interface AppointmentTypesFormProps {
  appointmentTypes: AppointmentType[]
}

const defaultTypes = [
  { name: 'Primera Consulta', description: 'Consulta inicial con el paciente', duration: 45, fee: 5000 },
  { name: 'Control', description: 'Seguimiento y control de tratamiento', duration: 20, fee: 3000 },
  { name: 'Receta Médica', description: 'Renovación de recetas', duration: 15, fee: 2000 },
]

export function AppointmentTypesForm({ appointmentTypes }: AppointmentTypesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<AppointmentType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    fee: 0,
  })
  const router = useRouter()

  const resetForm = () => {
    setFormData({ name: '', description: '', duration: 30, fee: 0 })
    setEditingType(null)
  }

  const openEditDialog = (type: AppointmentType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
      duration: type.duration,
      fee: type.fee / 100,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const typeData = {
      name: formData.name,
      description: formData.description || null,
      duration: formData.duration,
      fee: Math.round(formData.fee * 100),
    }

    if (editingType) {
      await supabase
        .from('appointment_types')
        .update(typeData)
        .eq('id', editingType.id)
    } else {
      await supabase.from('appointment_types').insert({
        ...typeData,
        doctor_id: user?.id,
        sort_order: appointmentTypes.length,
      })
    }

    router.refresh()
    setDialogOpen(false)
    resetForm()
    setIsLoading(false)
  }

  const toggleActive = async (typeId: string, isActive: boolean) => {
    const supabase = createClient()
    await supabase
      .from('appointment_types')
      .update({ is_active: isActive })
      .eq('id', typeId)
    router.refresh()
  }

  const deleteType = async (typeId: string) => {
    const supabase = createClient()
    await supabase.from('appointment_types').delete().eq('id', typeId)
    router.refresh()
  }

  const addDefaultTypes = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('appointment_types').insert(
      defaultTypes.map((type, index) => ({
        ...type,
        fee: type.fee * 100,
        doctor_id: user?.id,
        sort_order: appointmentTypes.length + index,
      }))
    )

    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {appointmentTypes.length > 0 ? (
        <div className="space-y-3">
          {appointmentTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Switch
                  checked={type.is_active}
                  onCheckedChange={(checked) => toggleActive(type.id, checked)}
                />
                <div className={!type.is_active ? 'opacity-50' : ''}>
                  <div className="font-medium">{type.name}</div>
                  {type.description && (
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  )}
                  <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {type.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${(type.fee / 100).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(type)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteType(type.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="mb-4 text-muted-foreground">No tienes tipos de consulta configurados</p>
          <Button variant="outline" onClick={addDefaultTypes} disabled={isLoading}>
            Agregar tipos por defecto
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Tipo de Consulta
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Editar Tipo de Consulta' : 'Nuevo Tipo de Consulta'}
            </DialogTitle>
            <DialogDescription>
              Define el nombre, duración y precio de este tipo de consulta
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Primera Consulta"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción del tipo de consulta"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  step={5}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fee">Precio (ARS)</Label>
                <Input
                  id="fee"
                  type="number"
                  min={0}
                  step={100}
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name}>
              {editingType ? 'Guardar Cambios' : 'Crear Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
