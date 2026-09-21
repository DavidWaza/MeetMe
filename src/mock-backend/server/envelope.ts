/**
 * Re-exports so every endpoint file imports its wire types and envelope from
 * one place. The server side of the contract, as it were.
 */
export type * from '@/api/types'
export type { TypeApiResponse as ApiResponse } from '@/lib/api-envelope'
export { apiFail, apiOk } from '@/lib/api-envelope'

/**
 * What crossing a network does to a payload: a deep, plain-data copy.
 *
 * Every endpoint that accepts an object runs it through this first. Without
 * it the "server" would store the caller's live objects — including Vue
 * reactive proxies — and later mutations on the client would silently rewrite
 * the database (or `structuredClone` would throw on the proxy).
 */
export function fromWire<T>(payload: T): T {
  return JSON.parse(JSON.stringify(payload)) as T
}
