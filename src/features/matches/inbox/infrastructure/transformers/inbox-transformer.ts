import type { ApiMatch } from '@/api/types'
import { ageFrom } from '@/utils/age'
import type { TypeInboxMatch } from '../../domain/inbox-entities'

/**
 * api → dto. Timestamps and status strings pass through raw: the row prints
 * them with the date formatters and `NStatus`, at render time.
 */
export function toInboxMatch(api: ApiMatch): TypeInboxMatch {
  return {
    id: api.id,
    name: api.profile.first_name,
    age: ageFrom(api.profile.birth_date),
    photo: api.profile.photo_urls[0]!,
    presence: api.profile.presence,
    connectionState: api.connection_state,
    viaSuperLike: api.via_super_like,
    matchedAt: api.matched_at,
    unreadCount: api.unread_count,
    lastMessage: api.last_message
      ? {
          body: api.last_message.body,
          fromMe: api.last_message.sender === 'me',
          sentAt: api.last_message.sent_at,
          delivery: api.last_message.delivery,
        }
      : null,
  }
}
