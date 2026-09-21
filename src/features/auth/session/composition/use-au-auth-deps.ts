import { useSessionStore } from '@/stores/session'
import { useToastStore } from '@/stores/toasts'
import useAuthMutationAdapter from '../adapters/auth-mutation-adapter'
import type { TypeAuthDeps } from '../application/use-auth'
import useAuthServiceMock from '../infrastructure/services/auth-service-mock'

/** The swap point: a real auth API replaces `useAuthServiceMock()` and nothing else. */
export default function useAuAuthDeps(): TypeAuthDeps {
  const sessionStore = useSessionStore()
  const toasts = useToastStore()

  return {
    mutationPort: useAuthMutationAdapter(useAuthServiceMock()),
    session: { set: (user) => sessionStore.setUser(user) },
    notifier: { success: (message) => toasts.push({ message, tone: 'success', icon: 'check' }) },
  }
}
