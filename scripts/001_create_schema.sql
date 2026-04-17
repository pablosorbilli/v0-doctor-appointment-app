-- =============================================
-- Sistema de Turnos Médicos - Schema Principal
-- =============================================

-- 1. Perfiles de médicos (extiende auth.users)
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  license_number TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  consultation_fee INTEGER NOT NULL DEFAULT 0,
  consultation_duration INTEGER NOT NULL DEFAULT 30,
  phone TEXT,
  email TEXT NOT NULL,
  address TEXT,
  bio TEXT,
  profile_image_url TEXT,
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Disponibilidad semanal del médico
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, day_of_week, start_time)
);

-- 3. Excepciones de disponibilidad (vacaciones, días específicos)
CREATE TABLE IF NOT EXISTS availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT FALSE,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, date)
);

-- 4. Plantillas de consentimiento informado
CREATE TABLE IF NOT EXISTS consent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'docx', 'text')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tipos de consulta configurables por médico
CREATE TABLE IF NOT EXISTS appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  fee INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Turnos/Citas
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_type_id UUID REFERENCES appointment_types(id),
  
  -- Datos del paciente (sin cuenta)
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT,
  patient_dni TEXT,
  
  -- Detalles del turno
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  visit_reason TEXT,
  notes TEXT,
  
  -- Estado y pago
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_id TEXT,
  payment_amount INTEGER,
  
  -- Consentimiento
  consent_template_id UUID REFERENCES consent_templates(id),
  consent_accepted_at TIMESTAMPTZ,
  consent_ip_address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Historial de pagos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'ARS',
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'in_process')),
  payment_method TEXT,
  payer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Índices para mejor performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);
CREATE INDEX IF NOT EXISTS idx_availability_doctor ON availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Doctors policies
CREATE POLICY "doctors_select_own" ON doctors 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "doctors_select_public" ON doctors 
  FOR SELECT USING (true);

CREATE POLICY "doctors_insert_own" ON doctors 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "doctors_update_own" ON doctors 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "doctors_delete_own" ON doctors 
  FOR DELETE USING (auth.uid() = id);

-- Availability policies
CREATE POLICY "availability_select_own" ON availability 
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "availability_select_public" ON availability 
  FOR SELECT USING (true);

CREATE POLICY "availability_insert_own" ON availability 
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "availability_update_own" ON availability 
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "availability_delete_own" ON availability 
  FOR DELETE USING (doctor_id = auth.uid());

-- Availability exceptions policies
CREATE POLICY "exceptions_select_own" ON availability_exceptions 
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "exceptions_select_public" ON availability_exceptions 
  FOR SELECT USING (true);

CREATE POLICY "exceptions_insert_own" ON availability_exceptions 
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "exceptions_update_own" ON availability_exceptions 
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "exceptions_delete_own" ON availability_exceptions 
  FOR DELETE USING (doctor_id = auth.uid());

-- Consent templates policies
CREATE POLICY "consents_select_own" ON consent_templates 
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "consents_select_public" ON consent_templates 
  FOR SELECT USING (true);

CREATE POLICY "consents_insert_own" ON consent_templates 
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "consents_update_own" ON consent_templates 
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "consents_delete_own" ON consent_templates 
  FOR DELETE USING (doctor_id = auth.uid());

-- Appointment types policies
CREATE POLICY "types_select_own" ON appointment_types 
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "types_select_public" ON appointment_types 
  FOR SELECT USING (true);

CREATE POLICY "types_insert_own" ON appointment_types 
  FOR INSERT WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "types_update_own" ON appointment_types 
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "types_delete_own" ON appointment_types 
  FOR DELETE USING (doctor_id = auth.uid());

-- Appointments policies (pacientes pueden crear sin auth)
CREATE POLICY "appointments_select_doctor" ON appointments 
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "appointments_insert_anon" ON appointments 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "appointments_update_doctor" ON appointments 
  FOR UPDATE USING (doctor_id = auth.uid());

CREATE POLICY "appointments_delete_doctor" ON appointments 
  FOR DELETE USING (doctor_id = auth.uid());

-- Payments policies
CREATE POLICY "payments_select_doctor" ON payments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = payments.appointment_id 
      AND appointments.doctor_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert_anon" ON payments 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "payments_update_anon" ON payments 
  FOR UPDATE USING (true);

-- =============================================
-- Trigger para crear perfil de médico al registrarse
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_doctor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generar slug base desde nombre y apellido
  base_slug := lower(
    regexp_replace(
      unaccent(
        coalesce(new.raw_user_meta_data ->> 'first_name', '') || '-' ||
        coalesce(new.raw_user_meta_data ->> 'last_name', '')
      ),
      '[^a-z0-9-]', '-', 'g'
    )
  );
  
  -- Asegurar slug único
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM doctors WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.doctors (
    id,
    first_name,
    last_name,
    specialty,
    license_number,
    slug,
    email,
    consultation_fee,
    consultation_duration
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'specialty', ''),
    coalesce(new.raw_user_meta_data ->> 'license_number', ''),
    final_slug,
    new.email,
    0,
    30
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Activar extensión unaccent si no existe
CREATE EXTENSION IF NOT EXISTS unaccent;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_doctor();

-- =============================================
-- Función para actualizar updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_templates_updated_at
  BEFORE UPDATE ON consent_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
