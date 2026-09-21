import { computed, onScopeDispose, ref } from 'vue'
import { resolveStatus } from '@/utils/status'
import {
  INBOX_DEFAULT_FILTER_ID,
  INBOX_FILTER_STATES,
  INBOX_FILTERS,
  type TypeInboxFilterId,
  type TypeInboxMatch,
} from '../domain/inbox-entities'
import type { TypeInboxQueryPort } from '../ports/inbox-query.port'
import type { TypeInboxRealtimePort } from '../ports/inbox-service.port'

export interface TypeInboxDeps {
  queryPort: TypeInboxQueryPort
  realtime: TypeInboxRealtimePort
}

export interface TypeUseInboxOptions {
  deps: TypeInboxDeps
  initialFilterId?: TypeInboxFilterId
}

export default function useInbox(options: TypeUseInboxOptions) {
  const { queryPort, realtime } = options.deps

  const activeFilterId = ref<TypeInboxFilterId>(options.initialFilterId ?? INBOX_DEFAULT_FILTER_ID)
  const search = ref('')

  const matchesQuery = queryPort.useMatchesQuery({ enabled: () => true })

  // New match, new message, read receipt: the backend says "inbox changed" and
  // the list refetches. Unsubscribed with the component's effect scope.
  const unsubscribe = realtime.onInboxChanged(() => void matchesQuery.refetch())
  onScopeDispose(unsubscribe)

  const all = computed<TypeInboxMatch[]>(() => {
    const response = matchesQuery.data.value
    if (!response?.status || !Array.isArray(response.data)) return []
    return response.data
  })

  const searched = computed(() => {
    const needle = search.value.trim().toLowerCase()
    return needle
      ? all.value.filter((match) => match.name.toLowerCase().includes(needle))
      : all.value
  })

  /** Matched but nobody has spoken: the carousel. */
  const newMatches = computed(() => searched.value.filter((match) => !match.lastMessage))

  const conversations = computed(() => searched.value.filter((match) => match.lastMessage))

  function passes(match: TypeInboxMatch, filterId: TypeInboxFilterId): boolean {
    if (filterId === 'all') return true
    if (filterId === 'unread') return match.unreadCount > 0
    const admitted: readonly string[] = INBOX_FILTER_STATES[filterId]
    return admitted.includes(resolveStatus(match.connectionState, 'connection'))
  }

  const filteredConversations = computed(() =>
    conversations.value.filter((match) => passes(match, activeFilterId.value)),
  )

  const chips = computed(() =>
    INBOX_FILTERS.map((filter) => ({
      ...filter,
      count: conversations.value.filter((match) => passes(match, filter.id)).length,
    })),
  )

  const loadError = computed(() => {
    const response = matchesQuery.data.value
    if (matchesQuery.error.value) return matchesQuery.error.value.message
    if (response && !response.status) return response.message ?? 'Could not load your matches.'
    return null
  })

  return {
    chips,
    activeFilterId,
    search,
    newMatches,
    conversations: filteredConversations,
    hasAnyMatches: computed(() => all.value.length > 0),
    hasAnyConversations: computed(() => conversations.value.length > 0),
    isLoading: matchesQuery.isLoading,
    loadError,
    onSelectFilter: (id: TypeInboxFilterId) => (activeFilterId.value = id),
    retry: () => matchesQuery.refetch(),
  }
}
