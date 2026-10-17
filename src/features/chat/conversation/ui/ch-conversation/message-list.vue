<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import { formatDayDivider, formatTime, isSameZonedDay } from '@/utils/date-formatters'
import { resolveStatus, STATUS_REGISTRY } from '@/utils/status'
import type { TypeChatMessage, TypeChatPartner } from '../../domain/chat-entities'

const props = defineProps<{
  messages: TypeChatMessage[]
  partner: TypeChatPartner
  isTyping: boolean
}>()

const emit = defineEmits<{ retry: [id: string] }>()

const scroller = ref<HTMLElement | null>(null)

/** Flattened render list: day dividers interleaved, bubbles tagged with their run position. */
const rows = computed(() => {
  const out: (
    | { kind: 'day'; key: string; label: string }
    | {
        kind: 'message'
        key: string
        message: TypeChatMessage
        first: boolean
        last: boolean
        /** First of a run you voiced as them — where the "voiced by you" tag goes. */
        voicedStart: boolean
      }
  )[] = []

  props.messages.forEach((message, index) => {
    const previous = props.messages[index - 1]
    const next = props.messages[index + 1]

    if (!previous || !isSameZonedDay(previous.sentAt, message.sentAt)) {
      out.push({ kind: 'day', key: `day-${message.id}`, label: formatDayDivider(message.sentAt) })
    }

    // Consecutive bubbles from one side form a run; only its ends get the tail.
    const sameSide = (other?: TypeChatMessage) =>
      other && other.fromMe === message.fromMe && isSameZonedDay(other.sentAt, message.sentAt)

    out.push({
      kind: 'message',
      key: message.id,
      message,
      first: !sameSide(previous),
      last: !sameSide(next),
      voicedStart: message.authoredManually && !(sameSide(previous) && previous?.authoredManually),
    })
  })

  return out
})

/** Receipts only under your most recent message, as messaging apps do. */
const lastMineId = computed(
  () => [...props.messages].reverse().find((message) => message.fromMe)?.id,
)

function deliveryLabel(message: TypeChatMessage): string {
  if (message.pending) return 'Sending…'
  return STATUS_REGISTRY[resolveStatus(message.delivery, 'delivery')].label
}

function isRead(message: TypeChatMessage): boolean {
  return resolveStatus(message.delivery, 'delivery') === 'read'
}

function isFailed(message: TypeChatMessage): boolean {
  return resolveStatus(message.delivery, 'delivery') === 'failed'
}

function nearBottom(): boolean {
  const el = scroller.value
  if (!el) return true
  return el.scrollHeight - el.scrollTop - el.clientHeight < 160
}

async function scrollToBottom(smooth: boolean): Promise<void> {
  await nextTick()
  const el = scroller.value
  if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
}

// Follow new messages only if the reader was already at the bottom — don't
// yank someone who scrolled up to reread.
let initialised = false
watch(
  () => [props.messages.length, props.isTyping] as const,
  ([, typing], previous) => {
    const lastIsMine = props.messages.at(-1)?.fromMe
    if (!initialised) {
      initialised = true
      void scrollToBottom(false)
      return
    }
    if (lastIsMine || nearBottom() || (typing && !previous?.[1])) void scrollToBottom(true)
  },
  { immediate: true },
)
</script>

<template>
  <div ref="scroller" class="ch-list" role="log" aria-live="polite" aria-relevant="additions">
    <div class="ch-list__intro">
      <img class="ch-list__intro-photo" :src="props.partner.photo" :alt="props.partner.name" />
      <p class="ch-list__intro-title">You matched with {{ props.partner.name }}</p>
      <p class="ch-list__intro-sub">
        {{ formatDayDivider(props.partner.matchedAt) }}
        <template v-if="props.partner.viaSuperLike"> · via super like</template>
      </p>
    </div>

    <template v-for="row in rows" :key="row.key">
      <p v-if="row.kind === 'day'" class="ch-list__day">{{ row.label }}</p>

      <div
        v-else
        :class="[
          'ch-msg',
          row.message.fromMe ? 'ch-msg--mine' : 'ch-msg--theirs',
          {
            'ch-msg--first': row.first,
            'ch-msg--last': row.last,
            'ch-msg--pending': row.message.pending,
          },
        ]"
      >
        <div class="ch-msg__bubble" :title="formatTime(row.message.sentAt)">
          <span v-if="row.voicedStart" class="ch-msg__voiced">
            <NIcon name="user" :size="11" /> voiced by you
          </span>
          <!-- Its own element: `pre-wrap` must apply to the message, not template whitespace. -->
          <span class="ch-msg__text">{{ row.message.body }}</span>
        </div>

        <button
          v-if="row.message.fromMe && isFailed(row.message)"
          class="ch-msg__meta ch-msg__meta--failed"
          @click="emit('retry', row.message.id)"
        >
          <NIcon name="alert" :size="12" /> {{ row.message.error ?? 'Not sent' }} · Tap to retry
        </button>
        <span v-else-if="row.message.id === lastMineId" class="ch-msg__meta">
          <NIcon
            v-if="!row.message.pending"
            :name="isRead(row.message) ? 'read' : 'delivered'"
            :size="13"
            :class="{ 'ch-msg__tick--read': isRead(row.message) }"
          />
          {{ deliveryLabel(row.message) }} · {{ formatTime(row.message.sentAt) }}
        </span>
        <span v-else-if="row.last" class="ch-msg__meta ch-msg__meta--quiet">{{
          formatTime(row.message.sentAt)
        }}</span>
      </div>
    </template>

    <div
      v-if="props.isTyping"
      class="ch-msg ch-msg--theirs ch-msg--first ch-msg--last"
      aria-label="Typing"
    >
      <div class="ch-msg__bubble ch-typing">
        <span class="ch-typing__dot" />
        <span class="ch-typing__dot" />
        <span class="ch-typing__dot" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ch-list {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-4) var(--space-3) var(--space-3);
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--surface-sunken);
}

.ch-list__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-6) 0 var(--space-4);
  text-align: center;
}

.ch-list__intro-photo {
  width: 5.5rem;
  height: 5.5rem;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-full);
  object-fit: cover;
  box-shadow: var(--shadow-md);
}

.ch-list__intro-title {
  font-weight: 650;
  color: var(--text-strong);
}

.ch-list__intro-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.ch-list__day {
  align-self: center;
  margin: var(--space-4) 0 var(--space-2);
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  font-size: var(--text-2xs);
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.ch-msg {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  animation: ch-in var(--duration-base) var(--ease-out);
}

@keyframes ch-in {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
}

.ch-msg--first {
  margin-top: var(--space-2);
}

.ch-msg--mine {
  align-self: flex-end;
  align-items: flex-end;
}

.ch-msg--theirs {
  align-self: flex-start;
  align-items: flex-start;
}

.ch-msg__bubble {
  display: flex;
  flex-direction: column;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.ch-msg__text {
  white-space: pre-wrap;
}

.ch-msg--mine .ch-msg__bubble {
  background: linear-gradient(135deg, var(--flow-primary), var(--flow-s2));
  color: var(--base-0);
  border-bottom-right-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-sm);
}

.ch-msg--mine.ch-msg--first .ch-msg__bubble {
  border-top-right-radius: var(--radius-xl);
}

.ch-msg--mine.ch-msg--last .ch-msg__bubble {
  border-bottom-right-radius: var(--radius-xl);
}

.ch-msg--theirs .ch-msg__bubble {
  background: var(--surface-raised);
  color: var(--text-strong);
  border: 1px solid var(--border-subtle);
  border-bottom-left-radius: var(--radius-sm);
  border-top-left-radius: var(--radius-sm);
}

.ch-msg--theirs.ch-msg--first .ch-msg__bubble {
  border-top-left-radius: var(--radius-xl);
}

.ch-msg--theirs.ch-msg--last .ch-msg__bubble {
  border-bottom-left-radius: var(--radius-xl);
}

.ch-msg--pending .ch-msg__bubble {
  opacity: 0.7;
}

.ch-msg__voiced {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 2px;
  font-size: var(--text-2xs);
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-fg);
}

.ch-msg__meta {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-top: 3px;
  padding-inline: var(--space-1);
  font-size: var(--text-2xs);
  color: var(--text-muted);
}

.ch-msg__meta--quiet {
  opacity: 0.8;
}

.ch-msg__meta--failed {
  color: var(--red-fg);
  font-weight: 600;
}

.ch-msg__tick--read {
  color: var(--blue-500);
}

.ch-typing {
  flex-direction: row;
  gap: 4px;
  padding: var(--space-3) var(--space-4);
}

.ch-typing__dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--text-muted);
  animation: ch-bounce 1.2s infinite ease-in-out;
}

.ch-typing__dot:nth-child(2) {
  animation-delay: 0.15s;
}

.ch-typing__dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes ch-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
