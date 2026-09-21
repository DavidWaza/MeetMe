<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import { MESSAGE_MAX_LENGTH, type TypeSpeaker } from '../../domain/chat-entities'

const props = defineProps<{
  speaker: TypeSpeaker
  partnerName: string
  suggestions: string[]
  autoReply: boolean
}>()

const draft = defineModel<string>({ required: true })
const emit = defineEmits<{ send: []; 'toggle-speaker': [] }>()

const input = ref<HTMLTextAreaElement | null>(null)
const asThem = computed(() => props.speaker === 'them')
const remaining = computed(() => MESSAGE_MAX_LENGTH - draft.value.length)
const canSend = computed(() => draft.value.trim().length > 0 && remaining.value >= 0)

// Grow with the text up to a cap, like every messaging app's composer.
function resize(): void {
  const el = input.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 132)}px`
}

watch(draft, () => nextTick(resize))

function onKeydown(event: KeyboardEvent): void {
  // Enter sends; Shift+Enter is a newline. IME composition must not send.
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    submit()
  }
}

function submit(): void {
  if (!canSend.value) return
  emit('send')
  input.value?.focus()
}

/** A suggestion is a starting point, not a sent message: it fills the box. */
function useSuggestion(text: string): void {
  draft.value = text
  nextTick(() => {
    input.value?.focus()
    const end = draft.value.length
    input.value?.setSelectionRange(end, end)
  })
}
</script>

<template>
  <div :class="['ch-composer', { 'ch-composer--them': asThem }]">
    <div v-if="props.suggestions.length && !draft && !asThem" class="ch-composer__suggestions">
      <span class="ch-composer__suggest-label"><NIcon name="sparkles" :size="13" /> Try</span>
      <button
        v-for="suggestion in props.suggestions"
        :key="suggestion"
        class="ch-composer__suggestion"
        @click="useSuggestion(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>

    <!-- Text wrapped in one span: the banner is a flex row, and a bare <strong>
         would otherwise become its own flex item and break the sentence apart. -->
    <p v-if="asThem" class="ch-composer__banner">
      <NIcon name="user" :size="14" />
      <span>
        You're writing as <strong>{{ props.partnerName }}</strong
        >. What you send replaces their simulated reply.
      </span>
    </p>
    <p v-else-if="!props.autoReply" class="ch-composer__banner ch-composer__banner--muted">
      <NIcon name="pending" :size="14" />
      <span>
        Simulated replies are paused. Switch speaker to answer as {{ props.partnerName }}.
      </span>
    </p>

    <form class="ch-composer__row" @submit.prevent="submit">
      <button
        type="button"
        class="ch-composer__speaker"
        :aria-label="`Speaking as ${asThem ? props.partnerName : 'you'}. Switch speaker`"
        :title="`Switch to writing as ${asThem ? 'yourself' : props.partnerName}`"
        @click="emit('toggle-speaker')"
      >
        {{ asThem ? props.partnerName.charAt(0) : 'You' }}
      </button>

      <label class="ch-composer__field">
        <span class="u-sr-only">Message</span>
        <textarea
          ref="input"
          v-model="draft"
          rows="1"
          :maxlength="MESSAGE_MAX_LENGTH + 50"
          :placeholder="asThem ? `Reply as ${props.partnerName}…` : 'Type a message'"
          class="ch-composer__input"
          @keydown="onKeydown"
        />
        <span
          v-if="remaining < 100"
          :class="['ch-composer__count', { 'ch-composer__count--over': remaining < 0 }]"
        >
          {{ remaining }}
        </span>
      </label>

      <button
        type="submit"
        class="ch-composer__send"
        :disabled="!canSend"
        aria-label="Send message"
      >
        <NIcon name="send" :size="20" />
      </button>
    </form>
  </div>
</template>

<style scoped>
.ch-composer {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3) max(var(--space-3), env(safe-area-inset-bottom));
  background: var(--surface);
  border-top: 1px solid var(--border-subtle);
}

.ch-composer__suggestions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-inline: calc(var(--space-3) * -1);
  padding-inline: var(--space-3);
  overflow-x: auto;
  scrollbar-width: none;
}

.ch-composer__suggestions::-webkit-scrollbar {
  display: none;
}

.ch-composer__suggest-label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex: none;
  font-size: var(--text-xs);
  font-weight: 650;
  color: var(--accent-fg);
}

.ch-composer__suggestion {
  flex: none;
  max-width: 16rem;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--accent-150);
  background: var(--accent-50);
  color: var(--accent-fg);
  font-size: var(--text-sm);
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ch-composer__banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--accent-50);
  color: var(--accent-fg);
  font-size: var(--text-xs);
}

.ch-composer__banner--muted {
  background: var(--surface-inset);
  color: var(--text-muted);
}

.ch-composer__row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
}

.ch-composer__speaker {
  flex: none;
  display: grid;
  place-items: center;
  min-width: 2.75rem;
  height: 2.75rem;
  padding-inline: var(--space-2);
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  color: var(--text-strong);
  font-size: var(--text-xs);
  font-weight: 750;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.ch-composer--them .ch-composer__speaker {
  background: var(--accent-500);
  color: var(--base-0);
  font-size: var(--text-base);
}

.ch-composer__field {
  position: relative;
  flex: 1;
  display: flex;
}

.ch-composer__input {
  width: 100%;
  min-height: 2.75rem;
  max-height: 8.25rem;
  padding: 0.6rem var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: 1.375rem;
  background: var(--surface-raised);
  color: var(--text-strong);
  font-size: var(--text-base);
  line-height: 1.4;
  resize: none;
}

.ch-composer__input:focus {
  outline: none;
  border-color: var(--accent-500);
}

.ch-composer--them .ch-composer__input:focus {
  border-color: var(--accent-600);
  box-shadow: 0 0 0 3px var(--accent-100);
}

.ch-composer__count {
  position: absolute;
  right: var(--space-3);
  bottom: -1.1rem;
  font-size: var(--text-2xs);
  color: var(--text-muted);
}

.ch-composer__count--over {
  color: var(--red-fg);
  font-weight: 700;
}

.ch-composer__send {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  background: var(--accent-500);
  color: var(--base-0);
  transition:
    transform var(--duration-fast) var(--ease-spring),
    opacity var(--duration-fast) var(--ease-out);
}

.ch-composer__send:not(:disabled):active {
  transform: scale(0.9);
}

.ch-composer__send:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
