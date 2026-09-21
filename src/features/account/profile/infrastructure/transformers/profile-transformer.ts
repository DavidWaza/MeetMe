import type { ApiMe, ApiMePatch } from '@/api/types'
import { ageFrom } from '@/utils/age'
import type { TypeAccountProfile, TypeProfileDraft } from '../../domain/profile-entities'

export function toAccountProfile(api: ApiMe): TypeAccountProfile {
  return {
    name: api.first_name,
    gender: api.gender,
    age: ageFrom(api.birth_date),
    bio: api.bio,
    jobTitle: api.job_title ?? '',
    city: api.city,
    interests: [...api.interests],
    preferences: {
      ageMin: api.preferences.age_min,
      ageMax: api.preferences.age_max,
      maxDistanceKm: api.preferences.max_distance_km,
    },
  }
}

/** dto → wire. The one place camelCase goes back to snake_case. */
export function toMePatch(draft: TypeProfileDraft): ApiMePatch {
  return {
    first_name: draft.name,
    bio: draft.bio,
    job_title: draft.jobTitle || null,
    city: draft.city,
    interests: draft.interests,
    preferences: {
      age_min: draft.preferences.ageMin,
      age_max: draft.preferences.ageMax,
      max_distance_km: draft.preferences.maxDistanceKm,
    },
  }
}
