export type TypeMemberGender = 'man' | 'woman'

export interface TypeDiscoveryPreferences {
  ageMin: number
  ageMax: number
  maxDistanceKm: number
}

export interface TypeAccountProfile {
  name: string
  gender: TypeMemberGender
  age: number
  bio: string
  jobTitle: string
  city: string
  interests: string[]
  preferences: TypeDiscoveryPreferences
}

/**
 * The editable subset. Age comes from a birth date, and gender is set at
 * sign-up because it decides who you are matched with.
 */
export type TypeProfileDraft = Omit<TypeAccountProfile, 'age' | 'gender'>

/** Who fills your deck: men are shown women, women are shown men. */
export const SHOWN_TO: Record<TypeMemberGender, string> = {
  man: 'women',
  woman: 'men',
}

export const BIO_MAX_LENGTH = 300
export const INTERESTS_MAX = 8
export const AGE_FLOOR = 18
export const AGE_CEILING = 60
export const DISTANCE_MAX_KM = 100

/** A curated list keeps interests matchable against other profiles. */
export const INTEREST_OPTIONS = [
  'Afrobeats',
  'Architecture',
  'Art',
  'Baking',
  'Board games',
  'Brunch',
  'Chess',
  'Coffee',
  'Cooking',
  'Cycling',
  'Dance',
  'Documentaries',
  'Entrepreneurship',
  'Fashion',
  'Film',
  'Football',
  'Gaming',
  'Gym',
  'Hiking',
  'Jazz',
  'Jollof',
  'Museums',
  'Music',
  'Nature',
  'Nollywood',
  'Photography',
  'Plants',
  'Podcasts',
  'Reading',
  'Sketching',
  'Stand-up comedy',
  'Travel',
  'Vinyl',
  'Wine',
  'Yoga',
]
