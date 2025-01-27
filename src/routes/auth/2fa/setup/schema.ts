import { z } from 'zod'

export const formSchema = z.object({
  key: z.string().length(28),
  code: z.string().length(6)
})

export type FormSchema = typeof formSchema
