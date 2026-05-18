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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pencil, Trash2, FileText, Star, Upload } from 'lucide-react'
import type { ConsentTemplate } from '@/lib/types/database'

interface ConsentTemplatesFormProps {
  templates: ConsentTemplate[]
}

const defaultTemplate = `CONSENTIMIENTO INFORMADO

Yo, el/la paciente abajo firmante, declaro que:

1. He sido informado/a de manera clara y comprensible sobre el procedimiento médico a realizar, sus beneficios, riesgos y posibles alternativas.

2. He tenido la oportunidad de hacer todas las preguntas necesarias y las mismas han sido respondidas satisfactoriamente.

3. Comprendo que la medicina no es una ciencia exacta y que no se me han dado garantías sobre los resultados del tratamiento.

4. Autorizo al profesional médico a realizar el procedimiento descrito y cualquier otro procedimiento que pueda ser necesario durante el mismo.

5. Acepto las condiciones del servicio y la política de cancelación de turnos.

Doy mi consentimiento de forma voluntaria, libre de presiones y sin ningún tipo de coacción.`

export function ConsentTemplatesForm({ templates }: ConsentTemplatesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ConsentTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isDefault: false,
  })
  const router = useRouter()

  const resetForm = () => {
    setFormData({ name: '', content: '', isDefault: false })
    setEditingTemplate(null)
  }

  const openEditDialog = (template: ConsentTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      content: template.content || '',
      isDefault: template.is_default,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Si este será el default, quitar default de otros
    if (formData.isDefault) {
      await supabase
        .from('consent_templates')
        .update({ is_default: false })
        .eq('doctor_id', user?.id)
    }

    const templateData = {
      name: formData.name,
      content: formData.content,
      file_type: 'text' as const,
      is_default: formData.isDefault,
    }

    if (editingTemplate) {
      await supabase
        .from('consent_templates')
        .update(templateData)
        .eq('id', editingTemplate.id)
    } else {
      await supabase.from('consent_templates').insert({
        ...templateData,
        doctor_id: user?.id,
      })
    }

    router.refresh()
    setDialogOpen(false)
    resetForm()
    setIsLoading(false)
  }

  const setAsDefault = async (templateId: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('consent_templates')
      .update({ is_default: false })
      .eq('doctor_id', user?.id)
    
    await supabase
      .from('consent_templates')
      .update({ is_default: true })
      .eq('id', templateId)
    
    router.refresh()
  }

  const deleteTemplate = async (templateId: string) => {
    const supabase = createClient()
    await supabase.from('consent_templates').delete().eq('id', templateId)
    router.refresh()
  }

  const createDefaultTemplate = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('consent_templates').insert({
      doctor_id: user?.id,
      name: 'Consentimiento General',
      content: defaultTemplate,
      file_type: 'text',
      is_default: true,
    })

    router.refresh()
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      {templates.length > 0 ? (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{template.name}</span>
                    {template.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="mr-1 h-3 w-3" />
                        Por defecto
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {template.file_type === 'text' ? 'Texto' : template.file_type?.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {!template.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setAsDefault(template.id)}>
                    <Star className="mr-1 h-4 w-4" />
                    Usar
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(template)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="mb-4 text-muted-foreground">No tienes plantillas de consentimiento</p>
          <Button variant="outline" onClick={createDefaultTemplate} disabled={isLoading}>
            Crear plantilla por defecto
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Consentimiento
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Consentimiento' : 'Nuevo Consentimiento'}
            </DialogTitle>
            <DialogDescription>
              Crea una plantilla de consentimiento informado
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Texto</TabsTrigger>
                <TabsTrigger value="file" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Archivo (pronto)
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la plantilla</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Consentimiento General"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Contenido</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Escribe el texto del consentimiento informado..."
                    className="min-h-[200px] max-h-[300px] resize-y"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex items-center gap-2 py-2 border-t">
            <Switch
              id="default"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
            />
            <Label htmlFor="default">Usar como plantilla por defecto</Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !formData.name || !formData.content}>
              {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
