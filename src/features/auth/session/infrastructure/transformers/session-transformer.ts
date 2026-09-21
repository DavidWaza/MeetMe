import type { ApiLogInInput, ApiSession, ApiSignUpInput } from '@/api/types'
import type { TypeLogInDraft, TypeSessionUser, TypeSignUpDraft } from '../../domain/auth-entities'

export function toSessionUser(api: ApiSession): TypeSessionUser {
  return { id: api.user_id, email: api.email, firstName: api.first_name, gender: api.gender }
}

export function toLogInInput(draft: TypeLogInDraft): ApiLogInInput {
  return { email: draft.email.trim(), password: draft.password }
}

/** The draft is validated before this runs, so `gender` is set. */
export function toSignUpInput(draft: TypeSignUpDraft): ApiSignUpInput {
  return {
    first_name: draft.firstName.trim(),
    email: draft.email.trim(),
    password: draft.password,
    gender: draft.gender ?? 'man',
    birth_date: draft.birthDate,
    city: draft.city.trim(),
  }
}
