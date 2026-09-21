import { transformApiResponse } from '@/lib/api-envelope'
import { deckApi } from '@/mock-backend'
import type { TypeDeckServicePort } from '../../ports/deck-service.port'
import { toDeckPage, toDeckProfile, toSwipeOutcome } from '../transformers/deck-profile-transformer'

/**
 * Mock transport. An HTTP transport would be a sibling file with the same
 * shape, swapped in `composition/use-dc-deck-deps.ts`.
 */
export default function useDeckServiceMock(): TypeDeckServicePort {
  return {
    async getDeck(limit) {
      return transformApiResponse(await deckApi.getDeck(limit), toDeckPage)
    },
    async swipe(profileId, action) {
      return transformApiResponse(await deckApi.swipe(profileId, action), toSwipeOutcome)
    },
    async undoLastSwipe() {
      return transformApiResponse(await deckApi.undoLastSwipe(), (profile) =>
        profile ? toDeckProfile(profile) : null,
      )
    },
    async resetDeck() {
      return deckApi.resetDeck()
    },
  }
}
