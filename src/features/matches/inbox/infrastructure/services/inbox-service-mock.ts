import { transformApiResponse } from '@/lib/api-envelope'
import { matchesApi, subscribeToChannel } from '@/mock-backend'
import type { TypeInboxRealtimePort, TypeInboxServicePort } from '../../ports/inbox-service.port'
import { toInboxMatch } from '../transformers/inbox-transformer'

export default function useInboxServiceMock(): TypeInboxServicePort {
  return {
    async getMatches() {
      return transformApiResponse(await matchesApi.getMatches(), (matches) =>
        matches.map(toInboxMatch),
      )
    },
  }
}

export function useInboxRealtimeMock(): TypeInboxRealtimePort {
  return {
    onInboxChanged(handler) {
      return subscribeToChannel((event) => {
        if (event.type === 'inbox') handler()
      })
    },
  }
}
