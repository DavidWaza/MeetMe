import type { TypeApiResponse } from '@/lib/api-envelope'
import type {
  TypeChatMessage,
  TypeConversation,
  TypeReplyRule,
  TypeReplyRuleDraft,
  TypeSendOutcome,
  TypeSpeaker,
} from '../domain/chat-entities'

export interface TypeChatServicePort {
  getConversation: (matchId: string) => Promise<TypeApiResponse<TypeConversation | null>>
  sendMessage: (
    matchId: string,
    body: string,
    as: TypeSpeaker,
  ) => Promise<TypeApiResponse<TypeSendOutcome | null>>
  markRead: (matchId: string) => Promise<TypeApiResponse<null>>
  setAutoReply: (matchId: string, enabled: boolean) => Promise<TypeApiResponse<boolean>>
  getSuggestions: (matchId: string) => Promise<TypeApiResponse<string[]>>
  listRules: (matchId: string) => Promise<TypeApiResponse<TypeReplyRule[]>>
  createRule: (
    matchId: string,
    draft: TypeReplyRuleDraft,
  ) => Promise<TypeApiResponse<TypeReplyRule | null>>
  deleteRule: (ruleId: string) => Promise<TypeApiResponse<null>>
  unmatch: (matchId: string) => Promise<TypeApiResponse<null>>
}

export interface TypeChatRealtimeHandlers {
  onTyping: (isTyping: boolean) => void
  onMessage: (message: TypeChatMessage) => void
  onDelivery: (messageIds: string[], delivery: string) => void
}

/**
 * The push side. A WebSocket, SSE stream or poll loop would implement this;
 * the mock adapter listens to the backend's in-process channel.
 */
export interface TypeChatRealtimePort {
  subscribe: (matchId: string, handlers: TypeChatRealtimeHandlers) => () => void
}
