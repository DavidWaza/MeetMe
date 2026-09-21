/**
 * Canonical statuses, grouped by kind.
 *
 * A screen never decides what a state looks like. It hands `NStatus` a raw
 * string and a kind; the resolver canonicalises it and the registry says how it
 * reads. Adding a state the mock backend invents is one alias line, not a
 * template change.
 */
export const STATUS_KINDS = ['connection', 'delivery', 'presence', 'verification'] as const
export type TypeStatusKind = (typeof STATUS_KINDS)[number]

export const CONNECTION_STATUSES = [
  'new_match',
  'your_turn',
  'awaiting_reply',
  'chatting',
  'expiring',
  'unmatched',
] as const

export const DELIVERY_STATUSES = ['sending', 'sent', 'delivered', 'read', 'failed'] as const

export const PRESENCE_STATUSES = ['online', 'recently_active', 'away', 'offline'] as const

export const VERIFICATION_STATUSES = ['verified', 'pending_review', 'unverified'] as const

export type TypeConnectionStatus = (typeof CONNECTION_STATUSES)[number]
export type TypeDeliveryStatus = (typeof DELIVERY_STATUSES)[number]
export type TypePresenceStatus = (typeof PRESENCE_STATUSES)[number]
export type TypeVerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export type TypeCanonicalStatus =
  TypeConnectionStatus | TypeDeliveryStatus | TypePresenceStatus | TypeVerificationStatus

/** Tones are semantic, never colours, so re-hueing "attention" is one edit. */
export const STATUS_TONES = [
  'neutral',
  'info',
  'pending',
  'attention',
  'success',
  'danger',
  'live',
] as const
export type TypeStatusTone = (typeof STATUS_TONES)[number]
