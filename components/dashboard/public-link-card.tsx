'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, ExternalLink, Share2, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface PublicLinkCardProps {
  slug: string
}

export function PublicLinkCard({ slug }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState(`/dr/${slug}`)
  
  // Actualizar la URL completa cuando el componente se monta en el cliente
  useEffect(() => {
    setFullUrl(`${window.location.origin}/dr/${slug}`)
  }, [slug])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
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
    const shareData = {
      title: 'Reservar turno',
      text: 'Reserva tu turno conmigo a través de este link:',
      url: fullUrl,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // Fallback: copiar al portapapeles si no hay Web Share API
        await copyToClipboard()
      }
    } catch (err) {
      // Si el usuario cancela el share, no hacemos nada
      if ((err as Error).name !== 'AbortError') {
        await copyToClipboard()
      }
    }
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Reserva tu turno conmigo: ${fullUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu Link de Reservas</CardTitle>
        <CardDescription>
          Comparte este link con tus pacientes para que puedan agendar turnos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input con link y boton copiar */}
        <div className="flex gap-2">
          <Input
            value={fullUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={copyToClipboard}
            title="Copiar link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Botones de accion */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={shareLink} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir Link
          </Button>
          <Button variant="outline" onClick={shareWhatsApp} className="w-full">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        </div>

        {/* Enlace para ver pagina */}
        <Button variant="ghost" className="w-full text-muted-foreground" asChild>
          <Link href={`/dr/${slug}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver mi página pública
          </Link>
        </Button>

        {/* Mensaje informativo */}
        <p className="text-xs text-muted-foreground text-center">
          Tus pacientes podrán ver tu disponibilidad y reservar turnos directamente
        </p>
      </CardContent>
    </Card>
  )
}
