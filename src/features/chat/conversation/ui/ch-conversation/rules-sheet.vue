<script setup lang="ts">
import { computed, ref } from 'vue'
import NSheet from '@/components/n/sheet/NSheet.vue'
import NButton from '@/components/n/button/NButton.vue'
import NChip from '@/components/n/chip/NChip.vue'
import NField from '@/components/n/field/NField.vue'
import NInput from '@/components/n/field/NInput.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import {
  RULE_TOKENS,
  type TypeReplyRule,
  type TypeReplyRuleDraft,
  type TypeRuleScope,
} from '../../domain/chat-entities'

const props = defineProps<{
  open: boolean
  partnerName: string
  rules: TypeReplyRule[]
  saving: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  create: [TypeReplyRuleDraft, (saved: boolean) => void]
  delete: [string]
}>()

const triggers = ref('')
const responses = ref('')
const scope = ref<TypeRuleScope>('this')
const localError = ref('')

const EXAMPLES: { triggers: string; responses: string }[] = [
  {
    triggers: 'pineapple, pizza',
    responses:
      'Pineapple on pizza? {me}, we need to talk.\nOkay, controversial, but I respect the confidence.',
  },
  {
    triggers: 'where are you from, where do you live',
    responses: 'I live in {city}! Born and raised, sort of. You?',
  },
  {
    triggers: '/\\b(movie|film|netflix)\\b/',
    responses: 'Oh I love a good film night. What is the last thing you watched?',
  },
]
let exampleIndex = 0

const parsedTriggers = computed(() =>
  triggers.value
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
)
const parsedResponses = computed(() =>
  responses.value
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean),
)

function useExample(): void {
  const example = EXAMPLES[exampleIndex % EXAMPLES.length]!
  exampleIndex += 1
  triggers.value = example.triggers
  responses.value = example.responses
  localError.value = ''
}

function insertToken(token: string): void {
  responses.value = responses.value
    ? `${responses.value}${responses.value.endsWith(' ') ? '' : ' '}${token}`
    : token
}

function submit(): void {
  if (!parsedTriggers.value.length) {
    localError.value = 'Add at least one trigger phrase.'
    return
  }
  if (!parsedResponses.value.length) {
    localError.value = 'Add at least one reply.'
    return
  }
  localError.value = ''
  emit(
    'create',
    { triggers: parsedTriggers.value, responses: parsedResponses.value, scope: scope.value },
    (saved) => {
      if (!saved) return
      triggers.value = ''
      responses.value = ''
    },
  )
}
</script>

<template>
  <NSheet :open="props.open" title="Teach replies" @update:open="emit('update:open', $event)">
    <div class="ch-rules">
      <p class="ch-rules__intro">
        When your message contains a trigger, {{ props.partnerName }} replies with one of your
        lines. Your rules beat their personality, and fire even if they have gone quiet.
      </p>

      <form class="ch-rules__form" @submit.prevent="submit">
        <NField label="When I say…" hint="Comma-separated. Wrap in /slashes/ for a regex pattern.">
          <template #default="{ id }">
            <NInput :id="id" v-model="triggers" placeholder="pizza, pineapple" />
          </template>
        </NField>

        <NField
          label="They reply…"
          hint="One reply per line; one is picked at random."
          :error="localError"
        >
          <template #default="{ id }">
            <NInput
              :id="id"
              v-model="responses"
              multiline
              :rows="3"
              placeholder="Pineapple on pizza? We need to talk."
            />
          </template>
        </NField>

        <div class="ch-rules__tokens">
          <button
            v-for="token in RULE_TOKENS"
            :key="token.token"
            type="button"
            class="ch-rules__token"
            :title="token.meaning"
            @click="insertToken(token.token)"
          >
            {{ token.token }}
          </button>
        </div>

        <div class="ch-rules__scope" role="radiogroup" aria-label="Rule applies to">
          <NChip
            :active="scope === 'this'"
            role="radio"
            :aria-checked="scope === 'this'"
            @click="scope = 'this'"
          >
            Only {{ props.partnerName }}
          </NChip>
          <NChip
            :active="scope === 'all'"
            role="radio"
            :aria-checked="scope === 'all'"
            @click="scope = 'all'"
          >
            Every match
          </NChip>
        </div>

        <div class="ch-rules__actions">
          <NButton type="button" variant="ghost" color="neutral" @click="useExample">
            <NIcon name="sparkles" :size="16" /> Example
          </NButton>
          <NButton type="submit" :loading="props.saving" block>Save rule</NButton>
        </div>
      </form>

      <section class="ch-rules__list" aria-labelledby="ch-rules-list-title">
        <h3 id="ch-rules-list-title" class="ch-rules__heading">
          Active rules <span>{{ props.rules.length }}</span>
        </h3>
        <p v-if="!props.rules.length" class="ch-rules__empty">
          No rules yet. Without any, {{ props.partnerName }} replies in their own style.
        </p>
        <ul v-else class="ch-rules__items">
          <li v-for="rule in props.rules" :key="rule.id" class="ch-rule">
            <div class="ch-rule__head">
              <span :class="['ch-rule__scope', `ch-rule__scope--${rule.scope}`]">
                {{ rule.scope === 'all' ? 'Every match' : `Only ${props.partnerName}` }}
              </span>
              <button
                class="ch-rule__delete"
                :aria-label="`Delete rule for ${rule.triggers.join(', ')}`"
                @click="emit('delete', rule.id)"
              >
                <NIcon name="trash" :size="16" />
              </button>
            </div>
            <div class="ch-rule__triggers">
              <code v-for="trigger in rule.triggers" :key="trigger">{{ trigger }}</code>
            </div>
            <ul class="ch-rule__responses">
              <li v-for="response in rule.responses" :key="response">“{{ response }}”</li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  </NSheet>
</template>

<style scoped>
.ch-rules {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.ch-rules__intro {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.ch-rules__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ch-rules__tokens {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: calc(var(--space-2) * -1);
}

.ch-rules__token {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--surface-inset);
  color: var(--text-body);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--text-xs);
}

.ch-rules__scope,
.ch-rules__actions {
  display: flex;
  gap: var(--space-2);
}

.ch-rules__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.ch-rules__heading span {
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  color: var(--text-strong);
}

.ch-rules__empty {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.ch-rules__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.ch-rule {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
}

.ch-rule__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ch-rule__scope {
  font-size: var(--text-2xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-fg);
}

.ch-rule__scope--all {
  color: var(--blue-fg);
}

.ch-rule__delete {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

.ch-rule__delete:hover {
  background: var(--red-50);
  color: var(--red-fg);
}

.ch-rule__triggers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.ch-rule__triggers code {
  padding: 1px var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--accent-50);
  color: var(--accent-fg);
  font-size: var(--text-xs);
}

.ch-rule__responses {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: var(--text-sm);
  color: var(--text-strong);
}
</style>
