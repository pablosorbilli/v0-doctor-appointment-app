import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/dashboard/profile-form'
import { MercadoPagoSettings } from '@/components/dashboard/mercadopago-settings'
import { PublicLinkCard } from '@/components/dashboard/public-link-card'

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
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu perfil y preferencias
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perfil Profesional</CardTitle>
            <CardDescription>
              Esta información se mostrará en tu página pública
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm doctor={doctor} />
          </CardContent>
        </Card>

        {/* Public Link */}
        <PublicLinkCard slug={doctor.slug} />

        {/* Mercado Pago */}
        <MercadoPagoSettings />
      </div>
    </div>
  )
}
