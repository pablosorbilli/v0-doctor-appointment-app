import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Stethoscope, 
  Calendar, 
  CreditCard, 
  FileCheck, 
  Link2, 
  Clock,
  Shield,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-7 w-7" />
            <span className="text-xl font-bold">MediTurnos</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/registro">Registrarme</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Gestiona tus turnos médicos de forma{' '}
            <span className="text-primary">simple y profesional</span>
          </h1>
          <p className="mt-6 text-pretty text-lg text-muted-foreground">
            Sistema completo para médicos de todas las especialidades. 
            Comparte tu link de agenda, recibe pagos online y gestiona 
            consentimientos informados digitales.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/auth/registro">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dr/demo">Ver Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">
            Todo lo que necesitas para tu consultorio
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Una plataforma diseñada específicamente para profesionales de la salud en Argentina
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Link2}
              title="Link Compartible"
              description="Genera un link único para compartir con tus pacientes. Ellos pueden agendar directamente sin llamadas."
            />
            <FeatureCard
              icon={Calendar}
              title="Agenda Configurable"
              description="Define tus horarios de atención, duración de consultas y días de descanso con total flexibilidad."
            />
            <FeatureCard
              icon={CreditCard}
              title="Pagos con Mercado Pago"
              description="Cobra tus consultas online de forma segura. Tus pacientes pagan al reservar."
            />
            <FeatureCard
              icon={FileCheck}
              title="Consentimientos Digitales"
              description="Sube tus propios consentimientos informados o usa nuestras plantillas. Firma digital incluida."
            />
            <FeatureCard
              icon={Clock}
              title="Tipos de Consulta"
              description="Primera visita, control, receta médica... configura diferentes tipos con precios y duraciones distintas."
            />
            <FeatureCard
              icon={Shield}
              title="Datos Seguros"
              description="Cumplimos con las normativas de protección de datos de salud. Tu información y la de tus pacientes está protegida."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold">
            Comienza a recibir turnos hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Registrate en minutos, configura tu agenda y comparte tu link. 
            Sin contratos ni comisiones ocultas.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/auth/registro">
              Crear Mi Cuenta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Stethoscope className="h-5 w-5" />
              <span className="font-medium">MediTurnos</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hecho en Argentina para profesionales de la salud
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
