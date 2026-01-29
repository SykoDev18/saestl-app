import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0'),
  category_id: z.string().uuid('Selecciona una categoría válida').optional().nullable(),
  description: z
    .string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  date: z.coerce.date(),
  payment_method: z.string().optional().nullable(),
  receipt_url: z.string().url('URL inválida').optional().nullable(),
  responsible_user_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional().nullable(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

export const transactionFilterSchema = z.object({
  type: z.enum(['income', 'expense', 'all']).optional(),
  category_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search: z.string().optional(),
})

export type TransactionFilter = z.infer<typeof transactionFilterSchema>
