import { describe, expect, it } from 'bun:test'
import { signUpValidation } from './sign-up-validation'

const VALID_PASSWORD = 'Password1234!'

describe('signUpValidation', () => {
  it('accepts a valid name + email + password', () => {
    const result = signUpValidation.safeParse({
      name: 'John Doe',
      email: 'john.doe@mail.com',
      password: VALID_PASSWORD
    })

    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = signUpValidation.safeParse({
      name: '',
      email: 'john.doe@mail.com',
      password: VALID_PASSWORD
    })

    expect(result.success).toBe(false)
  })

  it('requires the name field on top of the sign-in shape', () => {
    const result = signUpValidation.safeParse({
      email: 'john.doe@mail.com',
      password: VALID_PASSWORD
    })

    expect(result.success).toBe(false)
  })

  it('still enforces the shared email rule', () => {
    const result = signUpValidation.safeParse({
      name: 'John Doe',
      email: 'not-an-email',
      password: VALID_PASSWORD
    })

    expect(result.success).toBe(false)
  })

  it('keeps the strict password policy that sign-in no longer applies', () => {
    const result = signUpValidation.safeParse({
      name: 'John Doe',
      email: 'john.doe@mail.com',
      password: 'weak'
    })

    expect(result.success).toBe(false)
  })
})
