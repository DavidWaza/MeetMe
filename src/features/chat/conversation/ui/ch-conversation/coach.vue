<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import type { TypeChatFeedback } from '../../domain/chat-entities'
import type { TypeVibe } from '../../domain/chat-vibe'

/**
 * The feedback loop: how interested they are, and why your last message moved
 * it. Collapsed to a slim meter until a new message is scored.
 */
const props = defineProps<{
  interest: number
  vibe: TypeVibe
  feedback: TypeChatFeedback | null
  name: string
}>()

const emit = defineEmits<{ dismiss: [] }>()

const expanded = ref(false)
const pulse = ref(false)

watch(
  () => props.feedback,
  (feedback) => {
    if (!feedback) return
    expanded.value = true
    pulse.value = false
    requestAnimationFrame(() => (pulse.value = true))
  },
)

function collapse(): void {
  expanded.value = false
  emit('dismiss')
}

const deltaLabel = computed(() => {
  const delta = props.feedback?.delta ?? 0
  return delta > 0 ? `+${delta}` : String(delta)
})
</script>

<template>
  <section :class="['ch-coach', `ch-coach--${props.vibe.tone}`]" aria-live="polite">
    <button
      class="ch-coach__bar"
      :aria-expanded="expanded"
      aria-controls="ch-coach-detail"
      @click="expanded = !expanded"
    >
      <span class="ch-coach__label">
        <NIcon name="flame" :size="14" filled />
        {{ props.name }}'s interest · <strong>{{ props.vibe.label }}</strong>
      </span>
      <span
        class="ch-coach__meter"
        role="meter"
        :aria-valuenow="props.interest"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <span
          :class="['ch-coach__fill', { 'ch-coach__fill--pulse': pulse }]"
          :style="{ width: `${props.interest}%` }"
        />
      </span>
      <span class="ch-coach__value">{{ props.interest }}</span>
    </button>

    <div v-if="expanded" id="ch-coach-detail" class="ch-coach__detail">
      <template v-if="props.feedback">
        <span
          :class="[
            'ch-coach__delta',
            props.feedback.delta > 0
              ? 'ch-coach__delta--up'
              : props.feedback.delta < 0
                ? 'ch-coach__delta--down'
                : '',
          ]"
        >
          {{ deltaLabel }}
        </span>
        <p class="ch-coach__reason">{{ props.feedback.reason }}</p>
      </template>
      <p v-else class="ch-coach__reason">{{ props.vibe.hint }}</p>
      <button class="ch-coach__close" aria-label="Collapse coach" @click="collapse">
        <NIcon name="x" :size="16" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.ch-coach {
  --vibe: var(--accent-500);
  flex: none;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface);
}

.ch-coach--cold {
  --vibe: var(--base-400);
}
.ch-coach--cool {
  --vibe: var(--blue-500);
}
.ch-coach--warm {
  --vibe: var(--yellow-500);
}
.ch-coach--hot {
  --vibe: var(--accent-500);
}
.ch-coach--fire {
  --vibe: var(--red-500);
}

.ch-coach__bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) var(--space-4);
}

.ch-coach__label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  flex: none;
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

.ch-coach__label :deep(svg) {
  color: var(--vibe);
}

.ch-coach__label strong {
  color: var(--text-strong);
}

.ch-coach__meter {
  flex: 1;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  overflow: hidden;
}

.ch-coach__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--vibe);
  transition:
    width var(--duration-slow) var(--ease-out),
    background-color var(--duration-slow) var(--ease-out);
}

.ch-coach__fill--pulse {
  animation: ch-pulse 900ms var(--ease-out);
}

@keyframes ch-pulse {
  30% {
    filter: brightness(1.35);
  }
}

.ch-coach__value {
  flex: none;
  width: 1.75rem;
  text-align: right;
  font-size: var(--text-xs);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--text-strong);
}

.ch-coach__detail {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: 0 var(--space-4) var(--space-3);
  animation: ch-reveal var(--duration-base) var(--ease-out);
}

@keyframes ch-reveal {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}

.ch-coach__delta {
  flex: none;
  min-width: 2.25rem;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  color: var(--text-body);
  font-size: var(--text-xs);
  font-weight: 750;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.ch-coach__delta--up {
  background: var(--green-50);
  color: var(--green-fg);
}

.ch-coach__delta--down {
  background: var(--red-50);
  color: var(--red-fg);
}

.ch-coach__reason {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-body);
  line-height: 1.4;
}

.ch-coach__close {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

.ch-coach__close:hover {
  background: var(--surface-inset);
}
</style>
