import { describe, expect, it } from 'bun:test'
import { passwordSchema, signInValidation } from './sign-in-validation'

const VALID_PASSWORD = 'Password1234!'

describe('passwordSchema', () => {
  it('accepts a password meeting every rule', () => {
    expect(passwordSchema.safeParse(VALID_PASSWORD).success).toBe(true)
  })

  it('rejects a password shorter than 12 characters', () => {
    // Meets every character-class rule but only 8 chars long.
    expect(passwordSchema.safeParse('Pass12!a').success).toBe(false)
  })

  it('rejects when a required character class is missing', () => {
    expect(passwordSchema.safeParse('password1234!').success).toBe(false) // no uppercase
    expect(passwordSchema.safeParse('PASSWORD1234!').success).toBe(false) // no lowercase
    expect(passwordSchema.safeParse('Passwordabcd!').success).toBe(false) // no number
    expect(passwordSchema.safeParse('Password12345').success).toBe(false) // no symbol
  })

  it('rejects a non-string value', () => {
    expect(passwordSchema.safeParse(undefined).success).toBe(false)
  })
})

describe('signInValidation', () => {
  it('accepts a valid email + password', () => {
    const result = signInValidation.safeParse({
      email: 'john.doe@mail.com',
      password: VALID_PASSWORD
    })

    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = signInValidation.safeParse({
      email: 'not-an-email',
      password: VALID_PASSWORD
    })

    expect(result.success).toBe(false)
  })

  it('rejects a weak password', () => {
    const result = signInValidation.safeParse({
      email: 'john.doe@mail.com',
      password: 'weak'
    })

    expect(result.success).toBe(false)
  })
})
