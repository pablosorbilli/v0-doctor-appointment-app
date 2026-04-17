import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConsentTemplatesForm } from '@/components/dashboard/consent-templates-form'

export default async function ConsentimientosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: templates } = await supabase
    .from('consent_templates')
    .select('*')
    .eq('doctor_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consentimientos Informados</h1>
        <p className="text-muted-foreground">
          Gestiona las plantillas de consentimiento informado que deben aceptar tus pacientes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Consentimiento</CardTitle>
          <CardDescription>
            Crea plantillas de texto o sube archivos PDF/Word con tus consentimientos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsentTemplatesForm templates={templates || []} />
        </CardContent>
      </Card>
    </div>
  )
}
