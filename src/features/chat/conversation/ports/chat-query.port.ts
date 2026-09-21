import type { TypeApiResponse } from '@/lib/api-envelope'
import type { TypeMutationResult, TypeQueryResult } from '@/lib/use-query'
import type {
  TypeConversation,
  TypeReplyRule,
  TypeReplyRuleDraft,
  TypeSendOutcome,
  TypeSpeaker,
} from '../domain/chat-entities'

export interface TypeConversationQueryOptions {
  matchId: () => string
  enabled: () => boolean
}

export interface TypeSuggestionsQueryOptions extends TypeConversationQueryOptions {
  /** Suggestions follow the conversation, so the key moves with its length. */
  messageCount: () => number
}

export interface TypeChatQueryPort {
  useConversationQuery: (
    options: TypeConversationQueryOptions,
  ) => TypeQueryResult<TypeApiResponse<TypeConversation | null>>
  useSuggestionsQuery: (
    options: TypeSuggestionsQueryOptions,
  ) => TypeQueryResult<TypeApiResponse<string[]>>
  useRulesQuery: (
    options: TypeConversationQueryOptions,
  ) => TypeQueryResult<TypeApiResponse<TypeReplyRule[]>>

  useSendMutation: () => TypeMutationResult<[string, string, TypeSpeaker], TypeSendOutcome>
  useAutoReplyMutation: () => TypeMutationResult<[string, boolean], boolean>
  useCreateRuleMutation: () => TypeMutationResult<[string, TypeReplyRuleDraft], TypeReplyRule>
  useDeleteRuleMutation: () => TypeMutationResult<[string, string], void>
  useUnmatchMutation: () => TypeMutationResult<[string], void>
  markRead: (matchId: string) => void
}

export interface TypeChatNotifierPort {
  error: (error: unknown, fallback: string) => void
  success: (message: string) => void
}
