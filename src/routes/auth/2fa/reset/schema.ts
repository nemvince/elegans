import { z } from 'zod'

export const formSchema = z.object({
  code: z.string().length(16)
})

export type FormSchema = typeof formSchema
