'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, AlertCircle } from 'lucide-react'

export function MercadoPagoSettings() {
  // En producción esto verificaría si las credenciales están configuradas
  const isConfigured = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ? true : false

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Mercado Pago
        </CardTitle>
        <CardDescription>
          Configuración de pagos online
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConfigured ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Conectado
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu cuenta de Mercado Pago está configurada correctamente. 
              Los pacientes pueden pagar sus turnos online.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">No configurado</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Para habilitar pagos online, el administrador debe configurar las 
              credenciales de Mercado Pago en las variables de entorno.
            </p>
            <div className="rounded-lg bg-muted p-3 text-xs">
              <p className="font-medium">Variables requeridas:</p>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                <li>MERCADOPAGO_ACCESS_TOKEN</li>
                <li>NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
