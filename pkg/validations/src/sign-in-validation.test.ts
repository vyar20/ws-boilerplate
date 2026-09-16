import { describe, expect, test } from 'bun:test'
import { signInValidation } from './sign-in-validation'

describe('signInValidation', () => {
  describe('email', () => {
    test('email valid', () => {
      const success =
        signInValidation.shape.email.safeParse('test@mail.com').success

      expect(success).toBe(true)
    })

    test('email invalid', () => {
      const success =
        signInValidation.shape.email.safeParse('testmail.com').success

      expect(success).toBe(false)
    })

    test('email empty', () => {
      const success = signInValidation.shape.email.safeParse('').success

      expect(success).toBe(false)
    })
  })

  describe('password', () => {
    test('password valid', () => {
      const success =
        signInValidation.shape.password.safeParse('Password1234!').success

      expect(success).toBe(true)
    })

    test('password less than 12 char', () => {
      const success =
        signInValidation.shape.password.safeParse('Password123').success

      expect(success).toBe(false)
    })

    test('password without uppercase', () => {
      const success =
        signInValidation.shape.password.safeParse('password1234!').success

      expect(success).toBe(false)
    })

    test('password without lowercase', () => {
      const success =
        signInValidation.shape.password.safeParse('PASSWORD1234!').success

      expect(success).toBe(false)
    })

    test('password without number', () => {
      const success =
        signInValidation.shape.password.safeParse('Passwordddddd!').success

      expect(success).toBe(false)
    })

    test('password without symbol', () => {
      const success =
        signInValidation.shape.password.safeParse('Password1234').success

      expect(success).toBe(false)
    })

    test('password empty', () => {
      const success = signInValidation.shape.password.safeParse('').success

      expect(success).toBe(false)
    })
  })

  describe('full object', () => {
    test('valid credentials pass', () => {
      const success = signInValidation.safeParse({
        email: 'john@mail.com',
        password: 'Password1234!'
      }).success

      expect(success).toBe(true)
    })

    test('invalid email fails the whole object', () => {
      const success = signInValidation.safeParse({
        email: 'not-an-email',
        password: 'Password1234!'
      }).success

      expect(success).toBe(false)
    })
  })
})
