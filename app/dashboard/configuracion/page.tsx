import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { MercadoPagoSettings } from '@/components/dashboard/mercadopago-settings'
import { PublicLinkCardLarge } from '@/components/dashboard/public-link-card-large'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user?.id)
    .single()

  if (!doctor) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-muted-foreground">
          Administra tu perfil y preferencias
        </p>
      </div>

      {/* Public Link - Destacado */}
      <PublicLinkCardLarge slug={doctor.slug} doctorName={`${doctor.first_name} ${doctor.last_name}`} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perfil Profesional</CardTitle>
            <CardDescription>
              Esta informacion se mostrara en tu pagina publica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm doctor={doctor} />
          </CardContent>
        </Card>

        {/* Mercado Pago */}
        <MercadoPagoSettings />
      </div>
    </div>
  )
}
