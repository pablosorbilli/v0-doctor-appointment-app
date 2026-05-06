import { createClient } from '@/lib/supabase/server'
import { PublicLinkCard } from '@/components/dashboard/public-link-card'

export default async function LinkCompartirPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('slug')
    .eq('id', user?.id)
    .single()

  if (!doctor) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Link para Compartir</h1>
        <p className="text-muted-foreground">
          Comparte tu link con pacientes para que puedan agendar turnos contigo
        </p>
      </div>

      <div className="max-w-xl">
        <PublicLinkCard slug={doctor.slug} />
      </div>
    </div>
  )
}
