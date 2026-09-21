import { useToastStore } from '@/stores/toasts'
import useDeckQueryAdapter from '../adapters/deck-query-adapter'
import type { TypeDeckDeps } from '../application/use-deck'
import useDeckServiceMock from '../infrastructure/services/deck-service-mock'

/**
 * The only place adapters are named — and so the swap point. Replacing the
 * mock transport with HTTP is the `useDeckServiceMock()` line and nothing else.
 */
export default function useDcDeckDeps(): TypeDeckDeps {
  const toasts = useToastStore()

  return {
    queryPort: useDeckQueryAdapter(useDeckServiceMock()),
    notifier: {
      error: (error, fallback) => toasts.pushError(error, fallback),
      info: (message) => toasts.push({ message, tone: 'neutral', icon: 'info' }),
    },
  }
}
