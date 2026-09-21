import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref, shallowRef } from 'vue'
import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeMutationResult, TypeQueryResult } from '@/lib/use-query'
import type {
  TypeDeckPage,
  TypeDeckProfile,
  TypeSwipeAction,
  TypeSwipeOutcome,
} from '../../domain/deck-entities'
import type { TypeDeckNotifierPort, TypeDeckQueryPort } from '../../ports/deck-query.port'
import useDeck from '../use-deck'

/**
 * The use case runs against a hand-rolled port: no transport, no timers, no
 * Vue components. This is the payoff of the deps bag.
 */

function profile(id: string): TypeDeckProfile {
  return {
    id,
    name: id.toUpperCase(),
    age: 30,
    pronouns: null,
    bio: '',
    jobLabel: null,
    school: null,
    city: 'Lagos',
    distanceKm: 5,
    heightCm: null,
    interests: [],
    prompts: [],
    photos: ['x'],
    photoCredit: null,
    presence: 'online',
    verification: 'verified',
    lastActiveAt: '2026-01-01T00:00:00',
  }
}

function mutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): TypeMutationResult<TArgs, TResult> {
  return { mutate: fn, isPending: ref(false), error: shallowRef(undefined) }
}

function setup(options: {
  profiles: TypeDeckProfile[]
  swipe?: (id: string, action: TypeSwipeAction) => Promise<TypeSwipeOutcome>
  undo?: () => Promise<TypeDeckProfile | null>
}) {
  const data = shallowRef<TypeApiResponse<TypeDeckPage> | undefined>({
    status: true,
    data: { profiles: options.profiles, remaining: 0 },
  })
  const deckQuery: TypeQueryResult<TypeApiResponse<TypeDeckPage>> = {
    data,
    error: shallowRef(undefined),
    isLoading: ref(false),
    isFetching: ref(false),
    refetch: vi.fn<() => Promise<void>>(async () => {}),
  }

  const notifier: TypeDeckNotifierPort = {
    error: vi.fn<TypeDeckNotifierPort['error']>(),
    info: vi.fn<TypeDeckNotifierPort['info']>(),
  }
  const queryPort: TypeDeckQueryPort = {
    useDeckQuery: () => deckQuery,
    useSwipeMutation: () =>
      mutation(options.swipe ?? (async () => ({ matched: false, matchId: null }))),
    useUndoMutation: () => mutation(options.undo ?? (async () => null)),
    useResetMutation: () => mutation(async () => 0),
    invalidateDeck: vi.fn<() => void>(),
  }

  const scope = effectScope()
  const deck = scope.run(() => useDeck({ deps: { queryPort, notifier } }))!
  return { deck, notifier, deckQuery, scope }
}

describe('useDeck', () => {
  it('stacks the first three profiles with the first on top', () => {
    const { deck } = setup({ profiles: ['a', 'b', 'c', 'd'].map(profile) })
    expect(deck.current.value?.id).toBe('a')
    expect(deck.stack.value.map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })

  it('removes the card optimistically, before the backend answers', async () => {
    let resolve!: (outcome: TypeSwipeOutcome) => void
    const { deck } = setup({
      profiles: ['a', 'b'].map(profile),
      swipe: () => new Promise((r) => (resolve = r)),
    })

    const pending = deck.swipe('like')
    expect(deck.current.value?.id).toBe('b')

    resolve({ matched: false, matchId: null })
    await pending
    expect(deck.current.value?.id).toBe('b')
  })

  it('celebrates a match with the swiped profile', async () => {
    const { deck } = setup({
      profiles: ['a', 'b'].map(profile),
      swipe: async () => ({ matched: true, matchId: 'm1' }),
    })
    await deck.swipe('superlike')
    expect(deck.celebration.value).toMatchObject({ matchId: 'm1', viaSuperLike: true })
    expect(deck.celebration.value?.profile.id).toBe('a')
  })

  it('puts a refused swipe back on top and surfaces the reason', async () => {
    const { deck, notifier } = setup({
      profiles: ['a', 'b'].map(profile),
      swipe: async () => {
        throw new Error('You have already swiped on this profile.')
      },
    })
    await deck.swipe('like')
    expect(deck.current.value?.id).toBe('a')
    expect(notifier.error).toHaveBeenCalledOnce()
    expect(deck.canUndo.value).toBe(false)
  })

  it('rewinds the last swipe onto the top of the stack', async () => {
    const a = profile('a')
    const { deck } = setup({ profiles: [a, profile('b')], undo: async () => a })
    await deck.swipe('pass')
    expect(deck.current.value?.id).toBe('b')
    expect(deck.canUndo.value).toBe(true)

    await deck.undo()
    expect(deck.current.value?.id).toBe('a')
    expect(deck.canUndo.value).toBe(false)
  })

  it('clears rewind history when the backend refuses to rewind a match', async () => {
    const { deck, notifier } = setup({
      profiles: ['a', 'b'].map(profile),
      undo: async () => {
        throw new Error('You cannot rewind a match.')
      },
    })
    await deck.swipe('like')
    await deck.undo()
    expect(notifier.error).toHaveBeenCalledOnce()
    expect(deck.canUndo.value).toBe(false)
  })

  it('reports an envelope refusal on the read side as a load error, not an empty deck', async () => {
    const { deck, deckQuery } = setup({ profiles: [] })
    deckQuery.data.value = { status: false, data: { profiles: [], remaining: 0 }, message: 'Nope' }
    await nextTick()
    expect(deck.loadError.value).toBe('Nope')
  })

  it('asks for more cards when the stack runs low', async () => {
    const { deck, deckQuery } = setup({ profiles: ['a', 'b'].map(profile) })
    await deck.swipe('pass')
    expect(deckQuery.refetch).toHaveBeenCalled()
  })
})
