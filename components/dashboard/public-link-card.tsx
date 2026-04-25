'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Check, ExternalLink } from 'lucide-react'

interface PublicLinkCardProps {
  slug: string
}

export function PublicLinkCard({ slug }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [shortUrl, setShortUrl] = useState('')
  
  // Actualizar la URL cuando el componente se monta en el cliente
  useEffect(() => {
    setShortUrl(`${window.location.origin}/i/${slug}`)
  }, [slug])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = shortUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openPublicPage = () => {
    // Abrir la página directamente sin el redirect para evitar problemas
    window.open(`/dr/${slug}`, '_blank')
  }
  
  const openShortLink = () => {
    // Abrir el link corto que es el que se comparte
    window.open(`/i/${slug}`, '_blank')
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
        <div className="flex gap-2">
          <button
            onClick={openShortLink}
            className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-left font-mono text-sm hover:bg-muted transition-colors cursor-pointer truncate"
            title={shortUrl}
          >
            {shortUrl || 'Cargando...'}
          </button>
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button variant="outline" className="w-full" onClick={openPublicPage}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Ver página pública
        </Button>
      </CardContent>
    </Card>
  )
}
