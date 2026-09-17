import { describe, expect, it } from 'bun:test'
import {
  ErrorHandler,
  EventLogType,
  getHTTPCode,
  HTTPCode,
  HTTPText,
  maskEmail,
  p
} from './utils'

describe('p (promise tuple helper)', () => {
  it('returns [null, data] when the promise resolves', async () => {
    const [err, data] = await p(Promise.resolve(42))

    expect(err).toBeNull()
    expect(data).toBe(42)
  })

  it('returns [error] when the promise rejects', async () => {
    const boom = new Error('boom')
    const [err, data] = await p(Promise.reject(boom))

    expect(err).toBe(boom)
    expect(data).toBeUndefined()
  })
})

describe('maskEmail', () => {
  it('masks the local part, keeping the first char and domain', () => {
    expect(maskEmail('john.doe@mail.com')).toBe('j***@mail.com')
  })

  it('returns "***" when there is no proper local/domain split', () => {
    expect(maskEmail('not-an-email')).toBe('***')
    expect(maskEmail('@mail.com')).toBe('***')
    expect(maskEmail('local@')).toBe('***')
  })

  it('returns an empty string for non-string input', () => {
    expect(maskEmail(undefined)).toBe('')
    expect(maskEmail(null)).toBe('')
    expect(maskEmail(123)).toBe('')
  })
})

describe('HTTPText / HTTPCode', () => {
  it('exposes matching text and numeric code keys', () => {
    expect(HTTPText.OK).toBe('OK')
    expect(HTTPCode.OK).toBe(200)
    expect(HTTPCode.UNAUTHORIZED).toBe(401)
    expect(HTTPCode.INTERNAL_SERVER_ERROR).toBe(500)

    // Every text key should have a corresponding code key.
    for (const key of Object.keys(HTTPText)) {
      expect(HTTPCode).toHaveProperty(key)
    }
  })
})

describe('getHTTPCode', () => {
  it('maps a known text key to its numeric code', () => {
    expect(getHTTPCode('NOT_FOUND')).toBe(404)
    expect(getHTTPCode('BAD_REQUEST')).toBe(400)
  })
})

describe('ErrorHandler', () => {
  it('is an Error subclass carrying message, code and reason', () => {
    const err = new ErrorHandler('nope', 'UNAUTHORIZED', 'missing session')

    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ErrorHandler)
    expect(err.message).toBe('nope')
    expect(err.code).toBe('UNAUTHORIZED')
    expect(err.reason).toBe('missing session')
  })

  it('allows the reason to be omitted', () => {
    const err = new ErrorHandler('bad', 'BAD_REQUEST')

    expect(err.code).toBe('BAD_REQUEST')
    expect(err.reason).toBeUndefined()
  })
})

describe('EventLogType', () => {
  it('exposes the known audit event types', () => {
    expect(EventLogType.USER_CREATED).toBe('USER_CREATED')
    expect(EventLogType.USER_LOGGED_IN).toBe('USER_LOGGED_IN')
    expect(EventLogType.USER_UPDATED).toBe('USER_UPDATED')
    expect(EventLogType.USER_DELETED).toBe('USER_DELETED')
  })
})
