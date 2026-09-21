/**
 * The response envelope every "service" answers with, and the one helper that
 * keeps a refusal from reading as a success.
 *
 * There is no backend in this build — `infrastructure/*-service-adapter.ts`
 * files resolve against a local mock — but the envelope is here from day one on
 * purpose. It is the single contract a real transport would have to satisfy,
 * and retrofitting it means auditing every call site.
 */
export interface TypePaginationMeta {
  page: number
  limit: number
  total: number
}

export interface TypeApiResponse<T> {
  /** `false` means the operation was refused; read `message`. */
  status: boolean
  data: T
  message?: string
  meta?: TypePaginationMeta
}

export function apiOk<T>(data: T, meta?: TypePaginationMeta): TypeApiResponse<T> {
  return meta ? { status: true, data, meta } : { status: true, data }
}

export function apiFail<T>(message: string, data: T): TypeApiResponse<T> {
  return { status: false, data, message }
}

/**
 * The read-side guard. A refusal arrives on a perfectly good HTTP 200, so a
 * call site that only asks "did a response come back?" shows a green tick over
 * a rejection.
 *
 * Throws rather than returning a flag, which leaves each existing `catch` in
 * charge of presentation.
 */
export function unwrapApiResponse<T>(
  response: TypeApiResponse<T> | undefined,
  fallback: string,
): TypeApiResponse<T> {
  // `undefined` is not an API answer — it means the request never completed.
  if (!response) throw new Error(fallback)
  if (!response.status) throw new Error(response.message?.trim() || fallback)
  return response
}

/**
 * Maps an envelope's `data` through a transformer, keeping `status`, `message`
 * and `meta` intact. A refusal passes through with its data still mapped, so the
 * caller's `unwrapApiResponse` sees the real message.
 */
export function transformApiResponse<TApi, TDto>(
  response: TypeApiResponse<TApi>,
  transform: (data: TApi) => TDto,
): TypeApiResponse<TDto> {
  return { ...response, data: transform(response.data) }
}
