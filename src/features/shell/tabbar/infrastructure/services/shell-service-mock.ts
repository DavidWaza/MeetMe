import { transformApiResponse } from '@/lib/api-envelope'
import { matchesApi, subscribeToChannel } from '@/mock-backend'
import type { TypeShellRealtimePort, TypeShellServicePort } from '../../ports/shell.port'

export default function useShellServiceMock(): TypeShellServicePort {
  return {
    async getInboxSummary() {
      return transformApiResponse(await matchesApi.getInboxSummary(), (summary) => ({
        unreadTotal: summary.unread_total,
        newMatches: summary.new_matches,
      }))
    },
  }
}

export function useShellRealtimeMock(): TypeShellRealtimePort {
  return {
    onInboxChanged(handler) {
      return subscribeToChannel((event) => {
        if (event.type === 'inbox' || event.type === 'match') handler()
      })
    },
    onIncomingMessage(handler) {
      return subscribeToChannel((event) => {
        if (event.type !== 'message' || event.message.sender !== 'them') return
        // Something you typed as them yourself is not news to you.
        if (event.message.authored_manually) return
        handler({
          matchId: event.match_id,
          senderName: event.profile_name,
          preview: event.message.body,
        })
      })
    },
  }
}
