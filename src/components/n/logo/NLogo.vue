<script setup lang="ts">
import { computed, useId, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

/**
 * The MeetMe mark: a speech bubble with a heart cut out of it — the product in
 * one shape, a conversation that turns into something.
 *
 * The heart is negative space, not a second colour, so the mark survives being
 * a favicon, a one-colour print, or a white cut-out on the brand gradient.
 *
 * `tone`:
 * - `brand` — the rose→violet gradient, for light surfaces.
 * - `inverse` — solid `currentColor` (white on the gradient hero).
 */
const props = withDefaults(
  defineProps<{
    size?: number
    /** Show the "MeetMe" wordmark beside the mark. */
    wordmark?: boolean
    tone?: 'brand' | 'inverse'
    class?: HTMLAttributes['class']
  }>(),
  { size: 32, wordmark: false, tone: 'brand' },
)

// Several logos can share a page (header and match screen), and duplicate
// gradient ids would make one of them render with the other's fill.
const gradientId = `meetme-logo-${useId()}`
const fill = computed(() => (props.tone === 'brand' ? `url(#${gradientId})` : 'currentColor'))
const markSize = computed(() => `${props.size}px`)
const wordSize = computed(() => `${props.size * 0.78}px`)
</script>

<template>
  <span :class="cn('n-logo', `n-logo--${props.tone}`, props.class)">
    <svg
      class="n-logo__mark"
      :style="{ width: markSize, height: markSize }"
      viewBox="0 0 24 24"
      :role="props.wordmark ? undefined : 'img'"
      :aria-label="props.wordmark ? undefined : 'MeetMe'"
      :aria-hidden="props.wordmark ? 'true' : undefined"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--flow-primary)" />
          <stop offset="1" stop-color="var(--flow-s3)" />
        </linearGradient>
      </defs>
      <!-- One path, even-odd filled: the heart is a hole in the bubble. -->
      <path
        :fill="fill"
        fill-rule="evenodd"
        d="M7 2.5h10A5.5 5.5 0 0 1 22.5 8v5a5.5 5.5 0 0 1-5.5 5.5h-4.3l-4.6 3.3a1.25 1.25 0 0 1-1.97-1.18l.37-2.26A5.5 5.5 0 0 1 1.5 13V8A5.5 5.5 0 0 1 7 2.5Zm5 12.07c3.2-2.1 5-3.93 5-6.1a2.77 2.77 0 0 0-2.73-2.8c-.97 0-1.83.5-2.27 1.2-.44-.7-1.3-1.2-2.27-1.2A2.77 2.77 0 0 0 7 8.47c0 2.17 1.8 4 5 6.1Z"
      />
    </svg>

    <span v-if="props.wordmark" class="n-logo__word" :style="{ fontSize: wordSize }">
      Meet<span class="n-logo__word-accent">Me</span>
    </span>
  </span>
</template>

<style scoped>
.n-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
}

.n-logo__mark {
  flex: none;
}

.n-logo__word {
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--text-strong);
}

.n-logo__word-accent {
  color: var(--accent-500);
}

.n-logo--inverse .n-logo__word,
.n-logo--inverse .n-logo__word-accent {
  color: currentColor;
}

.n-logo--inverse .n-logo__word-accent {
  opacity: 0.75;
}
</style>
