import type { TypeApiResponse } from '@/lib/api-envelope'
import type {
  TypeDeckPage,
  TypeDeckProfile,
  TypeSwipeAction,
  TypeSwipeOutcome,
} from '../domain/deck-entities'

/** The transport. Mock and HTTP implementations both satisfy this, and nothing else. */
export interface TypeDeckServicePort {
  getDeck: (limit: number) => Promise<TypeApiResponse<TypeDeckPage>>
  swipe: (profileId: string, action: TypeSwipeAction) => Promise<TypeApiResponse<TypeSwipeOutcome>>
  undoLastSwipe: () => Promise<TypeApiResponse<TypeDeckProfile | null>>
  resetDeck: () => Promise<TypeApiResponse<number>>
}
