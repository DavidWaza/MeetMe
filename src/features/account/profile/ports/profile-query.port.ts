import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeMutationResult, TypeQueryResult } from '@/lib/use-query'
import type { TypeAccountProfile, TypeProfileDraft } from '../domain/profile-entities'

export interface TypeProfileQueryPort {
  useMeQuery: () => TypeQueryResult<TypeApiResponse<TypeAccountProfile>>
  useUpdateMutation: () => TypeMutationResult<[TypeProfileDraft], TypeAccountProfile>
  useResetMutation: () => TypeMutationResult<[], void>
}

export interface TypeProfileNotifierPort {
  error: (error: unknown, fallback: string) => void
  success: (message: string) => void
}
