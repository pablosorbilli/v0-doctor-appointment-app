'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Link2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/dashboard/turnos', label: 'Turnos', icon: Calendar },
  { href: '/dashboard/disponibilidad', label: 'Disponibilidad', icon: Clock },
  { href: '/dashboard/tipos-consulta', label: 'Tipos de Consulta', icon: FileText },
  { href: '/dashboard/consentimientos', label: 'Consentimientos', icon: FileText },
  { href: '/dashboard/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

interface MobileSidebarProps {
  doctor: Doctor
}

export function MobileSidebar({ doctor }: MobileSidebarProps) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)
  
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/dr/${doctor.slug}`
    : `/dr/${doctor.slug}`
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = publicUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="border-b p-4">
        <SheetTitle className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span>MediTurnos</span>
        </SheetTitle>
      </SheetHeader>

      <nav className="flex-1 space-y-1 p-4">
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

      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
            <Link2 className="h-4 w-4" />
            Link para Pacientes
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-start text-xs"
              onClick={() => window.open(`/dr/${doctor.slug}`, '_blank')}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Ver página
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={copyLink}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
