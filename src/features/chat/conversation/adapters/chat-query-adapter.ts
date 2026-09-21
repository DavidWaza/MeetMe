import { unwrapApiResponse } from '@/lib/api-envelope'
import { invalidateQueries, useMutation, useQuery } from '@/lib/use-query'
import { chatQueryKeys } from '../infrastructure/chat-query-keys'
import type { TypeChatQueryPort } from '../ports/chat-query.port'
import type { TypeChatServicePort } from '../ports/chat-service.port'

export default function useChatQueryAdapter(service: TypeChatServicePort): TypeChatQueryPort {
  return {
    useConversationQuery(options) {
      return useQuery({
        key: () => chatQueryKeys.conversation(options.matchId()),
        fn: () => service.getConversation(options.matchId()),
        enabled: options.enabled,
        // Opening a conversation has a side effect (it reads their messages),
        // and realtime keeps it current after that — never serve it from cache.
        staleTime: 0,
      })
    },

    useSuggestionsQuery(options) {
      return useQuery({
        key: () => chatQueryKeys.suggestions(options.matchId(), options.messageCount()),
        fn: () => service.getSuggestions(options.matchId()),
        enabled: options.enabled,
        keepPreviousData: true,
      })
    },

    useRulesQuery(options) {
      return useQuery({
        key: () => chatQueryKeys.rules(options.matchId()),
        fn: () => service.listRules(options.matchId()),
        enabled: options.enabled,
        keepPreviousData: true,
      })
    },

    useSendMutation() {
      return useMutation(async (matchId: string, body: string, as) => {
        const response = unwrapApiResponse(
          await service.sendMessage(matchId, body, as),
          'Your message was not sent.',
        )
        if (!response.data) throw new Error('Your message was not sent.')
        return response.data
      })
    },

    useAutoReplyMutation() {
      return useMutation(async (matchId: string, enabled: boolean) => {
        const response = unwrapApiResponse(
          await service.setAutoReply(matchId, enabled),
          'Could not change simulated replies.',
        )
        return response.data
      })
    },

    useCreateRuleMutation() {
      return useMutation(async (matchId: string, draft) => {
        const response = unwrapApiResponse(
          await service.createRule(matchId, draft),
          'Could not save that rule.',
        )
        if (!response.data) throw new Error('Could not save that rule.')
        invalidateQueries(chatQueryKeys.root)
        return response.data
      })
    },

    useDeleteRuleMutation() {
      return useMutation(async (_matchId: string, ruleId: string) => {
        unwrapApiResponse(await service.deleteRule(ruleId), 'Could not delete that rule.')
        invalidateQueries(chatQueryKeys.root)
      })
    },

    useUnmatchMutation() {
      return useMutation(async (matchId: string) => {
        unwrapApiResponse(await service.unmatch(matchId), 'Could not unmatch.')
        invalidateQueries(chatQueryKeys.conversation(matchId))
      })
    },

    markRead(matchId) {
      void service.markRead(matchId)
    },
  }
}
