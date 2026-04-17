'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ConsentTemplate } from '@/lib/types/database'
import { FileText } from 'lucide-react'

interface StepConsentProps {
  consentTemplate: ConsentTemplate | null
  accepted: boolean
  onAccept: () => void
}

const DEFAULT_CONSENT = `CONSENTIMIENTO INFORMADO

Yo, el/la paciente abajo firmante, declaro que:

1. He sido informado/a de manera clara y comprensible sobre el procedimiento médico a realizar, sus beneficios, riesgos y posibles alternativas.

2. He tenido la oportunidad de hacer todas las preguntas necesarias y las mismas han sido respondidas satisfactoriamente.

3. Comprendo que la medicina no es una ciencia exacta y que no se me han dado garantías sobre los resultados del tratamiento.

4. Autorizo al profesional médico a realizar el procedimiento descrito y cualquier otro procedimiento que pueda ser necesario durante el mismo.

5. Acepto las condiciones del servicio y la política de cancelación de turnos.

Doy mi consentimiento de forma voluntaria, libre de presiones y sin ningún tipo de coacción.`

export function StepConsent({ consentTemplate, onAccept }: StepConsentProps) {
  const [isChecked, setIsChecked] = useState(false)

  const consentContent = consentTemplate?.content || DEFAULT_CONSENT

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Por favor, lee y acepta el consentimiento informado para continuar
      </p>

      <div className="rounded-lg border">
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {consentTemplate?.name || 'Consentimiento Informado'}
          </span>
        </div>
        <ScrollArea className="h-64 p-4">
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">
            {consentContent}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
        <Checkbox
          id="consent"
          checked={isChecked}
          onCheckedChange={(checked) => setIsChecked(checked === true)}
        />
        <Label htmlFor="consent" className="text-sm leading-relaxed">
          He leído y comprendo el consentimiento informado. Acepto los términos y
          condiciones descritos anteriormente.
        </Label>
      </div>

      <Button
        onClick={onAccept}
        disabled={!isChecked}
        className="w-full"
      >
        Aceptar y Continuar
      </Button>
    </div>
  )
}
