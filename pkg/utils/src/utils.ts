export const p = <T>(p: Promise<T>): Promise<[null, T] | [Error]> =>
  p.then((data) => [null, data] as [null, T]).catch((err) => [err])

type FetcherOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'POST' | 'PATCH' | 'DELETE'
  body: any
} & RequestInit

type CustomResponse<T = unknown> = {
  message?: string
  data?: T
}

export const fetcher = async <T>(
  url: string,
  options?: FetcherOptions
): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    method: options?.method ?? 'GET',
    credentials: 'include',
    body: options?.body ? JSON.stringify(options.body) : undefined
  })

  const contentType = res.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const isText = contentType?.includes('text')

  const body = isJson
    ? await res.json()
    : isText
      ? await res.text()
      : res.statusText

  if (!res.ok) {
    const message = (body as CustomResponse).message ?? body
    throw new Error(message as string)
  }

  return body as T
}

export enum HTTPText {
  OK = 'OK',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST'
}

export enum HTTPCode {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  BAD_REQUEST = 400
}
