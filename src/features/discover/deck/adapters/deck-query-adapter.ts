import { unwrapApiResponse } from '@/lib/api-envelope'
import { invalidateQueries, useMutation, useQuery } from '@/lib/use-query'
import { deckQueryKeys } from '../infrastructure/deck-query-keys'
import type { TypeDeckQueryPort } from '../ports/deck-query.port'
import type { TypeDeckServicePort } from '../ports/deck-service.port'

export default function useDeckQueryAdapter(service: TypeDeckServicePort): TypeDeckQueryPort {
  return {
    useDeckQuery(options) {
      return useQuery({
        key: () => deckQueryKeys.page(options.limit()),
        fn: () => service.getDeck(options.limit()),
        enabled: options.enabled,
        // The deck is consumed as you swipe; anything cached is already stale.
        staleTime: 0,
        keepPreviousData: true,
      })
    },

    // Every write unwraps: a refusal on a "200" must throw, not show a green tick.
    useSwipeMutation() {
      return useMutation(async (profileId: string, action) => {
        const response = unwrapApiResponse(
          await service.swipe(profileId, action),
          'That swipe did not go through.',
        )
        return response.data
      })
    },

    useUndoMutation() {
      return useMutation(async () => {
        const response = unwrapApiResponse(
          await service.undoLastSwipe(),
          'Could not rewind that swipe.',
        )
        return response.data
      })
    },

    useResetMutation() {
      return useMutation(async () => {
        const response = unwrapApiResponse(await service.resetDeck(), 'Could not reset the deck.')
        invalidateQueries(deckQueryKeys.root)
        return response.data
      })
    },

    invalidateDeck() {
      invalidateQueries(deckQueryKeys.root)
    },
  }
}
