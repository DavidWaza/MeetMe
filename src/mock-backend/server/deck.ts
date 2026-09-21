import type {
  ApiDeckPage,
  ApiProfile,
  ApiResponse,
  ApiSwipeAction,
  ApiSwipeResult,
} from './envelope'
import { apiFail, apiOk } from './envelope'
import { createId } from '@/lib/id'
import { MOCK_LIST_LATENCY_MS, MOCK_MUTATION_LATENCY_MS, mockLatency } from '@/lib/latency'
import { emit } from '../channel'
import { allSeedProfiles, commit, db, seedProfile } from '../db'
import { scheduleOpener } from './chat'
import { ageFrom, isShownTo, stableRoll } from './profiles'

/** A super like is a strong signal — it moves the odds and their first impression. */
const SUPER_LIKE_CHANCE_BONUS = 0.25
const SUPER_LIKE_INTEREST_BONUS = 10

function eligibleProfiles(): ApiProfile[] {
  const { me, swipes } = db()
  const swiped = new Set(swipes.map((swipe) => swipe.profile_id))
  const prefs = me.preferences

  return allSeedProfiles()
    .map((seed) => seed.profile)
    .filter((profile) => !swiped.has(profile.id))
    .filter((profile) => profile.distance_km <= prefs.max_distance_km)
    .filter((profile) => {
      const age = ageFrom(profile.birth_date)
      return age >= prefs.age_min && age <= prefs.age_max
    })
    .filter((profile) => isShownTo(me.gender, profile.gender))
}

export async function getDeck(limit = 10): Promise<ApiResponse<ApiDeckPage>> {
  await mockLatency(MOCK_LIST_LATENCY_MS)
  const eligible = eligibleProfiles()
  return apiOk({
    profiles: structuredClone(eligible.slice(0, limit)),
    remaining: Math.max(0, eligible.length - limit),
  })
}

export async function swipe(
  profileId: string,
  action: ApiSwipeAction,
): Promise<ApiResponse<ApiSwipeResult>> {
  // Swipes are optimistic in the UI, so a short latency keeps the deck snappy
  // while still exercising the async path.
  await mockLatency(MOCK_MUTATION_LATENCY_MS / 3)
  const state = db()
  const seed = seedProfile(profileId)

  if (!seed) {
    return apiFail('That profile is no longer available.', {
      swipe_id: '',
      matched: false,
      match_id: null,
    })
  }

  if (state.swipes.some((existing) => existing.profile_id === profileId)) {
    return apiFail('You have already swiped on this profile.', {
      swipe_id: '',
      matched: false,
      match_id: null,
    })
  }

  const swipeId = createId('swipe')
  let matchId: string | null = null

  if (action !== 'pass') {
    const chance = seed.persona.likeChance + (action === 'superlike' ? SUPER_LIKE_CHANCE_BONUS : 0)

    if (stableRoll(profileId) < chance) {
      matchId = createId('match')
      state.matches[matchId] = {
        id: matchId,
        profile_id: profileId,
        matched_at: new Date().toISOString(),
        via_super_like: action === 'superlike',
        interest:
          seed.persona.baseInterest + (action === 'superlike' ? SUPER_LIKE_INTEREST_BONUS : 0),
        auto_reply: true,
        compliments: 0,
      }
      state.messages[matchId] = []
    }
  }

  state.swipes.push({
    id: swipeId,
    profile_id: profileId,
    action,
    at: new Date().toISOString(),
    match_id: matchId,
  })
  commit()

  if (matchId) {
    emit({ type: 'match', match_id: matchId, profile_name: seed.profile.first_name })
    emit({ type: 'inbox' })
    if (seed.persona.opensFirst) scheduleOpener(matchId)
  }

  return apiOk({ swipe_id: swipeId, matched: Boolean(matchId), match_id: matchId })
}

/** Rewind the last swipe. A match cannot be rewound — you have already connected. */
export async function undoLastSwipe(): Promise<ApiResponse<ApiProfile | null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS / 2)
  const state = db()
  const last = state.swipes.at(-1)

  if (!last) return apiFail('There is nothing to rewind.', null)
  if (last.match_id && state.matches[last.match_id]) {
    return apiFail('You cannot rewind a match. Go say hi instead!', null)
  }

  state.swipes.pop()
  commit()

  const seed = seedProfile(last.profile_id)
  return apiOk(seed ? structuredClone(seed.profile) : null)
}

/** Forget every swipe that did not become a match, so the deck refills. */
export async function resetDeck(): Promise<ApiResponse<number>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS)
  const state = db()
  const before = state.swipes.length
  state.swipes = state.swipes.filter((entry) => entry.match_id && state.matches[entry.match_id])
  commit()
  return apiOk(before - state.swipes.length)
}
