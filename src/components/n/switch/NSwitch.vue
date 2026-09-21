<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

/**
 * A labelled on/off row. Composition over configuration: the label and detail
 * are slots, so a caller can put an icon or a badge in either.
 */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
const checked = defineModel<boolean>({ required: true })
</script>

<template>
  <button
    type="button"
    role="switch"
    data-slot="switch"
    :aria-checked="checked"
    :class="cn('n-switch', props.class)"
    @click="checked = !checked"
  >
    <span v-if="$slots.icon" class="n-switch__icon"><slot name="icon" /></span>
    <span class="n-switch__text">
      <span class="n-switch__label"><slot /></span>
      <span v-if="$slots.detail" class="n-switch__detail"><slot name="detail" /></span>
    </span>
    <span :class="['n-switch__track', { 'n-switch__track--on': checked }]" aria-hidden="true" />
  </button>
</template>

<style scoped>
.n-switch {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) 0;
  text-align: left;
}

.n-switch__icon {
  display: grid;
  color: var(--accent-500);
}

.n-switch__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.n-switch__label {
  font-weight: 600;
  color: var(--text-strong);
}

.n-switch__detail {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.n-switch__track {
  position: relative;
  flex: none;
  width: 2.75rem;
  height: 1.625rem;
  border-radius: var(--radius-full);
  background: var(--border-strong);
  transition: background-color var(--duration-fast) var(--ease-out);
}

.n-switch__track::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-full);
  background: var(--base-0);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-base) var(--ease-spring);
}

.n-switch__track--on {
  background: var(--accent-500);
}

.n-switch__track--on::after {
  transform: translateX(1.125rem);
}
</style>
