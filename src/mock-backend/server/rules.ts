import type { ApiReplyRule, ApiResponse } from './envelope'
import { apiFail, apiOk, fromWire } from './envelope'
import { createId } from '@/lib/id'
import { MOCK_LIST_LATENCY_MS, MOCK_MUTATION_LATENCY_MS, mockLatency } from '@/lib/latency'
import { commit, db } from '../db'

/**
 * Reply rules: the replies you teach the simulator.
 *
 * "When I say X, they reply Y." A rule scoped to a match only fires in that
 * conversation; `match_id: null` fires everywhere. Rules win over the persona
 * script, and fire even when the persona has gone quiet.
 */

const TRIGGERS_MAX = 12
const RESPONSES_MAX = 8
const TEXT_MAX = 280

/** Rules for one conversation: its own first, then the global ones. */
export async function listRules(matchId: string | null): Promise<ApiResponse<ApiReplyRule[]>> {
  await mockLatency(MOCK_LIST_LATENCY_MS / 2)
  const rules = db().rules.filter((rule) => rule.match_id === null || rule.match_id === matchId)
  rules.sort((a, b) => Number(b.match_id !== null) - Number(a.match_id !== null))
  return apiOk(structuredClone(rules))
}

export interface ApiRuleInput {
  triggers: string[]
  responses: string[]
  match_id: string | null
}

function invalidRegex(trigger: string): boolean {
  const regex = /^\/(.+)\/([a-z]*)$/i.exec(trigger.trim())
  if (!regex) return false
  try {
    new RegExp(regex[1] ?? '', regex[2])
    return false
  } catch {
    return true
  }
}

export async function createRule(payload: ApiRuleInput): Promise<ApiResponse<ApiReplyRule | null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS / 2)
  const input = fromWire(payload)
  const triggers = input.triggers.map((value) => value.trim()).filter(Boolean)
  const responses = input.responses.map((value) => value.trim()).filter(Boolean)

  if (!triggers.length) return apiFail('Add at least one trigger phrase.', null)
  if (!responses.length) return apiFail('Add at least one reply.', null)
  if (triggers.length > TRIGGERS_MAX)
    return apiFail(`Up to ${TRIGGERS_MAX} triggers per rule.`, null)
  if (responses.length > RESPONSES_MAX) {
    return apiFail(`Up to ${RESPONSES_MAX} replies per rule.`, null)
  }
  if ([...triggers, ...responses].some((value) => value.length > TEXT_MAX)) {
    return apiFail(`Keep each trigger and reply under ${TEXT_MAX} characters.`, null)
  }

  const badRegex = triggers.find(invalidRegex)
  if (badRegex) return apiFail(`"${badRegex}" is not a valid pattern.`, null)

  if (input.match_id !== null && !db().matches[input.match_id]) {
    return apiFail('That match no longer exists.', null)
  }

  const rule: ApiReplyRule = {
    id: createId('rule'),
    triggers,
    responses,
    match_id: input.match_id,
    created_at: new Date().toISOString(),
  }
  db().rules.unshift(rule)
  commit()
  return apiOk(structuredClone(rule))
}

export async function deleteRule(ruleId: string): Promise<ApiResponse<null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS / 3)
  const state = db()
  const before = state.rules.length
  state.rules = state.rules.filter((rule) => rule.id !== ruleId)
  if (state.rules.length === before) return apiFail('That rule was already removed.', null)
  commit()
  return apiOk(null)
}
