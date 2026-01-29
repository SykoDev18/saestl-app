import { z } from 'zod'

export const eventSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional().nullable(),
  event_type: z.string().max(50, 'El tipo no puede exceder 50 caracteres').optional().nullable(),
  event_date: z.coerce.date(),
  location: z.string().max(255, 'La ubicación no puede exceder 255 caracteres').optional().nullable(),
  ticket_price: z
    .number()
    .nonnegative('El precio no puede ser negativo')
    .optional()
    .nullable(),
  max_capacity: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0')
    .optional()
    .nullable(),
  registration_deadline: z.coerce.date().optional().nullable(),
})

export type EventInput = z.infer<typeof eventSchema>

export const eventRegistrationSchema = z.object({
  event_id: z.string().uuid('ID de evento inválido'),
  participant_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  participant_email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  participant_phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  payment_status: z.enum(['paid', 'pending']).default('pending'),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional().nullable(),
})

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>
