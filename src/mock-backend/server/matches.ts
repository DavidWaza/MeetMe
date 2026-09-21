import type { ApiInboxSummary, ApiMatch, ApiResponse } from './envelope'
import { apiFail, apiOk } from './envelope'
import { MOCK_LIST_LATENCY_MS, MOCK_MUTATION_LATENCY_MS, mockLatency } from '@/lib/latency'
import { emit } from '../channel'
import { commit, db, seedProfile, type TypeDbMatch } from '../db'
import { cancelTimers } from './timers'

const EXPIRING_AFTER_MS = 20 * 60 * 60 * 1000

/**
 * The connection state is emitted with the backend's own spellings
 * (`fresh_match`, `waiting_on_you`, …) on purpose: the status resolver's alias
 * table is what turns them into canonical states, and this keeps it honest.
 */
function connectionState(match: TypeDbMatch): string {
  const messages = db().messages[match.id] ?? []
  const last = messages.at(-1)

  if (!last) {
    const age = Date.now() - new Date(match.matched_at).getTime()
    return age > EXPIRING_AFTER_MS ? 'about_to_expire' : 'fresh_match'
  }

  if (last.sender === 'them') {
    return messages.some((message) => message.sender === 'them' && message.delivery !== 'read')
      ? 'waiting_on_you'
      : 'in_conversation'
  }

  return 'waiting_on_them'
}

export function buildApiMatch(match: TypeDbMatch): ApiMatch | null {
  const seed = seedProfile(match.profile_id)
  if (!seed) return null
  const messages = db().messages[match.id] ?? []

  return {
    id: match.id,
    profile: structuredClone(seed.profile),
    matched_at: match.matched_at,
    via_super_like: match.via_super_like,
    connection_state: connectionState(match),
    unread_count: messages.filter((m) => m.sender === 'them' && m.delivery !== 'read').length,
    last_message: messages.at(-1) ? structuredClone(messages.at(-1)!) : null,
    interest: match.interest,
  }
}

function lastActivity(match: ApiMatch): number {
  return new Date(match.last_message?.sent_at ?? match.matched_at).getTime()
}

export async function getMatches(): Promise<ApiResponse<ApiMatch[]>> {
  await mockLatency(MOCK_LIST_LATENCY_MS)
  const matches = Object.values(db().matches)
    .map(buildApiMatch)
    .filter((match): match is ApiMatch => match !== null)
    .sort((a, b) => lastActivity(b) - lastActivity(a))
  return apiOk(matches)
}

export async function getInboxSummary(): Promise<ApiResponse<ApiInboxSummary>> {
  // Polled by the tab bar badge; keep it cheap.
  await mockLatency(MOCK_LIST_LATENCY_MS / 4)
  const matches = Object.values(db().matches)
    .map(buildApiMatch)
    .filter((match): match is ApiMatch => match !== null)

  return apiOk({
    unread_total: matches.reduce((sum, match) => sum + match.unread_count, 0),
    new_matches: matches.filter((match) => !match.last_message).length,
  })
}

export async function unmatch(matchId: string): Promise<ApiResponse<null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS)
  const state = db()
  if (!state.matches[matchId]) return apiFail('That match no longer exists.', null)

  cancelTimers(matchId)
  delete state.matches[matchId]
  delete state.messages[matchId]
  delete state.used_responses[matchId]
  state.rules = state.rules.filter((rule) => rule.match_id !== matchId)
  commit()

  emit({ type: 'inbox' })
  return apiOk(null)
}
