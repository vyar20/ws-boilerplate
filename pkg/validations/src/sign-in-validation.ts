import { z } from 'zod'

export const passwordSchema = z
  .string({ error: 'Password required.' })
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/, {
    error:
      'Password should have at least 12 character(s), 1 uppercase, 1 lowercase, 1 number, and 1 symbol.'
  })

export const signInValidation = z.object({
  email: z
    .email({ error: 'Email invalid.' })
    .min(1, { error: 'Email is required' }),
  password: passwordSchema
})

export type SignInValidation = z.infer<typeof signInValidation>
