import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!doctor) {
    // Usuario autenticado pero sin perfil de doctor - redirigir a completar perfil
    redirect('/auth/completar-perfil')
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar doctor={doctor} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader doctor={doctor} />
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
