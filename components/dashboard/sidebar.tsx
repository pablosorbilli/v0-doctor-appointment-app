'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Doctor } from '@/lib/types/database'
import { Button } from '@/components/ui/button'
import {
  Stethoscope,
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  Settings,
  CreditCard,
  BarChart3,
  Link2,
  Copy,
  Share2,
  ExternalLink,
  Check,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/turnos', label: 'Turnos', icon: Calendar },
  { href: '/dashboard/disponibilidad', label: 'Disponibilidad', icon: Clock },
  { href: '/dashboard/tipos-consulta', label: 'Tipos de Consulta', icon: FileText },
  { href: '/dashboard/consentimientos', label: 'Consentimientos', icon: FileText },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/dashboard/configuracion', label: 'Configuracion', icon: Settings },
]

interface DashboardSidebarProps {
  doctor: Doctor
}

export function DashboardSidebar({ doctor }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/dr/${doctor.slug}`
    : `/dr/${doctor.slug}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Dr. ${doctor.first_name} ${doctor.last_name} - MediTurnos`,
          text: 'Reserva tu turno medico online',
          url: publicUrl,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Stethoscope className="h-6 w-6 text-primary" />
        <span className="font-bold">MediTurnos</span>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Tu Link - Destacado con fondo azul */}
      <div className="mt-auto p-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
              <Link2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">Tu Link Publico</div>
              <code className="text-xs text-blue-100">/dr/{doctor.slug}</code>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={copyToClipboard}
              size="sm"
              className="w-full bg-white text-blue-700 hover:bg-blue-50"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-3.5 w-3.5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copiar Link
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={shareLink}
                size="sm"
                variant="secondary"
                className="flex-1 bg-blue-500/30 text-white hover:bg-blue-500/50 border-0"
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Compartir
              </Button>
              
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="flex-1 bg-blue-500/30 text-white hover:bg-blue-500/50 border-0"
              >
                <Link href={`/dr/${doctor.slug}`} target="_blank">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Ver
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
