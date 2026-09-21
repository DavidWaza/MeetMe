<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NButton from '@/components/n/button/NButton.vue'
import NEmpty from '@/components/n/empty/NEmpty.vue'
import NSpinner from '@/components/n/spinner/NSpinner.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { usePreferencesStore } from '@/stores/preferences'
import useChConversation from '../../composition/use-ch-conversation'
import type { TypeReplyRuleDraft } from '../../domain/chat-entities'
import ChConversationCoach from './coach.vue'
import ChConversationComposer from './composer.vue'
import ChConversationHeader from './header.vue'
import ChConversationMenuSheet from './menu-sheet.vue'
import ChConversationMessageList from './message-list.vue'
import ChConversationPartnerSheet from './partner-sheet.vue'
import ChConversationRulesSheet from './rules-sheet.vue'

const props = defineProps<{ matchId: string }>()

const router = useRouter()
const preferences = usePreferencesStore()

const {
  partner,
  messages,
  draft,
  speaker,
  autoReply,
  interest,
  vibe,
  lastFeedback,
  isPartnerTyping,
  suggestions,
  rules,
  isLoading,
  loadError,
  isSavingRule,
  isUnmatching,
  send,
  retry,
  setAutoReply,
  createRule,
  deleteRule,
  unmatch,
  dismissFeedback,
  toggleSpeaker,
} = useChConversation({ matchId: () => props.matchId })

const menuOpen = ref(false)
const rulesOpen = ref(false)
const profileOpen = ref(false)

async function onCreateRule(
  ruleDraft: TypeReplyRuleDraft,
  done: (saved: boolean) => void,
): Promise<void> {
  done(await createRule(ruleDraft))
}

async function onUnmatch(): Promise<void> {
  if (await unmatch()) {
    menuOpen.value = false
    await router.replace({ name: ROUTE_NAMES.matches })
  }
}
</script>

<template>
  <ChConversationHeader
    :partner="partner"
    :is-typing="isPartnerTyping"
    @profile="profileOpen = true"
    @menu="menuOpen = true"
  />

  <div v-if="isLoading && !partner" class="ch-screen__state">
    <NSpinner :size="28" label="Opening conversation" />
  </div>

  <NEmpty
    v-else-if="loadError || !partner"
    icon="empty"
    title="Conversation unavailable"
    :description="loadError ?? 'This match may have ended.'"
    class="ch-screen__state"
  >
    <NButton :to="{ name: ROUTE_NAMES.matches }" variant="soft">Back to matches</NButton>
  </NEmpty>

  <template v-else>
    <ChConversationCoach
      v-if="preferences.showCoach"
      :interest="interest"
      :vibe="vibe"
      :feedback="lastFeedback"
      :name="partner.name"
      @dismiss="dismissFeedback"
    />

    <ChConversationMessageList
      :messages="messages"
      :partner="partner"
      :is-typing="isPartnerTyping"
      @retry="retry"
    />

    <ChConversationComposer
      v-model="draft"
      :speaker="speaker"
      :partner-name="partner.name"
      :suggestions="suggestions"
      :auto-reply="autoReply"
      @send="send()"
      @toggle-speaker="toggleSpeaker"
    />

    <ChConversationMenuSheet
      v-model:open="menuOpen"
      v-model:show-coach="preferences.showCoach"
      :partner-name="partner.name"
      :auto-reply="autoReply"
      :rule-count="rules.length"
      :unmatching="isUnmatching"
      @update:auto-reply="setAutoReply"
      @rules="rulesOpen = true"
      @profile="profileOpen = true"
      @unmatch="onUnmatch"
    />

    <ChConversationRulesSheet
      v-model:open="rulesOpen"
      :partner-name="partner.name"
      :rules="rules"
      :saving="isSavingRule"
      @create="onCreateRule"
      @delete="deleteRule"
    />

    <ChConversationPartnerSheet v-model:open="profileOpen" :partner="partner" />
  </template>
</template>

<style scoped>
.ch-screen__state {
  flex: 1;
  display: grid;
  place-items: center;
  color: var(--accent-500);
}
</style>
