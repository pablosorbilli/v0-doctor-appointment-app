import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function InvitationRedirectPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  // Verificar que el doctor existe
  const { data: doctor } = await supabase
    .from('doctors')
    .select('slug')
    .eq('slug', slug)
    .single()
  
  if (doctor) {
    redirect(`/dr/${slug}`)
  }
  
  // Si no existe, redirigir a la página principal
  redirect('/')
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  
  const { data: doctor } = await supabase
    .from('doctors')
    .select('first_name, last_name, specialty')
    .eq('slug', slug)
    .single()
  
  if (doctor) {
    return {
      title: `Reservar turno con Dr. ${doctor.first_name} ${doctor.last_name}`,
      description: `Agenda tu turno con ${doctor.specialty}`,
    }
  }
  
  return {
    title: 'Reservar Turno',
  }
}
