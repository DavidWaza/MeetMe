import type {
  ApiConversation,
  ApiMessage,
  ApiResponse,
  ApiReplyFeedback,
  ApiSendResult,
} from './envelope'
import { apiFail, apiOk } from './envelope'
import { createId } from '@/lib/id'
import { MOCK_LIST_LATENCY_MS, MOCK_MUTATION_LATENCY_MS, mockLatency } from '@/lib/latency'
import { emit } from '../channel'
import { commit, db, seedProfile } from '../db'
import { composeReply, GHOST_THRESHOLD, scoreMessage, suggestPrompts } from '../reply-engine'
import { buildApiMatch } from './matches'
import { cancelTimers, schedule } from './timers'

const MESSAGE_MAX = 1000
/** Delivered almost immediately; "read" once they pick up their phone. */
const DELIVERED_AFTER_MS = 350
const READ_AFTER_MS = 1100
/** They wait for you to finish a burst before replying to all of it. */
const REPLY_DEBOUNCE_MS = 1300
/** Keep a bounded memory of what they've said, so they don't repeat themselves. */
const USED_MEMORY = 12

function nowIso(): string {
  return new Date().toISOString()
}

function markMine(matchId: string, delivery: 'received' | 'seen'): void {
  const messages = db().messages[matchId] ?? []
  const target = delivery === 'received' ? ['sent'] : ['sent', 'delivered']
  const changed = messages.filter((m) => m.sender === 'me' && target.includes(m.delivery))
  if (!changed.length) return

  // Stored canonically; emitted with the backend spelling (`seen`, `received`).
  for (const message of changed) message.delivery = delivery === 'seen' ? 'read' : 'delivered'
  commit()
  emit({ type: 'delivery', match_id: matchId, message_ids: changed.map((m) => m.id), delivery })
}

function pushTheirMessage(matchId: string, body: string, manual = false): ApiMessage {
  const message: ApiMessage = {
    id: createId('msg'),
    match_id: matchId,
    sender: 'them',
    body,
    sent_at: nowIso(),
    // Something you typed yourself is, by definition, already read.
    delivery: manual ? 'read' : 'delivered',
    ...(manual ? { authored_manually: true } : {}),
  }
  db().messages[matchId]?.push(message)
  commit()
  const match = db().matches[matchId]
  const profileName = (match && seedProfile(match.profile_id)?.profile.first_name) ?? ''
  emit({ type: 'message', match_id: matchId, profile_name: profileName, message })
  emit({ type: 'inbox' })
  return message
}

/** The simulated other side. Runs once per burst, after the debounce. */
function runReply(matchId: string): void {
  const state = db()
  const match = state.matches[matchId]
  const seed = match && seedProfile(match.profile_id)
  if (!match || !seed || !match.auto_reply) return

  const history = state.messages[matchId] ?? []
  let lastTheirs = -1
  history.forEach((m, index) => {
    if (m.sender === 'them') lastTheirs = index
  })
  const burst = history.slice(lastTheirs + 1).filter((m) => m.sender === 'me')
  if (!burst.length) return

  markMine(matchId, 'seen')

  const rules = state.rules.filter((rule) => rule.match_id === null || rule.match_id === matchId)
  const plan = composeReply({
    text: burst.map((m) => m.body).join('\n'),
    profile: seed.profile,
    persona: seed.persona,
    me: state.me,
    history,
    interest: match.interest,
    rules,
    used: state.used_responses[matchId] ?? [],
  })

  // Left on read. The coach already said why when the message was scored.
  if (!plan.body) return

  const body = plan.body
  emit({ type: 'typing', match_id: matchId, is_typing: true })

  schedule(matchId, plan.typingMs, () => {
    emit({ type: 'typing', match_id: matchId, is_typing: false })
    if (!db().matches[matchId]) return
    const used = [...(state.used_responses[matchId] ?? []), body].slice(-USED_MEMORY)
    state.used_responses[matchId] = used
    pushTheirMessage(matchId, body)
  })
}

export async function getConversation(
  matchId: string,
): Promise<ApiResponse<ApiConversation | null>> {
  await mockLatency(MOCK_LIST_LATENCY_MS)
  const state = db()
  const match = state.matches[matchId]
  if (!match) return apiFail('This conversation is no longer available.', null)

  // Opening the conversation reads everything they sent.
  let changed = false
  for (const message of state.messages[matchId] ?? []) {
    if (message.sender === 'them' && message.delivery !== 'read') {
      message.delivery = 'read'
      changed = true
    }
  }
  if (changed) {
    commit()
    emit({ type: 'inbox' })
  }

  const apiMatch = buildApiMatch(match)
  if (!apiMatch) return apiFail('This conversation is no longer available.', null)

  return apiOk({
    match: apiMatch,
    messages: structuredClone(state.messages[matchId] ?? []),
    auto_reply: match.auto_reply,
  })
}

/** Called while the conversation is open, so new messages from them arrive read. */
export async function markConversationRead(matchId: string): Promise<ApiResponse<null>> {
  const messages = db().messages[matchId] ?? []
  let changed = false
  for (const message of messages) {
    if (message.sender === 'them' && message.delivery !== 'read') {
      message.delivery = 'read'
      changed = true
    }
  }
  if (changed) {
    commit()
    emit({ type: 'inbox' })
  }
  return apiOk(null)
}

export async function sendMessage(
  matchId: string,
  rawBody: string,
  as: 'me' | 'them' = 'me',
): Promise<ApiResponse<ApiSendResult | null>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS / 2)
  const state = db()
  const match = state.matches[matchId]
  const seed = match && seedProfile(match.profile_id)
  const body = rawBody.trim()

  if (!match || !seed) return apiFail('You are no longer matched with this person.', null)
  if (!body) return apiFail('Your message is empty.', null)
  if (body.length > MESSAGE_MAX) {
    return apiFail(`Messages can be at most ${MESSAGE_MAX} characters.`, null)
  }

  // Voicing the other party: no scoring, no simulated reply, you are them.
  // Your reply replaces whatever the simulator was about to say.
  if (as === 'them') {
    cancelTimers(matchId)
    emit({ type: 'typing', match_id: matchId, is_typing: false })
    const message = pushTheirMessage(matchId, body, true)
    markMine(matchId, 'seen')
    return apiOk({ message: structuredClone(message), feedback: null })
  }

  const history = state.messages[matchId] ?? []
  const scored = scoreMessage({
    text: body,
    profile: seed.profile,
    me: state.me,
    history,
    interest: match.interest,
    complimentsSoFar: match.compliments,
  })

  const wasGhosting = match.interest < GHOST_THRESHOLD
  match.interest = scored.interest
  if (scored.isCompliment) match.compliments += 1

  const feedback: ApiReplyFeedback = {
    delta: scored.delta,
    interest: scored.interest,
    reason:
      scored.interest < GHOST_THRESHOLD
        ? `${scored.reason} They have gone quiet. A thoughtful question might win them back.`
        : wasGhosting
          ? `${scored.reason} They are warming back up.`
          : scored.reason,
  }

  const message: ApiMessage = {
    id: createId('msg'),
    match_id: matchId,
    sender: 'me',
    body,
    sent_at: nowIso(),
    delivery: 'sent',
  }
  history.push(message)
  state.messages[matchId] = history
  commit()
  emit({ type: 'inbox' })

  if (match.auto_reply) {
    // Restart the reply clock on every message in a burst. If they were
    // mid-reply, they stop typing and answer the whole burst instead.
    cancelTimers(matchId)
    emit({ type: 'typing', match_id: matchId, is_typing: false })
    schedule(matchId, READ_AFTER_MS * seed.persona.pace + REPLY_DEBOUNCE_MS, () =>
      runReply(matchId),
    )
  }
  schedule(matchId, DELIVERED_AFTER_MS, () => markMine(matchId, 'received'))

  return apiOk({ message: structuredClone(message), feedback })
}

export async function setAutoReply(
  matchId: string,
  enabled: boolean,
): Promise<ApiResponse<boolean>> {
  await mockLatency(MOCK_MUTATION_LATENCY_MS / 3)
  const match = db().matches[matchId]
  if (!match) return apiFail('That match no longer exists.', false)
  match.auto_reply = enabled
  if (!enabled) cancelTimers(matchId)
  commit()
  return apiOk(enabled)
}

export async function getSuggestions(matchId: string): Promise<ApiResponse<string[]>> {
  const state = db()
  const match = state.matches[matchId]
  const seed = match && seedProfile(match.profile_id)
  if (!seed) return apiFail('That match no longer exists.', [])
  return apiOk(suggestPrompts(seed.profile, state.me, state.messages[matchId] ?? []))
}

/** Some people message first. Called by the deck endpoint on a new match. */
export function scheduleOpener(matchId: string): void {
  const match = db().matches[matchId]
  const seed = match && seedProfile(match.profile_id)
  const opener = seed?.persona.openers[0]
  if (!seed || !opener) return

  schedule(matchId, 2600, () => {
    emit({ type: 'typing', match_id: matchId, is_typing: true })
    schedule(matchId, 1800 * seed.persona.pace, () => {
      emit({ type: 'typing', match_id: matchId, is_typing: false })
      if (!db().matches[matchId]) return
      pushTheirMessage(matchId, opener)
    })
  })
}
