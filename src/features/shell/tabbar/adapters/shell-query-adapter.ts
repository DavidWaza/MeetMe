import { useQuery } from '@/lib/use-query'
import type { TypeShellQueryPort, TypeShellServicePort } from '../ports/shell.port'

export const SHELL_QUERY_ROOT = 'shell/tabbar'

export default function useShellQueryAdapter(service: TypeShellServicePort): TypeShellQueryPort {
  return {
    useSummaryQuery() {
      return useQuery({
        key: () => `${SHELL_QUERY_ROOT}/summary`,
        fn: () => service.getInboxSummary(),
        staleTime: 0,
        keepPreviousData: true,
      })
    },
  }
}
