import type { TypeIconName } from '@/utils/icons'
import type { TypeCanonicalStatus, TypeStatusTone } from './types'

export interface TypeStatusDescriptor {
  label: string
  icon: TypeIconName
  tone: TypeStatusTone
}

/** canonical status -> how it reads. The only place a state is worded. */
export const STATUS_REGISTRY: Record<TypeCanonicalStatus, TypeStatusDescriptor> = {
  new_match: { label: 'New match', icon: 'match', tone: 'attention' },
  your_turn: { label: 'Your turn', icon: 'chat', tone: 'info' },
  awaiting_reply: { label: 'Awaiting reply', icon: 'pending', tone: 'pending' },
  chatting: { label: 'Chatting', icon: 'chat', tone: 'success' },
  expiring: { label: 'Expiring soon', icon: 'alert', tone: 'danger' },
  unmatched: { label: 'Unmatched', icon: 'x', tone: 'neutral' },

  sending: { label: 'Sending', icon: 'pending', tone: 'neutral' },
  sent: { label: 'Sent', icon: 'delivered', tone: 'neutral' },
  delivered: { label: 'Delivered', icon: 'delivered', tone: 'neutral' },
  read: { label: 'Read', icon: 'read', tone: 'info' },
  failed: { label: 'Not sent', icon: 'alert', tone: 'danger' },

  online: { label: 'Online now', icon: 'online', tone: 'live' },
  recently_active: { label: 'Recently active', icon: 'pending', tone: 'success' },
  away: { label: 'Away', icon: 'pending', tone: 'neutral' },
  offline: { label: 'Offline', icon: 'pending', tone: 'neutral' },

  verified: { label: 'Verified', icon: 'verified', tone: 'info' },
  pending_review: { label: 'Verifying', icon: 'pending', tone: 'pending' },
  unverified: { label: 'Unverified', icon: 'info', tone: 'neutral' },
}
