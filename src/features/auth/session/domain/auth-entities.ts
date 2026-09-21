import type { TypeMemberGender } from '@/stores/session'

export type { TypeMemberGender, TypeSessionUser } from '@/stores/session'

export interface TypeLogInDraft {
  email: string
  password: string
}

export interface TypeSignUpDraft {
  firstName: string
  email: string
  password: string
  /** Not chosen yet until the user picks one. */
  gender: TypeMemberGender | null
  /** `YYYY-MM-DD`, as a native date input gives it. */
  birthDate: string
  city: string
}

export type TypeFieldErrors<T> = Partial<Record<keyof T, string>>

export const MIN_AGE = 18
export const PASSWORD_MIN = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * The matching rule, as the sign-up form explains it: each gender is shown
 * only the other. The backend enforces it; this is the copy that says so.
 */
export const GENDER_OPTIONS: { id: TypeMemberGender; label: string; sees: string }[] = [
  { id: 'man', label: 'Man', sees: 'You will be shown women' },
  { id: 'woman', label: 'Woman', sees: 'You will be shown men' },
]

/**
 * Ready-made accounts for trying either side of the app. These mirror the mock
 * backend's seed (`DEMO_ACCOUNTS`); the UI keeps its own copy because features
 * never import the backend directly.
 */
export const DEMO_LOGINS: { label: string; email: string; password: string }[] = [
  { label: 'Femi (man)', email: 'femi@meetme.demo', password: 'meetme123' },
  { label: 'Ada (woman)', email: 'ada@meetme.demo', password: 'meetme123' },
]

export function emptySignUpDraft(): TypeSignUpDraft {
  return { firstName: '', email: '', password: '', gender: null, birthDate: '', city: '' }
}

/** Latest birth date that is still old enough to join, as `YYYY-MM-DD`. */
export function latestAllowedBirthDate(now = new Date()): string {
  const limit = new Date(
    Date.UTC(now.getUTCFullYear() - MIN_AGE, now.getUTCMonth(), now.getUTCDate()),
  )
  return limit.toISOString().slice(0, 10)
}

export function validateLogIn(draft: TypeLogInDraft): TypeFieldErrors<TypeLogInDraft> {
  const errors: TypeFieldErrors<TypeLogInDraft> = {}
  if (!EMAIL_PATTERN.test(draft.email.trim())) errors.email = 'Enter a valid email address.'
  if (!draft.password) errors.password = 'Enter your password.'
  return errors
}

/**
 * The same rules the backend applies, checked first so the common mistakes
 * never cost a round trip. The backend stays the authority.
 */
export function validateSignUp(
  draft: TypeSignUpDraft,
  now = new Date(),
): TypeFieldErrors<TypeSignUpDraft> {
  const errors: TypeFieldErrors<TypeSignUpDraft> = {}
  if (!draft.firstName.trim()) errors.firstName = 'Tell us your first name.'
  else if (draft.firstName.trim().length > 40) errors.firstName = 'At most 40 characters.'
  if (!EMAIL_PATTERN.test(draft.email.trim())) errors.email = 'Enter a valid email address.'
  if (draft.password.length < PASSWORD_MIN) {
    errors.password = `Use at least ${PASSWORD_MIN} characters.`
  }
  if (!draft.gender) errors.gender = 'Choose one. It decides who you are shown.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate)) errors.birthDate = 'Enter your date of birth.'
  else if (draft.birthDate > latestAllowedBirthDate(now)) {
    errors.birthDate = `You need to be at least ${MIN_AGE} to join.`
  }
  if (!draft.city.trim()) errors.city = 'Tell us which city you live in.'
  return errors
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean)
}
