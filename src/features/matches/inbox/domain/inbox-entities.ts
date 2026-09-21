import type { TypeConnectionStatus } from '@/utils/status'

/** The inbox's own read model: a row, not a profile. */
export interface TypeInboxPreview {
  body: string
  fromMe: boolean
  sentAt: string
  delivery: string
}

export interface TypeInboxMatch {
  id: string
  name: string
  age: number
  photo: string
  presence: string
  connectionState: string
  viaSuperLike: boolean
  matchedAt: string
  unreadCount: number
  lastMessage: TypeInboxPreview | null
}

export type TypeInboxFilterId = 'all' | 'your_turn' | 'awaiting_reply' | 'unread'

export interface TypeInboxFilter {
  id: TypeInboxFilterId
  label: string
}

export const INBOX_FILTERS: TypeInboxFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'your_turn', label: 'Your turn' },
  { id: 'unread', label: 'Unread' },
  { id: 'awaiting_reply', label: 'Waiting' },
]

export const INBOX_DEFAULT_FILTER_ID: TypeInboxFilterId = 'all'

/** Which canonical connection states each chip admits. */
export const INBOX_FILTER_STATES: Record<
  Exclude<TypeInboxFilterId, 'all' | 'unread'>,
  TypeConnectionStatus[]
> = {
  your_turn: ['your_turn'],
  awaiting_reply: ['awaiting_reply'],
}
