/**
 * The deck's own read model.
 *
 * Deliberately narrow: only what a card and its detail sheet print. Raw
 * presence/verification strings and the raw `lastActiveAt` timestamp are passed
 * through untouched — `NStatus` and the date formatters own how they read.
 */
export type TypeSwipeAction = 'like' | 'pass' | 'superlike'

export interface TypeDeckPrompt {
  question: string
  answer: string
}

export interface TypeDeckProfile {
  id: string
  name: string
  age: number
  pronouns: string | null
  bio: string
  /** "Architect at Studio Ode" — composed once, it never depends on a user setting. */
  jobLabel: string | null
  school: string | null
  city: string
  distanceKm: number
  heightCm: number | null
  interests: string[]
  prompts: TypeDeckPrompt[]
  photos: string[]
  /** Photographer to credit when the photos are real. */
  photoCredit: string | null
  presence: string
  verification: string
  lastActiveAt: string
}

export interface TypeDeckPage {
  profiles: TypeDeckProfile[]
  remaining: number
}

export interface TypeSwipeOutcome {
  matched: boolean
  matchId: string | null
}

export interface TypeMatchCelebration {
  matchId: string
  profile: TypeDeckProfile
  viaSuperLike: boolean
}

export const SWIPE_ACTION_LABELS: Record<TypeSwipeAction, string> = {
  like: 'Like',
  pass: 'Nope',
  superlike: 'Super',
}
