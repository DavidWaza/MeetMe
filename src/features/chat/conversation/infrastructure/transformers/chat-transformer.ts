import type {
  ApiConversation,
  ApiMessage,
  ApiReplyFeedback,
  ApiReplyRule,
  ApiSendResult,
} from '@/api/types'
import { photosFor } from '@/utils/profile-photos'
import { ageFrom } from '@/utils/age'
import { jobLabelFrom } from '@/utils/profile-labels'
import type {
  TypeChatFeedback,
  TypeChatMessage,
  TypeConversation,
  TypeReplyRule,
  TypeSendOutcome,
} from '../../domain/chat-entities'

export function toChatMessage(api: ApiMessage): TypeChatMessage {
  return {
    id: api.id,
    body: api.body,
    fromMe: api.sender === 'me',
    sentAt: api.sent_at,
    delivery: api.delivery,
    authoredManually: Boolean(api.authored_manually),
  }
}

export function toChatFeedback(api: ApiReplyFeedback): TypeChatFeedback {
  return { delta: api.delta, reason: api.reason, interest: api.interest }
}

export function toConversation(api: ApiConversation): TypeConversation {
  const profile = api.match.profile
  return {
    partner: {
      matchId: api.match.id,
      name: profile.first_name,
      age: ageFrom(profile.birth_date),
      photo: photosFor(profile)[0]!,
      pronouns: profile.pronouns,
      presence: profile.presence,
      verification: profile.verification,
      jobLabel: jobLabelFrom(profile.job_title, profile.company),
      city: profile.city,
      bio: profile.bio,
      interests: profile.interests,
      prompts: profile.prompts.map((prompt) => ({ ...prompt })),
      matchedAt: api.match.matched_at,
      viaSuperLike: api.match.via_super_like,
    },
    messages: api.messages.map(toChatMessage),
    autoReply: api.auto_reply,
    interest: api.match.interest,
  }
}

export function toSendOutcome(api: ApiSendResult): TypeSendOutcome {
  return {
    message: toChatMessage(api.message),
    feedback: api.feedback ? toChatFeedback(api.feedback) : null,
  }
}

export function toReplyRule(api: ApiReplyRule): TypeReplyRule {
  return {
    id: api.id,
    triggers: api.triggers,
    responses: api.responses,
    scope: api.match_id === null ? 'all' : 'this',
    createdAt: api.created_at,
  }
}
