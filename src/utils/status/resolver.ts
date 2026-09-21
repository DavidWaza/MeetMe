import type { TypeCanonicalStatus, TypeStatusKind } from './types'
import {
  CONNECTION_STATUSES,
  DELIVERY_STATUSES,
  PRESENCE_STATUSES,
  VERIFICATION_STATUSES,
} from './types'

/**
 * Raw string -> canonical status.
 *
 * This layer is what lets the app survive a source that invents a new spelling.
 * Without it the state arrives unrecognised and the UI reads "Unknown". Add one
 * line here instead and every screen updates at once.
 */
const GLOBAL_STATUS_ALIASES: Record<string, TypeCanonicalStatus> = {
  seen: 'read',
  opened: 'read',
  received: 'delivered',
  in_flight: 'sending',
  queued: 'sending',
  undelivered: 'failed',
  error: 'failed',

  active_now: 'online',
  active: 'online',
  online_now: 'online',
  recently_online: 'recently_active',
  last_seen_recently: 'recently_active',
  idle: 'away',

  matched: 'new_match',
  fresh_match: 'new_match',
  waiting_on_them: 'awaiting_reply',
  waiting_on_you: 'your_turn',
  in_conversation: 'chatting',
  active_chat: 'chatting',
  about_to_expire: 'expiring',
  closed: 'unmatched',
  blocked: 'unmatched',

  id_verified: 'verified',
  photo_verified: 'verified',
  under_review: 'pending_review',
  not_verified: 'unverified',
}

const KIND_MEMBERS: Record<TypeStatusKind, readonly TypeCanonicalStatus[]> = {
  connection: CONNECTION_STATUSES,
  delivery: DELIVERY_STATUSES,
  presence: PRESENCE_STATUSES,
  verification: VERIFICATION_STATUSES,
}

const KIND_FALLBACK: Record<TypeStatusKind, TypeCanonicalStatus> = {
  connection: 'chatting',
  delivery: 'sent',
  presence: 'offline',
  verification: 'unverified',
}

export function resolveStatus(raw: string | undefined, kind: TypeStatusKind): TypeCanonicalStatus {
  const normalised = (raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
  const members = KIND_MEMBERS[kind]

  if ((members as readonly string[]).includes(normalised)) {
    return normalised as TypeCanonicalStatus
  }

  const aliased = GLOBAL_STATUS_ALIASES[normalised]
  if (aliased && (members as readonly string[]).includes(aliased)) return aliased

  return KIND_FALLBACK[kind]
}
