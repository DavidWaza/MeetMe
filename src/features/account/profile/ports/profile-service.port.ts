import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeAccountProfile, TypeProfileDraft } from '../domain/profile-entities'

export interface TypeProfileServicePort {
  getMe: () => Promise<TypeApiResponse<TypeAccountProfile>>
  updateMe: (draft: TypeProfileDraft) => Promise<TypeApiResponse<TypeAccountProfile>>
  resetActivity: () => Promise<TypeApiResponse<null>>
}
