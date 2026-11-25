export const p = <T>(promise: Promise<T>): Promise<[null, T] | [Error]> =>
  promise.then((data) => [null, data] as [null, T]).catch((err) => [err])
