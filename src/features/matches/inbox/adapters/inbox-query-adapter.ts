import { useQuery } from '@/lib/use-query'
import { inboxQueryKeys } from '../infrastructure/inbox-query-keys'
import type { TypeInboxQueryPort } from '../ports/inbox-query.port'
import type { TypeInboxServicePort } from '../ports/inbox-service.port'

export default function useInboxQueryAdapter(service: TypeInboxServicePort): TypeInboxQueryPort {
  return {
    useMatchesQuery(options) {
      return useQuery({
        key: () => inboxQueryKeys.list(),
        fn: () => service.getMatches(),
        enabled: options.enabled,
        // Kept fresh by the realtime channel, which refetches on every change.
        staleTime: 0,
        keepPreviousData: true,
      })
    },
  }
}
