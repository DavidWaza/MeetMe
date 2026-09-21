import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeInboxMatch } from '../domain/inbox-entities'

export interface TypeInboxServicePort {
  getMatches: () => Promise<TypeApiResponse<TypeInboxMatch[]>>
}

/** Push notifications from the backend. Mock: the in-process channel. */
export interface TypeInboxRealtimePort {
  onInboxChanged: (handler: () => void) => () => void
}
