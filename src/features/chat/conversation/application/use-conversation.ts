import { computed, onScopeDispose, ref, watch } from 'vue'
import {
  MESSAGE_MAX_LENGTH,
  type TypeChatFeedback,
  type TypeChatMessage,
  type TypeChatPartner,
  type TypeReplyRuleDraft,
  type TypeSpeaker,
} from '../domain/chat-entities'
import { vibeFor } from '../domain/chat-vibe'
import type { TypeChatNotifierPort, TypeChatQueryPort } from '../ports/chat-query.port'
import type { TypeChatRealtimePort } from '../ports/chat-service.port'

/**
 * One conversation: load, live updates, sending, coaching and reply rules.
 *
 * The query supplies the initial transcript; from then on this owns a local
 * copy that realtime events and optimistic sends mutate. That copy is keyed to
 * `matchId` and rebuilt when it changes — module- or record-scoped state that
 * outlives its record is how one chat ends up showing another's messages.
 */
export interface TypeConversationDeps {
  queryPort: TypeChatQueryPort
  realtime: TypeChatRealtimePort
  notifier: TypeChatNotifierPort
}

export interface TypeUseConversationOptions {
  deps: TypeConversationDeps
  matchId: () => string
}

let tempCounter = 0

export default function useConversation(options: TypeUseConversationOptions) {
  const { queryPort, realtime, notifier } = options.deps
  const matchId = computed(() => options.matchId())

  const conversationQuery = queryPort.useConversationQuery({
    matchId: () => matchId.value,
    enabled: () => Boolean(matchId.value),
  })

  const messages = ref<TypeChatMessage[]>([])
  const partner = ref<TypeChatPartner | null>(null)
  const autoReply = ref(true)
  const interest = ref(50)
  const lastFeedback = ref<TypeChatFeedback | null>(null)
  const isPartnerTyping = ref(false)
  const speaker = ref<TypeSpeaker>('me')
  const draft = ref('')

  const sendMutation = queryPort.useSendMutation()
  const autoReplyMutation = queryPort.useAutoReplyMutation()
  const createRuleMutation = queryPort.useCreateRuleMutation()
  const deleteRuleMutation = queryPort.useDeleteRuleMutation()
  const unmatchMutation = queryPort.useUnmatchMutation()

  const suggestionsQuery = queryPort.useSuggestionsQuery({
    matchId: () => matchId.value,
    enabled: () => Boolean(partner.value),
    messageCount: () => messages.value.filter((message) => !message.pending).length,
  })

  const rulesQuery = queryPort.useRulesQuery({
    matchId: () => matchId.value,
    enabled: () => Boolean(partner.value),
  })

  // Seed local state whenever a (new) conversation resolves.
  watch(
    () => conversationQuery.data.value,
    (response) => {
      if (!response?.status || !response.data) return
      partner.value = response.data.partner
      messages.value = response.data.messages
      autoReply.value = response.data.autoReply
      interest.value = response.data.interest
    },
    { immediate: true },
  )

  // Reset per-record state when the route moves to another match.
  watch(matchId, () => {
    messages.value = []
    partner.value = null
    lastFeedback.value = null
    isPartnerTyping.value = false
    speaker.value = 'me'
    draft.value = ''
  })

  function upsert(message: TypeChatMessage, replaceId?: string): void {
    const list = messages.value.filter((entry) => entry.id !== replaceId)
    const existing = list.findIndex((entry) => entry.id === message.id)
    if (existing >= 0) list.splice(existing, 1, { ...list[existing], ...message })
    else list.push(message)
    messages.value = list
  }

  let unsubscribe: (() => void) | undefined
  watch(
    matchId,
    (id) => {
      unsubscribe?.()
      if (!id) return
      unsubscribe = realtime.subscribe(id, {
        onTyping: (typing) => (isPartnerTyping.value = typing),
        onMessage: (message) => {
          isPartnerTyping.value = false
          upsert(message)
          // The conversation is on screen, so what they send is read on arrival.
          if (!message.fromMe) queryPort.markRead(id)
        },
        onDelivery: (ids, delivery) => {
          const targets = new Set(ids)
          messages.value = messages.value.map((message) =>
            targets.has(message.id) ? { ...message, delivery } : message,
          )
        },
      })
    },
    { immediate: true },
  )
  onScopeDispose(() => unsubscribe?.())

  async function send(text = draft.value): Promise<void> {
    const body = text.trim()
    if (!body || !partner.value) return
    if (body.length > MESSAGE_MAX_LENGTH) {
      notifier.error(null, `Messages can be at most ${MESSAGE_MAX_LENGTH} characters.`)
      return
    }

    const as = speaker.value
    const tempId = `temp_${++tempCounter}`
    upsert({
      id: tempId,
      body,
      fromMe: as === 'me',
      sentAt: new Date().toISOString(),
      delivery: 'sending',
      authoredManually: as === 'them',
      pending: true,
    })
    if (text === draft.value) draft.value = ''

    try {
      const outcome = await sendMutation.mutate(matchId.value, body, as)
      upsert(outcome.message, tempId)
      if (outcome.feedback) {
        lastFeedback.value = outcome.feedback
        interest.value = outcome.feedback.interest
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Not sent'
      messages.value = messages.value.map((message) =>
        message.id === tempId
          ? { ...message, pending: false, delivery: 'failed', error: reason }
          : message,
      )
      notifier.error(error, 'Your message was not sent.')
    }
  }

  async function retry(messageId: string): Promise<void> {
    const failed = messages.value.find((message) => message.id === messageId)
    if (!failed) return
    messages.value = messages.value.filter((message) => message.id !== messageId)
    const previous = speaker.value
    speaker.value = failed.fromMe ? 'me' : 'them'
    await send(failed.body)
    speaker.value = previous
  }

  async function setAutoReply(enabled: boolean): Promise<void> {
    const previous = autoReply.value
    autoReply.value = enabled
    try {
      await autoReplyMutation.mutate(matchId.value, enabled)
      notifier.success(enabled ? 'Simulated replies are on.' : 'Simulated replies are paused.')
    } catch (error) {
      autoReply.value = previous
      notifier.error(error, 'Could not change simulated replies.')
    }
  }

  async function createRule(ruleDraft: TypeReplyRuleDraft): Promise<boolean> {
    try {
      await createRuleMutation.mutate(matchId.value, ruleDraft)
      await rulesQuery.refetch()
      notifier.success('Reply rule saved.')
      return true
    } catch (error) {
      notifier.error(error, 'Could not save that rule.')
      return false
    }
  }

  async function deleteRule(ruleId: string): Promise<void> {
    try {
      await deleteRuleMutation.mutate(matchId.value, ruleId)
      await rulesQuery.refetch()
    } catch (error) {
      notifier.error(error, 'Could not delete that rule.')
    }
  }

  async function unmatch(): Promise<boolean> {
    try {
      await unmatchMutation.mutate(matchId.value)
      notifier.success(partner.value ? `You unmatched ${partner.value.name}.` : 'Unmatched.')
      return true
    } catch (error) {
      notifier.error(error, 'Could not unmatch.')
      return false
    }
  }

  const loadError = computed(() => {
    const response = conversationQuery.data.value
    if (conversationQuery.error.value) return conversationQuery.error.value.message
    if (response && !response.status) return response.message ?? 'Could not open this conversation.'
    return null
  })

  const suggestions = computed(() => {
    const response = suggestionsQuery.data.value
    return response?.status && Array.isArray(response.data) ? response.data : []
  })

  const rules = computed(() => {
    const response = rulesQuery.data.value
    return response?.status && Array.isArray(response.data) ? response.data : []
  })

  return {
    partner,
    messages,
    draft,
    speaker,
    autoReply,
    interest,
    vibe: computed(() => vibeFor(interest.value)),
    lastFeedback,
    isPartnerTyping,
    suggestions,
    rules,
    isLoading: conversationQuery.isLoading,
    loadError,
    isSavingRule: createRuleMutation.isPending,
    isUnmatching: unmatchMutation.isPending,
    send,
    retry,
    setAutoReply,
    createRule,
    deleteRule,
    unmatch,
    dismissFeedback: () => (lastFeedback.value = null),
    toggleSpeaker: () => (speaker.value = speaker.value === 'me' ? 'them' : 'me'),
  }
}

export type TypeUseConversationReturn = ReturnType<typeof useConversation>
