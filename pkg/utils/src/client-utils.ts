export const p = <T>(promise: Promise<T>): Promise<[null, T] | [Error]> =>
  promise.then((data) => [null, data] as [null, T]).catch((err) => [err])

export const HTTPStatus = {
  OK: 'OK',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

export const HTTPCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const

export class ErrorHandler extends Error {
  readonly reason: unknown
  readonly status: keyof typeof HTTPStatus
  readonly code: (typeof HTTPCode)[keyof typeof HTTPCode]
  constructor(
    message: string,
    status: keyof typeof HTTPStatus,
    reason?: unknown
  ) {
    super()
    this.message = message
    this.status = status
    this.code = HTTPCode[status]
    this.reason = reason
  }
}
