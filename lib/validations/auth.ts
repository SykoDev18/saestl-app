import { z } from 'zod'

// Dominio institucional permitido
const ALLOWED_EMAIL_DOMAIN = '@uaeh.edu.mx'

// Validación personalizada para correo institucional
const institutionalEmailValidation = z
  .string()
  .min(1, 'El email es requerido')
  .email('Email inválido')
  .refine(
    (email) => email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN),
    `Solo se permite iniciar sesión con correo institucional (${ALLOWED_EMAIL_DOMAIN})`
  )

export const loginSchema = z.object({
  email: institutionalEmailValidation,
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signUpSchema = z.object({
  email: institutionalEmailValidation,
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  phone: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type SignUpInput = z.infer<typeof signUpSchema>

export const forgotPasswordSchema = z.object({
  email: institutionalEmailValidation,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
