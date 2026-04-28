import { createClient } from '@supabase/supabase-js'

// Deshabilitar cache para mostrar siempre datos frescos
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Cliente anónimo para páginas públicas (sin requerir sesión)
function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
import { notFound } from 'next/navigation'
import { BookingWizard } from '@/components/booking/booking-wizard'
import { Stethoscope, MapPin, Award, Clock } from 'lucide-react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAnonClient()
  
  const { data: doctor } = await supabase
    .from('doctors')
    .select('first_name, last_name, specialty')
    .eq('slug', slug)
    .single()

  if (!doctor) {
    return { title: 'Médico no encontrado' }
  }

  return {
    title: `Dr. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialty} | MediTurnos`,
    description: `Reserva tu turno con Dr. ${doctor.first_name} ${doctor.last_name}, especialista en ${doctor.specialty}. Agenda online de forma rápida y segura.`,
  }
}

export default async function DoctorBookingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createAnonClient()

  const { data: doctor } = await supabase
    .from('doctors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!doctor) {
    notFound()
  }

  const { data: appointmentTypes } = await supabase
    .from('appointment_types')
    .select('*')
    .eq('doctor_id', doctor.id)
    .eq('is_active', true)
    .order('sort_order')

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('doctor_id', doctor.id)
    .eq('is_active', true)
    .order('day_of_week')

  const { data: exceptions } = await supabase
    .from('availability_exceptions')
    .select('*')
    .eq('doctor_id', doctor.id)
    .gte('date', new Date().toISOString().split('T')[0])

  // Primero buscar plantilla por defecto, si no existe buscar cualquiera
  let { data: consentTemplate } = await supabase
    .from('consent_templates')
    .select('*')
    .eq('doctor_id', doctor.id)
    .eq('is_default', true)
    .maybeSingle()
  
  // Si no hay plantilla por defecto, buscar la primera disponible
  if (!consentTemplate) {
    const { data: anyTemplate } = await supabase
      .from('consent_templates')
      .select('*')
      .eq('doctor_id', doctor.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    consentTemplate = anyTemplate
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-4 text-primary">
          <Stethoscope className="h-6 w-6" />
          <span className="font-bold">MediTurnos</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Doctor Info */}
        <div className="mb-8 rounded-lg border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-2xl font-bold">
                {doctor.first_name[0]}{doctor.last_name[0]}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                Dr. {doctor.first_name} {doctor.last_name}
              </h1>
              <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {doctor.specialty}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {doctor.consultation_duration} min por consulta
                </span>
                {doctor.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {doctor.address}
                  </span>
                )}
              </div>
              {doctor.bio && (
                <p className="mt-3 text-sm text-muted-foreground">{doctor.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Wizard */}
        <BookingWizard
          doctor={doctor}
          appointmentTypes={appointmentTypes || []}
          availability={availability || []}
          exceptions={exceptions || []}
          consentTemplate={consentTemplate}
        />
      </main>
    </div>
  )
}
