import useInboxQueryAdapter from '../adapters/inbox-query-adapter'
import type { TypeInboxDeps } from '../application/use-inbox'
import useInboxServiceMock, {
  useInboxRealtimeMock,
} from '../infrastructure/services/inbox-service-mock'

/** The swap point: the two `*Mock()` calls are the only lines a real transport changes. */
export default function useMtInboxDeps(): TypeInboxDeps {
  return {
    queryPort: useInboxQueryAdapter(useInboxServiceMock()),
    realtime: useInboxRealtimeMock(),
  }
}
