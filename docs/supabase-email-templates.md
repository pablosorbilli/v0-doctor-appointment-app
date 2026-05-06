# Templates de Email para Supabase Auth

Para configurar estos templates, ve al Dashboard de Supabase:
**Authentication → Email Templates**

## 1. Confirm Sign Up (Confirmación de Registro)

**Subject:** Confirma tu cuenta en MediTurnos

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
  <div style="margin: 20px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    
    <!-- Header con logo -->
    <div style="background: #0f172a; padding: 24px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 8px;">
        <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 8px; display: inline-block;"></div>
        <span style="color: white; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">MediTurnos</span>
      </div>
    </div>
    
    <!-- Banner -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
      <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 16px; border-radius: 100px; margin-bottom: 16px;">
        <span style="color: white; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Validación de Cuenta</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Confirma tu Email</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">Un paso más para comenzar</p>
    </div>
    
    <!-- Contenido -->
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; margin: 0 0 16px 0;">¡Hola!</p>
      <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0;">
        Gracias por registrarte en <strong>MediTurnos</strong>. Para completar tu registro y activar tu cuenta, por favor confirma tu dirección de email haciendo clic en el botón de abajo.
      </p>
      
      <!-- Botón de confirmación -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
          Confirmar mi cuenta
        </a>
      </div>
      
      <!-- Información adicional -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-top: 24px;">
        <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">
          Si no creaste una cuenta en MediTurnos, puedes ignorar este email de forma segura.
        </p>
      </div>
      
      <!-- Link alternativo -->
      <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
        ¿El botón no funciona? Copia y pega este link en tu navegador:<br>
        <span style="color: #3b82f6; word-break: break-all;">{{ .ConfirmationURL }}</span>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        <strong>MediTurnos</strong><br>
        Sistema de Gestión de Turnos Médicos
      </p>
    </div>
  </div>
</body>
</html>
```

## 2. Magic Link (Link Mágico)

**Subject:** Tu link de acceso a MediTurnos

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link de acceso</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
  <div style="margin: 20px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background: #0f172a; padding: 24px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 8px;">
        <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 8px; display: inline-block;"></div>
        <span style="color: white; font-size: 20px; font-weight: 700;">MediTurnos</span>
      </div>
    </div>
    
    <!-- Banner -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Accede a tu cuenta</h1>
    </div>
    
    <!-- Contenido -->
    <div style="padding: 32px 24px;">
      <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0;">
        Solicitaste un link para iniciar sesión. Haz clic en el botón para acceder a tu cuenta:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Iniciar sesión
        </a>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0 0; text-align: center;">
        Este link expira en 1 hora. Si no solicitaste este acceso, ignora este email.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        <strong>MediTurnos</strong> - Sistema de Gestión de Turnos Médicos
      </p>
    </div>
  </div>
</body>
</html>
```

## 3. Reset Password (Restablecer Contraseña)

**Subject:** Restablece tu contraseña de MediTurnos

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
  <div style="margin: 20px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
    
    <!-- Header -->
    <div style="background: #0f172a; padding: 24px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 8px;">
        <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 8px; display: inline-block;"></div>
        <span style="color: white; font-size: 20px; font-weight: 700;">MediTurnos</span>
      </div>
    </div>
    
    <!-- Banner -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Restablecer Contraseña</h1>
    </div>
    
    <!-- Contenido -->
    <div style="padding: 32px 24px;">
      <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para crear una nueva contraseña:
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Crear nueva contraseña
        </a>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; margin-top: 24px;">
        <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
          <strong>Importante:</strong> Si no solicitaste este cambio, ignora este email. Tu contraseña actual permanecerá sin cambios.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 12px; margin: 0;">
        <strong>MediTurnos</strong> - Sistema de Gestión de Turnos Médicos
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Cómo configurar los templates en Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Email Templates**
3. Selecciona el template que quieres editar (Confirm signup, Magic Link, etc.)
4. Pega el HTML correspondiente en el campo del template
5. Actualiza el Subject con el texto sugerido
6. Guarda los cambios

Los cambios se aplicarán inmediatamente a los nuevos emails enviados.
