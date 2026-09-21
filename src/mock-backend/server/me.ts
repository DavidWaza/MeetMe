import type { ApiMe, ApiMePatch, ApiResponse } from './envelope'
import { apiFail, apiOk, fromWire } from './envelope'
import { MOCK_LIST_LATENCY_MS, MOCK_MUTATION_LATENCY_MS, mockLatency } from '@/lib/latency'
import { commit, db } from '../db'

export async function getMe(): Promise<ApiResponse<ApiMe>> {
  await mockLatency(MOCK_LIST_LATENCY_MS)
  return apiOk(structuredClone(db().me))
}

const BIO_MAX = 300
const INTERESTS_MAX = 8

export async function updateMe(payload: ApiMePatch): Promise<ApiResponse<ApiMe>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS)
  const patch = fromWire(payload)
  const me = db().me

  // Refusals come back as `status: false` on a "200" — exactly the case
  // `unwrapApiResponse` exists for.
  if (patch.first_name !== undefined && !patch.first_name.trim()) {
    return apiFail('Your name cannot be empty.', structuredClone(me))
  }
  if (patch.bio !== undefined && patch.bio.length > BIO_MAX) {
    return apiFail(`Your bio can be at most ${BIO_MAX} characters.`, structuredClone(me))
  }
  if (patch.interests && patch.interests.length > INTERESTS_MAX) {
    return apiFail(`Pick up to ${INTERESTS_MAX} interests.`, structuredClone(me))
  }

  const prefs = { ...me.preferences, ...patch.preferences }
  if (prefs.age_min < 18 || prefs.age_max < prefs.age_min) {
    return apiFail('That age range does not work. Minimum age is 18.', structuredClone(me))
  }

  if (patch.first_name !== undefined) me.first_name = patch.first_name.trim()
  if (patch.bio !== undefined) me.bio = patch.bio.trim()
  if (patch.job_title !== undefined) me.job_title = patch.job_title?.trim() || null
  if (patch.city !== undefined) me.city = patch.city.trim()
  if (patch.interests) me.interests = patch.interests
  me.preferences = prefs

  commit()
  return apiOk(structuredClone(me))
}
