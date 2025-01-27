import { z } from 'zod'

export const formSchema = z.object({
  code: z.string().length(6)
})

export type FormSchema = typeof formSchema
