import { useToastStore } from '@/stores/toasts'
import useChatQueryAdapter from '../adapters/chat-query-adapter'
import type { TypeConversationDeps } from '../application/use-conversation'
import useChatServiceMock, {
  useChatRealtimeMock,
} from '../infrastructure/services/chat-service-mock'

/**
 * The swap point. `useChatRealtimeMock()` is where a WebSocket (or SSE, or a
 * poll loop) adapter would go; nothing above this file would notice.
 */
export default function useChConversationDeps(): TypeConversationDeps {
  const toasts = useToastStore()

  return {
    queryPort: useChatQueryAdapter(useChatServiceMock()),
    realtime: useChatRealtimeMock(),
    notifier: {
      error: (error, fallback) => toasts.pushError(error, fallback),
      success: (message) => toasts.push({ message, tone: 'success', icon: 'check' }),
    },
  }
}
