import { computed, onScopeDispose } from 'vue'
import { useToastStore } from '@/stores/toasts'
import useShellQueryAdapter from '../adapters/shell-query-adapter'
import type { TypeIncomingMessage } from '../domain/shell-navigation'
import useShellServiceMock, {
  useShellRealtimeMock,
} from '../infrastructure/services/shell-service-mock'

export interface TypeUseShTabbarOptions {
  /** The conversation on screen, if any — its messages don't need a toast. */
  activeMatchId: () => string | null
  onOpenMatch: (matchId: string) => void
}

const PREVIEW_MAX = 60

/**
 * Small enough that the application layer would only restate this file, so the
 * composition root is the use case. Wiring is still confined to these lines.
 */
export default function useShTabbar(options: TypeUseShTabbarOptions) {
  const queryPort = useShellQueryAdapter(useShellServiceMock())
  const realtime = useShellRealtimeMock()
  const toasts = useToastStore()

  const summaryQuery = queryPort.useSummaryQuery()

  const stopInbox = realtime.onInboxChanged(() => void summaryQuery.refetch())
  const stopMessages = realtime.onIncomingMessage((message: TypeIncomingMessage) => {
    if (message.matchId === options.activeMatchId()) return
    const preview =
      message.preview.length > PREVIEW_MAX
        ? `${message.preview.slice(0, PREVIEW_MAX)}…`
        : message.preview
    toasts.push(
      {
        message: `${message.senderName}: ${preview}`,
        tone: 'accent',
        icon: 'chat',
        action: { label: 'Reply', run: () => options.onOpenMatch(message.matchId) },
      },
      5000,
    )
  })

  onScopeDispose(() => {
    stopInbox()
    stopMessages()
  })

  const inboxBadge = computed(() => {
    const response = summaryQuery.data.value
    if (!response?.status) return 0
    return response.data.unreadTotal + response.data.newMatches
  })

  return { inboxBadge }
}
