'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Appointment {
  id: string
  date: string
  start_time: string
  end_time: string
  patient_name: string
  patient_email: string
  patient_phone: string | null
  patient_dni: string | null
  status: string
  payment_status: string | null
  payment_amount: number | null
  visit_reason: string | null
  appointment_type?: {
    name: string
  } | null
}

interface ReportsExportProps {
  appointments: Appointment[]
  desde: string
  hasta: string
}

export function ReportsExport({ appointments, desde, hasta }: ReportsExportProps) {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      pending_payment: 'Pendiente Pago',
      no_show: 'No Asistio',
    }
    return labels[status] || status
  }

  const getPaymentLabel = (status: string | null) => {
    if (!status) return 'Pendiente'
    const labels: Record<string, string> = {
      paid: 'Pagado',
      pending: 'Pendiente',
      refunded: 'Reembolsado',
      failed: 'Fallido',
    }
    return labels[status] || status
  }

  const exportToCSV = () => {
    const headers = [
      'Fecha',
      'Horario',
      'Paciente',
      'Email',
      'Telefono',
      'DNI',
      'Tipo de Consulta',
      'Motivo',
      'Estado',
      'Estado Pago',
      'Monto',
    ]

    const rows = appointments.map((a) => [
      format(new Date(a.date), 'dd/MM/yyyy'),
      `${a.start_time.slice(0, 5)} - ${a.end_time.slice(0, 5)}`,
      a.patient_name,
      a.patient_email,
      a.patient_phone || '',
      a.patient_dni || '',
      a.appointment_type?.name || 'Consulta',
      a.visit_reason || '',
      getStatusLabel(a.status),
      getPaymentLabel(a.payment_status),
      a.payment_amount ? (a.payment_amount / 100).toString() : '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-turnos-${desde}-a-${hasta}.csv`
    link.click()
  }

  const exportToJSON = () => {
    const data = appointments.map((a) => ({
      fecha: format(new Date(a.date), 'dd/MM/yyyy'),
      horario_inicio: a.start_time.slice(0, 5),
      horario_fin: a.end_time.slice(0, 5),
      paciente: {
        nombre: a.patient_name,
        email: a.patient_email,
        telefono: a.patient_phone,
        dni: a.patient_dni,
      },
      tipo_consulta: a.appointment_type?.name || 'Consulta',
      motivo: a.visit_reason,
      estado: getStatusLabel(a.status),
      pago: {
        estado: getPaymentLabel(a.payment_status),
        monto: a.payment_amount ? a.payment_amount / 100 : null,
      },
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-turnos-${desde}-a-${hasta}.json`
    link.click()
  }

  const generateReport = () => {
    const totalTurnos = appointments.length
    const completados = appointments.filter((a) => a.status === 'completed').length
    const cancelados = appointments.filter((a) => a.status === 'cancelled').length
    const ingresos = appointments
      .filter((a) => a.payment_status === 'paid')
      .reduce((sum, a) => sum + (a.payment_amount || 0), 0)
    const pacientesUnicos = new Set(appointments.map((a) => a.patient_email.toLowerCase())).size

    const report = `
REPORTE DE TURNOS MEDICOS
========================
Periodo: ${format(new Date(desde), "d 'de' MMMM", { locale: es })} al ${format(new Date(hasta), "d 'de' MMMM 'de' yyyy", { locale: es })}
Generado: ${format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}

RESUMEN
-------
Total de Turnos: ${totalTurnos}
Turnos Completados: ${completados}
Turnos Cancelados: ${cancelados}
Pacientes Unicos: ${pacientesUnicos}
Ingresos Totales: $${(ingresos / 100).toLocaleString('es-AR')}

DETALLE DE TURNOS
-----------------
${appointments
  .map(
    (a) => `
${format(new Date(a.date), 'dd/MM/yyyy')} ${a.start_time.slice(0, 5)} - ${a.patient_name}
  Email: ${a.patient_email}
  ${a.patient_phone ? `Telefono: ${a.patient_phone}` : ''}
  ${a.patient_dni ? `DNI: ${a.patient_dni}` : ''}
  Tipo: ${a.appointment_type?.name || 'Consulta'}
  Estado: ${getStatusLabel(a.status)}
  Pago: ${getPaymentLabel(a.payment_status)} ${a.payment_amount ? `- $${(a.payment_amount / 100).toLocaleString('es-AR')}` : ''}
`
  )
  .join('')}
`

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte-turnos-${desde}-a-${hasta}.txt`
    link.click()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar CSV (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Generar Reporte TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
