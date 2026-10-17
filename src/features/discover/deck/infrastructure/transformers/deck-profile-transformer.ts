import type { ApiDeckPage, ApiProfile, ApiSwipeResult } from '@/api/types'
import { ageFrom } from '@/utils/age'
import { jobLabelFrom } from '@/utils/profile-labels'
import type { TypeDeckPage, TypeDeckProfile, TypeSwipeOutcome } from '../../domain/deck-entities'

/** api → dto. Null handling lives here, so components never see a `null` job. */
export function toDeckProfile(api: ApiProfile): TypeDeckProfile {
  return {
    id: api.id,
    name: api.first_name,
    age: ageFrom(api.birth_date),
    pronouns: api.pronouns,
    bio: api.bio,
    jobLabel: jobLabelFrom(api.job_title, api.company),
    school: api.school,
    city: api.city,
    distanceKm: api.distance_km,
    heightCm: api.height_cm,
    interests: api.interests,
    prompts: api.prompts.map((prompt) => ({ question: prompt.question, answer: prompt.answer })),
    photos: [...api.photo_urls],
    presence: api.presence,
    verification: api.verification,
    lastActiveAt: api.last_active_at,
  }
}

export function toDeckPage(api: ApiDeckPage): TypeDeckPage {
  return { profiles: api.profiles.map(toDeckProfile), remaining: api.remaining }
}

export function toSwipeOutcome(api: ApiSwipeResult): TypeSwipeOutcome {
  return { matched: api.matched, matchId: api.match_id }
}
