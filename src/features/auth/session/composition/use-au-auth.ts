import useAuth from '../application/use-auth'
import useAuAuthDeps from './use-au-auth-deps'

export default function useAuAuth() {
  return useAuth({ deps: useAuAuthDeps() })
}

/**
 * Asks the backend who is signed in and records it. The router guard calls
 * this once, before the first navigation resolves.
 */
export function restoreAuSession() {
  return useAuAuth().restore()
}
