import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeQueryResult } from '@/lib/use-query'
import type { TypeInboxMatch } from '../domain/inbox-entities'

export interface TypeInboxQueryOptions {
  enabled: () => boolean
}

export interface TypeInboxQueryPort {
  useMatchesQuery: (
    options: TypeInboxQueryOptions,
  ) => TypeQueryResult<TypeApiResponse<TypeInboxMatch[]>>
}
