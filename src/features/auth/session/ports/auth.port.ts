import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeMutationResult } from '@/lib/use-query'
import type { TypeLogInDraft, TypeSessionUser, TypeSignUpDraft } from '../domain/auth-entities'

/** The transport. */
export interface TypeAuthServicePort {
  getSession: () => Promise<TypeApiResponse<TypeSessionUser | null>>
  logIn: (draft: TypeLogInDraft) => Promise<TypeApiResponse<TypeSessionUser | null>>
  signUp: (draft: TypeSignUpDraft) => Promise<TypeApiResponse<TypeSessionUser | null>>
  logOut: () => Promise<TypeApiResponse<null>>
}

export interface TypeAuthMutationPort {
  useLogInMutation: () => TypeMutationResult<[TypeLogInDraft], TypeSessionUser>
  useSignUpMutation: () => TypeMutationResult<[TypeSignUpDraft], TypeSessionUser>
  useLogOutMutation: () => TypeMutationResult<[], void>
  restore: () => Promise<TypeSessionUser | null>
}

/** Where the signed-in user is recorded for the rest of the app. */
export interface TypeSessionPort {
  set: (user: TypeSessionUser | null) => void
}

export interface TypeAuthNotifierPort {
  success: (message: string) => void
}
