'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink, Share2, QrCode } from 'lucide-react'
import Link from 'next/link'

interface PublicLinkCardLargeProps {
  slug: string
  doctorName: string
}

export function PublicLinkCardLarge({ slug, doctorName }: PublicLinkCardLargeProps) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState(`/dr/${slug}`)
  
  useEffect(() => {
    setFullUrl(`${window.location.origin}/dr/${slug}`)
  }, [slug])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agenda tu turno con ${doctorName}`,
          text: 'Reserva tu turno de manera facil y rapida',
          url: fullUrl,
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card className="overflow-hidden border-2 border-blue-500 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-xl">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Left side - Info */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <Share2 className="h-4 w-4" />
              Tu Pagina Publica
            </div>
            <h2 className="mb-2 text-2xl font-bold lg:text-3xl">
              Comparte tu Link de Reservas
            </h2>
            <p className="mb-6 text-blue-100">
              Envia este enlace a tus pacientes para que puedan agendar turnos de forma autonoma, las 24 horas del dia.
            </p>
            
            {/* URL Display */}
            <div className="mb-6 overflow-hidden rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-200">
                Tu enlace personalizado
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-lg font-mono font-semibold">
                  {fullUrl}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard}
                  className="h-10 w-10 shrink-0 rounded-lg bg-white/20 text-white hover:bg-white/30 hover:text-white"
                >
                  {copied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {copied && (
                <div className="mt-2 text-sm font-medium text-green-300">
                  Link copiado al portapapeles
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={copyToClipboard}
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                <Copy className="mr-2 h-5 w-5" />
                Copiar Link
              </Button>
              <Button 
                onClick={shareLink}
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Share2 className="mr-2 h-5 w-5" />
                Compartir
              </Button>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href={`/dr/${slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Ver Pagina
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Right side - Visual */}
          <div className="hidden items-center justify-center border-l border-white/20 bg-white/5 p-8 lg:flex lg:w-64">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <QrCode className="h-12 w-12" />
              </div>
              <p className="text-sm text-blue-200">
                Tus pacientes pueden<br />reservar 24/7
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
