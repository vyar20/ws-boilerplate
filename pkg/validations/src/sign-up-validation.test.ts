import { describe, expect, test } from 'bun:test'
import { signUpValidation } from './sign-up-validation'

describe('signUpValidation', () => {
  describe('name', () => {
    test('name valid', () => {
      const success = signUpValidation.shape.name.safeParse('john doe').success

      expect(success).toBe(true)
    })

    test('name empty', () => {
      const success = signUpValidation.shape.name.safeParse('').success

      expect(success).toBe(false)
    })
  })

  describe('full object', () => {
    test('valid sign-up passes', () => {
      const success = signUpValidation.safeParse({
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'Password1234!'
      }).success

      expect(success).toBe(true)
    })

    test('missing name fails', () => {
      const success = signUpValidation.safeParse({
        email: 'john@mail.com',
        password: 'Password1234!'
      }).success

      expect(success).toBe(false)
    })

    test('inherits the password policy (weak password fails)', () => {
      const success = signUpValidation.safeParse({
        name: 'John Doe',
        email: 'john@mail.com',
        password: 'weak'
      }).success

      expect(success).toBe(false)
    })
  })
})
