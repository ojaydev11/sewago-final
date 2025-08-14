import { z } from 'zod'

export const bookingSchema = z.object({
  serviceId: z.string().min(1),
  time: z.string().datetime().or(z.string().min(10)),
  address: z.string().min(5),
  notes: z.string().optional(),
  total: z.coerce.number().int().min(0).default(0)
})

export type BookingInput = z.infer<typeof bookingSchema>
