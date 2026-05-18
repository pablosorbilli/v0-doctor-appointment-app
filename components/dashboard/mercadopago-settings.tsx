'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface MPStatus {
  connected: boolean
  userId: string | null
  connectedAt: string | null
}

export function MercadoPagoSettings() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<MPStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    // Verificar mensajes de la URL (después del callback)
    const mpSuccess = searchParams.get('mp_success')
    const mpError = searchParams.get('mp_error')

    if (mpSuccess) {
      setMessage({ type: 'success', text: 'Tu cuenta de Mercado Pago se conectó correctamente.' })
    } else if (mpError) {
      const errorMessages: Record<string, string> = {
        no_code: 'No se recibió el código de autorización.',
        auth_mismatch: 'Error de autenticación. Por favor, intenta de nuevo.',
        token_error: 'Error al obtener el token de acceso.',
        save_error: 'Error al guardar las credenciales.',
        unknown: 'Ocurrió un error desconocido.',
      }
      setMessage({ type: 'error', text: errorMessages[mpError] || 'Error al conectar.' })
    }

    // Obtener estado de conexión
    fetchStatus()
  }, [searchParams])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/mercadopago/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Error fetching MP status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/mercadopago/connect'
  }

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desconectar tu cuenta de Mercado Pago? Los pacientes no podrán pagar online.')) {
      return
    }

    setDisconnecting(true)
    try {
      const response = await fetch('/api/mercadopago/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setStatus({ connected: false, userId: null, connectedAt: null })
        setMessage({ type: 'success', text: 'Cuenta de Mercado Pago desconectada.' })
      } else {
        setMessage({ type: 'error', text: 'Error al desconectar la cuenta.' })
      }
    } catch (error) {
      console.error('Error disconnecting MP:', error)
      setMessage({ type: 'error', text: 'Error al desconectar la cuenta.' })
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Mercado Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mercado Pago
        </CardTitle>
        <CardDescription>
          Conecta tu cuenta para recibir pagos de tus pacientes directamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {status?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Conectado
                </Badge>
              </div>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ID de usuario MP:</span>
                <span className="font-mono">{status.userId}</span>
              </div>
              {status.connectedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conectado desde:</span>
                  <span>{format(new Date(status.connectedAt), "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Los pagos de tus pacientes se depositarán directamente en tu cuenta de Mercado Pago.
            </p>

            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full"
            >
              {disconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desconectando...
                </>
              ) : (
                'Desconectar cuenta'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Cuenta no conectada</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Conecta tu cuenta de Mercado Pago para que los pacientes puedan pagar sus turnos online. 
              El dinero se depositará directamente en tu cuenta.
            </p>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-medium text-sm mb-2">Beneficios de conectar tu cuenta:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Recibe pagos directamente en tu cuenta MP
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Los turnos se confirman automáticamente al pagar
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  Sin comisiones adicionales de la plataforma
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleConnect}
              className="w-full bg-[#009ee3] hover:bg-[#007eb5] text-white"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Conectar con Mercado Pago
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Serás redirigido a Mercado Pago para autorizar la conexión de forma segura.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
