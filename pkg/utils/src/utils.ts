export const p = <T>(p: Promise<T>): Promise<[null, T] | [Error]> =>
  p.then((data) => [null, data] as [null, T]).catch((err) => [err])

// Mask an email for logging so PII is not stored in plaintext logs,
// while keeping just enough (first char + domain) for audit correlation.
// e.g. "john.doe@mail.com" -> "j***@mail.com"
export const maskEmail = (email: unknown): string => {
  if (typeof email !== 'string') return ''
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  return `${local[0]}***@${domain}`
}

export const HTTPText = {
  OK: 'OK',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  BAD_REQUEST: 'BAD_REQUEST'
} as const

export const HTTPCode = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400
} as const

export const getHTTPCode = (httpText: keyof typeof HTTPText) =>
  HTTPCode[httpText] ?? 500

export class ErrorHandler extends Error {
  message: string
  reason: unknown
  code: keyof typeof HTTPCode
  constructor(message: string, code: keyof typeof HTTPCode, reason?: unknown) {
    super()
    this.message = message
    this.code = code
    this.reason = reason
  }
}

export const EventLogType = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_LOGGED_IN: 'USER_LOGGED_IN'
} as const
