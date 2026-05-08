'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PublicLinkCardProps {
  slug: string
}

export function PublicLinkCard({ slug }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const [fullUrl, setFullUrl] = useState(`/dr/${slug}`)
  
  // Usar NEXT_PUBLIC_APP_URL si está configurada, sino usar window.location.origin
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    setFullUrl(`${baseUrl}/dr/${slug}`)
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
          <Input
            value={fullUrl}
            readOnly
            className="font-mono text-sm"
          />
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/dr/${slug}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver página pública
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
