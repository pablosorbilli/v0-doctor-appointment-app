'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Doctor, AppointmentType, Availability, AvailabilityException, ConsentTemplate } from '@/lib/types/database'
import { StepAppointmentType } from './step-appointment-type'
import { StepDateSelection } from './step-date-selection'
import { StepTimeSelection } from './step-time-selection'
import { StepPatientInfo } from './step-patient-info'
import { StepConsent } from './step-consent'
import { StepConfirmation } from './step-confirmation'
import { ArrowLeft } from 'lucide-react'

interface BookingWizardProps {
  doctor: Doctor
  appointmentTypes: AppointmentType[]
  availability: Availability[]
  exceptions: AvailabilityException[]
  consentTemplate: ConsentTemplate | null
}

export interface BookingData {
  appointmentTypeId: string | null
  appointmentType: AppointmentType | null
  date: string | null
  time: string | null
  patientName: string
  patientEmail: string
  patientPhone: string
  patientDni: string
  visitReason: string
  consentAccepted: boolean
}

const STEPS = [
  { id: 'type', title: 'Tipo de Consulta' },
  { id: 'date', title: 'Fecha' },
  { id: 'time', title: 'Horario' },
  { id: 'info', title: 'Tus Datos' },
  { id: 'consent', title: 'Consentimiento' },
  { id: 'confirm', title: 'Confirmación' },
]

export function BookingWizard({
  doctor,
  appointmentTypes,
  availability,
  exceptions,
  consentTemplate,
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [bookingData, setBookingData] = useState<BookingData>({
    appointmentTypeId: null,
    appointmentType: null,
    date: null,
    time: null,
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientDni: '',
    visitReason: '',
    consentAccepted: false,
  })

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Si no hay tipos de consulta, saltamos al paso de fecha
  const effectiveStep = appointmentTypes.length === 0 && currentStep === 0 ? 1 : currentStep
  const showBackButton = effectiveStep > 0 && effectiveStep < STEPS.length - 1

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <CardTitle>{STEPS[effectiveStep].title}</CardTitle>
            <CardDescription>
              Paso {effectiveStep + 1} de {STEPS.length}
            </CardDescription>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      <CardContent>
        {effectiveStep === 0 && appointmentTypes.length > 0 && (
          <StepAppointmentType
            appointmentTypes={appointmentTypes}
            selectedTypeId={bookingData.appointmentTypeId}
            onSelect={(type) => {
              updateBookingData({
                appointmentTypeId: type.id,
                appointmentType: type,
              })
              nextStep()
            }}
          />
        )}

        {effectiveStep === 1 && (
          <StepDateSelection
            availability={availability}
            exceptions={exceptions}
            selectedDate={bookingData.date}
            onSelect={(date) => {
              updateBookingData({ date, time: null })
              nextStep()
            }}
          />
        )}

        {effectiveStep === 2 && bookingData.date && (
          <StepTimeSelection
            doctorId={doctor.id}
            availability={availability}
            selectedDate={bookingData.date}
            duration={bookingData.appointmentType?.duration || doctor.consultation_duration}
            selectedTime={bookingData.time}
            onSelect={(time) => {
              updateBookingData({ time })
              nextStep()
            }}
          />
        )}

        {effectiveStep === 3 && (
          <StepPatientInfo
            bookingData={bookingData}
            onSubmit={(data) => {
              updateBookingData(data)
              nextStep()
            }}
          />
        )}

        {effectiveStep === 4 && (
          <StepConsent
            consentTemplate={consentTemplate}
            accepted={bookingData.consentAccepted}
            onAccept={() => {
              updateBookingData({ consentAccepted: true })
              nextStep()
            }}
          />
        )}

        {effectiveStep === 5 && (
          <StepConfirmation
            doctor={doctor}
            bookingData={bookingData}
            consentTemplateId={consentTemplate?.id || null}
          />
        )}
      </CardContent>
    </Card>
  )
}
