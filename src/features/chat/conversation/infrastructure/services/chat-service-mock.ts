import { transformApiResponse } from '@/lib/api-envelope'
import { chatApi, matchesApi, rulesApi, subscribeToChannel } from '@/mock-backend'
import type { TypeChatRealtimePort, TypeChatServicePort } from '../../ports/chat-service.port'
import {
  toChatMessage,
  toConversation,
  toReplyRule,
  toSendOutcome,
} from '../transformers/chat-transformer'

export default function useChatServiceMock(): TypeChatServicePort {
  return {
    async getConversation(matchId) {
      return transformApiResponse(await chatApi.getConversation(matchId), (data) =>
        data ? toConversation(data) : null,
      )
    },
    async sendMessage(matchId, body, as) {
      return transformApiResponse(await chatApi.sendMessage(matchId, body, as), (data) =>
        data ? toSendOutcome(data) : null,
      )
    },
    markRead: (matchId) => chatApi.markConversationRead(matchId),
    setAutoReply: (matchId, enabled) => chatApi.setAutoReply(matchId, enabled),
    getSuggestions: (matchId) => chatApi.getSuggestions(matchId),
    async listRules(matchId) {
      return transformApiResponse(await rulesApi.listRules(matchId), (rules) =>
        rules.map(toReplyRule),
      )
    },
    async createRule(matchId, draft) {
      const response = await rulesApi.createRule({
        triggers: draft.triggers,
        responses: draft.responses,
        match_id: draft.scope === 'all' ? null : matchId,
      })
      return transformApiResponse(response, (rule) => (rule ? toReplyRule(rule) : null))
    },
    deleteRule: (ruleId) => rulesApi.deleteRule(ruleId),
    unmatch: (matchId) => matchesApi.unmatch(matchId),
  }
}

export function useChatRealtimeMock(): TypeChatRealtimePort {
  return {
    subscribe(matchId, handlers) {
      return subscribeToChannel((event) => {
        if (!('match_id' in event) || event.match_id !== matchId) return
        if (event.type === 'typing') handlers.onTyping(event.is_typing)
        else if (event.type === 'message') handlers.onMessage(toChatMessage(event.message))
        else if (event.type === 'delivery') handlers.onDelivery(event.message_ids, event.delivery)
      })
    },
  }
}
