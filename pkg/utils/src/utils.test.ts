import { describe, expect, test } from 'bun:test'
import {
  ErrorHandler,
  EventLogType,
  getHTTPCode,
  HTTPCode,
  HTTPText,
  maskEmail,
  p
} from './utils'

describe('p', () => {
  test('returns [null, data] when promise resolves', async () => {
    const result = await p(Promise.resolve('success'))

    expect(result).toEqual([null, 'success'])
  })

  test('returns [error] when promise rejects', async () => {
    const error = new Error('something went wrong')

    const result = await p(Promise.reject(error))

    expect(result).toEqual([error])
  })
})

describe('maskEmail', () => {
  test('masks email local part', () => {
    expect(maskEmail('john.doe@mail.com')).toBe('j***@mail.com')
  })

  test('returns empty string for non-string value', () => {
    expect(maskEmail(null)).toBe('')
    expect(maskEmail(undefined)).toBe('')
    expect(maskEmail(123)).toBe('')
  })

  test('returns *** for invalid email without local part', () => {
    expect(maskEmail('@mail.com')).toBe('***')
  })

  test('returns *** for invalid email without domain', () => {
    expect(maskEmail('john')).toBe('***')
  })
})

describe('getHTTPCode', () => {
  test('returns correct HTTP code', () => {
    expect(getHTTPCode('OK')).toBe(200)
    expect(getHTTPCode('INTERNAL_SERVER_ERROR')).toBe(500)
    expect(getHTTPCode('NOT_FOUND')).toBe(404)
    expect(getHTTPCode('UNAUTHORIZED')).toBe(401)
    expect(getHTTPCode('BAD_REQUEST')).toBe(400)
  })
})

describe('ErrorHandler', () => {
  test('creates an ErrorHandler with message, code, and reason', () => {
    const reason = { field: 'email' }

    const error = new ErrorHandler('Invalid email', 'BAD_REQUEST', reason)

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Invalid email')
    expect(error.code).toBe('BAD_REQUEST')
    expect(error.reason).toBe(reason)
  })

  test('reason is optional', () => {
    const error = new ErrorHandler('Unauthorized', 'UNAUTHORIZED')

    expect(error.reason).toBeUndefined()
  })
})

describe('maskEmail (additional edge cases)', () => {
  test('masks a short email', () => {
    expect(maskEmail('a@b.co')).toBe('a***@b.co')
  })

  test('returns *** for email without domain (trailing @)', () => {
    expect(maskEmail('john@')).toBe('***')
  })

  test('returns *** for empty string', () => {
    expect(maskEmail('')).toBe('***')
  })
})

describe('HTTP constants', () => {
  test('HTTPCode maps names to status codes', () => {
    expect(HTTPCode.OK).toBe(200)
    expect(HTTPCode.BAD_REQUEST).toBe(400)
    expect(HTTPCode.UNAUTHORIZED).toBe(401)
    expect(HTTPCode.NOT_FOUND).toBe(404)
    expect(HTTPCode.INTERNAL_SERVER_ERROR).toBe(500)
  })

  test('HTTPText keys mirror their string values', () => {
    expect(HTTPText.OK).toBe('OK')
    expect(HTTPText.NOT_FOUND).toBe('NOT_FOUND')
    expect(HTTPText.INTERNAL_SERVER_ERROR).toBe('INTERNAL_SERVER_ERROR')
  })
})

describe('EventLogType', () => {
  test('exposes the expected event names', () => {
    expect(EventLogType.USER_CREATED).toBe('USER_CREATED')
    expect(EventLogType.USER_UPDATED).toBe('USER_UPDATED')
    expect(EventLogType.USER_DELETED).toBe('USER_DELETED')
    expect(EventLogType.USER_LOGGED_IN).toBe('USER_LOGGED_IN')
  })
})
