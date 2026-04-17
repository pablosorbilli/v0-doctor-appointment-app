'use client'

import { useState } from 'react'
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
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = `${baseUrl}/dr/${slug}`

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            value={publicUrl}
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
