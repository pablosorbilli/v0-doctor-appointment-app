/*
  # Fix Missing Doctor Records

  Este script crea registros de doctor para usuarios autenticados que 
  no tienen un registro correspondiente en la tabla doctors.
  
  Esto puede ocurrir si el trigger handle_new_doctor falló o si el 
  usuario se registró antes de que el trigger existiera.
*/

-- Crear doctores faltantes para usuarios existentes
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
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'first_name', 'Usuario'),
  COALESCE(au.raw_user_meta_data ->> 'last_name', 'Nuevo'),
  COALESCE(au.raw_user_meta_data ->> 'specialty', 'Generalista'),
  COALESCE(au.raw_user_meta_data ->> 'license_number', 'Pendiente'),
  lower(
    regexp_replace(
      unaccent(
        COALESCE(au.raw_user_meta_data ->> 'first_name', 'usuario') || '-' ||
        COALESCE(au.raw_user_meta_data ->> 'last_name', au.id::text)
      ),
      '[^a-z0-9-]', '-', 'g'
    )
  ),
  au.email,
  0,
  30
FROM auth.users au
LEFT JOIN public.doctors d ON d.id = au.id
WHERE d.id IS NULL
ON CONFLICT (id) DO NOTHING;
