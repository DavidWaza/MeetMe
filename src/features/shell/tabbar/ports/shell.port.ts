import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeQueryResult } from '@/lib/use-query'
import type { TypeInboxSummary, TypeIncomingMessage } from '../domain/shell-navigation'

export interface TypeShellServicePort {
  getInboxSummary: () => Promise<TypeApiResponse<TypeInboxSummary>>
}

export interface TypeShellRealtimePort {
  onInboxChanged: (handler: () => void) => () => void
  onIncomingMessage: (handler: (message: TypeIncomingMessage) => void) => () => void
}

export interface TypeShellQueryPort {
  useSummaryQuery: () => TypeQueryResult<TypeApiResponse<TypeInboxSummary>>
}
