<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = withDefaults(
  defineProps<{
    tone?: 'neutral' | 'accent' | 'success' | 'info'
    class?: HTMLAttributes['class']
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <span data-slot="badge" :class="cn('n-badge', `n-badge--${props.tone}`, props.class)">
    <slot />
  </span>
</template>

<style scoped>
.n-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.4;
}

.n-badge--neutral {
  background: var(--surface-inset);
  color: var(--text-body);
}
.n-badge--accent {
  background: var(--accent-500);
  color: var(--base-0);
}
.n-badge--success {
  background: var(--green-50);
  color: var(--green-fg);
}
.n-badge--info {
  background: var(--blue-50);
  color: var(--blue-fg);
}
</style>
