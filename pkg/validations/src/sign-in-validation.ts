import { z } from 'zod'

export const passwordSchema = z
  .string({ error: 'Password required.' })
  .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/, {
    error:
      'Password should have at least 12 character(s), 1 uppercase, 1 lowercase, 1 number, and 1 symbol.'
  })

// Sign-in only checks presence: complexity rules belong to sign-up, and
// rejecting here would lock out accounts created under an older policy.
export const signInValidation = z.object({
  email: z
    .email({ error: 'Email invalid.' })
    .min(1, { error: 'Email is required' }),
  password: z
    .string({ error: 'Password required.' })
    .min(1, { error: 'Password required.' })
})

export type SignInValidation = z.infer<typeof signInValidation>
