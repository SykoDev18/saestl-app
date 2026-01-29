import { z } from 'zod'

export const raffleSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  description: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional().nullable(),
  ticket_price: z
    .number()
    .positive('El precio debe ser mayor a 0'),
  total_tickets: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0'),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  draw_date: z.coerce.date().optional().nullable(),
  prize_description: z.string().max(1000, 'La descripción del premio no puede exceder 1000 caracteres').optional().nullable(),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
  path: ['end_date'],
})

export type RaffleInput = z.infer<typeof raffleSchema>

export const raffleTicketSchema = z.object({
  raffle_id: z.string().uuid('ID de rifa inválido'),
  ticket_number: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser mayor a 0'),
  buyer_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  buyer_phone: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional().nullable(),
  buyer_email: z.string().email('Email inválido').optional().nullable(),
  sale_date: z.coerce.date(),
  payment_status: z.enum(['paid', 'pending']).default('paid'),
})

export type RaffleTicketInput = z.infer<typeof raffleTicketSchema>

export const batchTicketSaleSchema = z.object({
  raffle_id: z.string().uuid('ID de rifa inválido'),
  ticket_numbers: z.array(z.number().int().positive()).min(1, 'Selecciona al menos un boleto'),
  buyer_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  buyer_phone: z.string().optional().nullable(),
  buyer_email: z.string().email('Email inválido').optional().nullable(),
  sale_date: z.coerce.date(),
  payment_status: z.enum(['paid', 'pending']).default('paid'),
})

export type BatchTicketSaleInput = z.infer<typeof batchTicketSaleSchema>
