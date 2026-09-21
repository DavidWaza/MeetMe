import { computed, ref, shallowRef } from 'vue'
import type {
  TypeDeckProfile,
  TypeMatchCelebration,
  TypeSwipeAction,
} from '../domain/deck-entities'
import type { TypeDeckNotifierPort, TypeDeckQueryPort } from '../ports/deck-query.port'

/**
 * The deck use case. Takes a `deps` bag and returns plain reactive state —
 * no router, no store, no component imports — so it runs the same under a
 * mock transport, a real one, or a unit test.
 *
 * Swipes are optimistic: the card leaves immediately and comes back only if
 * the backend refuses. A deck that waits on the network between cards feels
 * broken, whatever the latency.
 */
export interface TypeDeckDeps {
  queryPort: TypeDeckQueryPort
  notifier: TypeDeckNotifierPort
}

export interface TypeUseDeckOptions {
  deps: TypeDeckDeps
  pageSize?: number
}

interface TypeHistoryEntry {
  profile: TypeDeckProfile
  action: TypeSwipeAction
}

const DEFAULT_PAGE_SIZE = 10
/** Refill when this few cards remain, so the next page is there before it's needed. */
const REFILL_AT = 3
/** How many cards render in the stack. The rest wait off-DOM. */
const STACK_DEPTH = 3

export default function useDeck(options: TypeUseDeckOptions) {
  const { queryPort, notifier } = options.deps
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE

  const deckQuery = queryPort.useDeckQuery({ limit: () => pageSize, enabled: () => true })
  const swipeMutation = queryPort.useSwipeMutation()
  const undoMutation = queryPort.useUndoMutation()
  const resetMutation = queryPort.useResetMutation()

  /** Swiped this session. Filters the server page so an in-flight swipe can't reappear. */
  const swipedIds = shallowRef(new Set<string>())
  /** Rewound profiles sit on top of the server page until swiped again. */
  const rewound = ref<TypeDeckProfile[]>([])
  const history = ref<TypeHistoryEntry[]>([])
  const celebration = ref<TypeMatchCelebration | null>(null)
  const lastAction = ref<TypeSwipeAction | null>(null)

  const serverProfiles = computed<TypeDeckProfile[]>(() => {
    const response = deckQuery.data.value
    // The envelope check, on the read side.
    if (!response?.status || !Array.isArray(response.data?.profiles)) return []
    return response.data.profiles
  })

  const queue = computed(() => {
    const seen = new Set<string>()
    return [...rewound.value, ...serverProfiles.value].filter((profile) => {
      if (swipedIds.value.has(profile.id) || seen.has(profile.id)) return false
      seen.add(profile.id)
      return true
    })
  })

  const current = computed(() => queue.value[0] ?? null)
  const stack = computed(() => queue.value.slice(0, STACK_DEPTH))
  const isLoading = computed(() => deckQuery.isLoading.value)
  const isEmpty = computed(
    () => !deckQuery.isLoading.value && !deckQuery.isFetching.value && queue.value.length === 0,
  )
  const loadError = computed(() => {
    const response = deckQuery.data.value
    if (deckQuery.error.value) return deckQuery.error.value.message
    if (response && !response.status) return response.message ?? 'Could not load profiles.'
    return null
  })
  const canUndo = computed(() => history.value.length > 0 && !undoMutation.isPending.value)

  function markSwiped(id: string, swiped: boolean): void {
    const next = new Set(swipedIds.value)
    if (swiped) next.add(id)
    else next.delete(id)
    swipedIds.value = next
  }

  function refillIfLow(): void {
    if (queue.value.length <= REFILL_AT && !deckQuery.isFetching.value) {
      queryPort.invalidateDeck()
      void deckQuery.refetch()
    }
  }

  async function swipe(action: TypeSwipeAction): Promise<void> {
    const profile = current.value
    if (!profile) return

    markSwiped(profile.id, true)
    rewound.value = rewound.value.filter((entry) => entry.id !== profile.id)
    history.value = [...history.value, { profile, action }].slice(-20)
    lastAction.value = action

    try {
      const outcome = await swipeMutation.mutate(profile.id, action)
      if (outcome.matched && outcome.matchId) {
        celebration.value = {
          matchId: outcome.matchId,
          profile,
          viaSuperLike: action === 'superlike',
        }
      }
    } catch (error) {
      // Refused: put the card back exactly where it was.
      markSwiped(profile.id, false)
      rewound.value = [profile, ...rewound.value]
      history.value = history.value.filter((entry) => entry.profile.id !== profile.id)
      notifier.error(error, 'That swipe did not go through.')
    }

    refillIfLow()
  }

  async function undo(): Promise<void> {
    const last = history.value.at(-1)
    if (!last) return

    try {
      const restored = (await undoMutation.mutate()) ?? last.profile
      history.value = history.value.slice(0, -1)
      markSwiped(restored.id, false)
      rewound.value = [restored, ...rewound.value.filter((entry) => entry.id !== restored.id)]
      lastAction.value = null
    } catch (error) {
      // The backend won't rewind past a match, so nothing earlier is reachable either.
      history.value = []
      notifier.error(error, 'Could not rewind that swipe.')
    }
  }

  async function reset(): Promise<void> {
    try {
      const cleared = await resetMutation.mutate()
      swipedIds.value = new Set()
      rewound.value = []
      history.value = []
      await deckQuery.refetch()
      notifier.info(cleared ? `Deck refreshed: ${cleared} profiles are back.` : 'Deck refreshed.')
    } catch (error) {
      notifier.error(error, 'Could not reset the deck.')
    }
  }

  function dismissCelebration(): void {
    celebration.value = null
  }

  return {
    current,
    stack,
    isLoading,
    isEmpty,
    loadError,
    canUndo,
    isUndoing: undoMutation.isPending,
    isResetting: resetMutation.isPending,
    celebration,
    lastAction,
    swipe,
    undo,
    reset,
    retry: () => deckQuery.refetch(),
    dismissCelebration,
  }
}

export type TypeUseDeckReturn = ReturnType<typeof useDeck>
