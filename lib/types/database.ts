// Tipos para el Sistema de Turnos Médicos

export interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialty: string
  license_number: string
  slug: string
  consultation_fee: number
  consultation_duration: number
  phone: string | null
  email: string
  address: string | null
  bio: string | null
  profile_image_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface Availability {
  id: string
  doctor_id: string
  day_of_week: number // 0 = Domingo, 6 = Sábado
  start_time: string // HH:mm:ss
  end_time: string
  is_active: boolean
  created_at: string
}

export interface AvailabilityException {
  id: string
  doctor_id: string
  date: string // YYYY-MM-DD
  is_available: boolean
  start_time: string | null
  end_time: string | null
  reason: string | null
  created_at: string
}

export interface ConsentTemplate {
  id: string
  doctor_id: string
  name: string
  content: string | null
  file_url: string | null
  file_type: 'pdf' | 'docx' | 'text' | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface AppointmentType {
  id: string
  doctor_id: string
  name: string
  description: string | null
  duration: number // minutos
  fee: number // centavos
  is_active: boolean
  sort_order: number
  created_at: string
}

export type AppointmentStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface Appointment {
  id: string
  doctor_id: string
  appointment_type_id: string | null
  patient_name: string
  patient_email: string
  patient_phone: string | null
  patient_dni: string | null
  date: string // YYYY-MM-DD
  start_time: string // HH:mm:ss
  end_time: string
  visit_reason: string | null
  notes: string | null
  status: AppointmentStatus
  payment_status: PaymentStatus
  payment_id: string | null
  payment_amount: number | null
  consent_template_id: string | null
  consent_accepted_at: string | null
  consent_ip_address: string | null
  created_at: string
  updated_at: string
  // Relaciones (opcionales, para joins)
  appointment_type?: AppointmentType
  consent_template?: ConsentTemplate
}

export type MercadoPagoStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'in_process'

export interface Payment {
  id: string
  appointment_id: string
  mercadopago_payment_id: string | null
  mercadopago_preference_id: string | null
  amount: number
  currency: string
  status: MercadoPagoStatus
  payment_method: string | null
  payer_email: string | null
  created_at: string
  updated_at: string
}

// Tipos auxiliares para formularios
export interface SignUpFormData {
  email: string
  password: string
  repeatPassword: string
  firstName: string
  lastName: string
  specialty: string
  licenseNumber: string
}

export interface BookingFormData {
  appointmentTypeId: string
  date: string
  time: string
  patientName: string
  patientEmail: string
  patientPhone: string
  patientDni: string
  visitReason: string
  consentAccepted: boolean
}

// Días de la semana en español
export const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const

// Especialidades médicas comunes en Argentina
export const MEDICAL_SPECIALTIES = [
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Generalista',
  'Ginecología',
  'Medicina General',
  'Medicina Interna',
  'Nefrología',
  'Neumología',
  'Neurología',
  'Nutrición',
  'Oftalmología',
  'Oncología',
  'Otorrinolaringología',
  'Pediatría',
  'Psicología',
  'Psiquiatría',
  'Reumatología',
  'Traumatología',
  'Urología',
] as const

export type Specialty = typeof MEDICAL_SPECIALTIES[number]
