/**
 * The conversation's own read model.
 *
 * `delivery` stays a raw string — the backend emits `seen` and `received` as
 * readily as `read` and `delivered`, and the status resolver owns that mapping.
 */
export type TypeSpeaker = 'me' | 'them'

export interface TypeChatMessage {
  id: string
  body: string
  fromMe: boolean
  sentAt: string
  delivery: string
  /** You typed this as the other person, via the speaker toggle. */
  authoredManually: boolean
  /** Client-side only: optimistic, not yet acknowledged. */
  pending?: boolean
  /** Client-side only: the backend refused it; `error` says why. */
  error?: string
}

export interface TypeChatPrompt {
  question: string
  answer: string
}

export interface TypeChatPartner {
  matchId: string
  name: string
  age: number
  photo: string
  pronouns: string | null
  presence: string
  verification: string
  jobLabel: string | null
  city: string
  bio: string
  interests: string[]
  prompts: TypeChatPrompt[]
  matchedAt: string
  viaSuperLike: boolean
}

export interface TypeConversation {
  partner: TypeChatPartner
  messages: TypeChatMessage[]
  autoReply: boolean
  interest: number
}

export interface TypeChatFeedback {
  delta: number
  reason: string
  interest: number
}

export interface TypeSendOutcome {
  message: TypeChatMessage
  feedback: TypeChatFeedback | null
}

export type TypeRuleScope = 'this' | 'all'

export interface TypeReplyRule {
  id: string
  triggers: string[]
  responses: string[]
  scope: TypeRuleScope
  createdAt: string
}

export interface TypeReplyRuleDraft {
  triggers: string[]
  responses: string[]
  scope: TypeRuleScope
}

/** Template tokens a rule's reply may use. Shown in the rule editor. */
export const RULE_TOKENS: { token: string; meaning: string }[] = [
  { token: '{me}', meaning: 'your first name' },
  { token: '{them}', meaning: 'their first name' },
  { token: '{interest}', meaning: 'one of their interests' },
  { token: '{shared}', meaning: 'an interest you share' },
  { token: '{city}', meaning: 'where they live' },
  { token: '{message}', meaning: 'what you just said' },
]

export const MESSAGE_MAX_LENGTH = 1000
