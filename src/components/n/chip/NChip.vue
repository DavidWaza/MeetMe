<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = withDefaults(
  defineProps<{
    active?: boolean
    count?: number
    as?: 'button' | 'span'
    class?: HTMLAttributes['class']
  }>(),
  { active: false, as: 'button' },
)
</script>

<template>
  <component
    :is="props.as"
    data-slot="chip"
    :type="props.as === 'button' ? 'button' : undefined"
    :class="cn('n-chip', props.active && 'n-chip--active', props.class)"
    :aria-pressed="props.as === 'button' ? props.active : undefined"
  >
    <slot />
    <span v-if="props.count !== undefined" class="n-chip__count">{{ props.count }}</span>
  </component>
</template>

<style scoped>
.n-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 2.125rem;
  padding-inline: var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-strong);
  background: var(--surface-raised);
  color: var(--text-body);
  font-size: var(--text-sm);
  font-weight: 550;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.n-chip--active {
  background: var(--text-strong);
  border-color: var(--text-strong);
  color: var(--surface);
}

.n-chip__count {
  font-size: var(--text-xs);
  opacity: 0.7;
}
</style>
