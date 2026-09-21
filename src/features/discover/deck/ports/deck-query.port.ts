import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeMutationResult, TypeQueryResult } from '@/lib/use-query'
import type {
  TypeDeckPage,
  TypeDeckProfile,
  TypeSwipeAction,
  TypeSwipeOutcome,
} from '../domain/deck-entities'

/**
 * Reactive inputs cross this port as zero-arg thunks. The port stays
 * framework-agnostic — no `Ref` in its signature — while staying fully reactive
 * once the adapter wraps them in `computed()`.
 */
export interface TypeDeckQueryOptions {
  limit: () => number
  enabled: () => boolean
}

export interface TypeDeckQueryPort {
  useDeckQuery: (options: TypeDeckQueryOptions) => TypeQueryResult<TypeApiResponse<TypeDeckPage>>
  useSwipeMutation: () => TypeMutationResult<[string, TypeSwipeAction], TypeSwipeOutcome>
  useUndoMutation: () => TypeMutationResult<[], TypeDeckProfile | null>
  useResetMutation: () => TypeMutationResult<[], number>
  invalidateDeck: () => void
}

/** Side effects the use case asks for but must not implement itself. */
export interface TypeDeckNotifierPort {
  error: (error: unknown, fallback: string) => void
  info: (message: string) => void
}
