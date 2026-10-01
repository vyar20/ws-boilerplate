import { z } from 'zod'
import { passwordSchema, signInValidation } from './sign-in-validation'

export const signUpValidation = signInValidation.extend({
  name: z
    .string({ error: 'Name is required.' })
    .min(1, { error: 'Name is required.' }),
  password: passwordSchema
})

export type SignUpValidation = z.infer<typeof signUpValidation>
