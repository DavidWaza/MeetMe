<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { cn } from '@/lib/cn'
import NSpinner from '@/components/n/spinner/NSpinner.vue'
import {
  buttonVariants,
  type TypeButtonColor,
  type TypeButtonSize,
  type TypeButtonVariant,
} from './button-variants'

const props = withDefaults(
  defineProps<{
    color?: TypeButtonColor
    variant?: TypeButtonVariant
    size?: TypeButtonSize
    block?: boolean
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    to?: RouteLocationRaw
    class?: HTMLAttributes['class']
  }>(),
  { type: 'button', block: false, loading: false, disabled: false },
)

// Component resolution is compile-time: bind the imported reference, never a
// name string.
const tag = computed(() => (props.to ? RouterLink : 'button'))

const classes = computed(() =>
  cn(
    buttonVariants({
      color: props.color,
      variant: props.variant,
      size: props.size,
      block: props.block ? 'true' : 'false',
    }),
    props.loading && 'n-btn--loading',
    props.class,
  ),
)
</script>

<template>
  <component
    :is="tag"
    data-slot="button"
    :class="classes"
    :to="props.to"
    :type="props.to ? undefined : props.type"
    :disabled="props.to ? undefined : props.disabled || props.loading"
    :aria-busy="props.loading || undefined"
  >
    <NSpinner v-if="props.loading" class="n-btn__spinner" :size="16" />
    <slot />
  </component>
</template>

<style scoped>
.n-btn {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-weight: 600;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.n-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.n-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.n-btn--loading {
  cursor: progress;
}

/* sizes */
.n-btn--sm {
  height: 2.25rem;
  padding-inline: var(--space-3);
  font-size: var(--text-sm);
}
.n-btn--md {
  height: 2.75rem;
  padding-inline: var(--space-5);
  font-size: var(--text-sm);
}
.n-btn--lg {
  height: 3.25rem;
  padding-inline: var(--space-6);
  font-size: var(--text-base);
}
.n-btn--icon-sm {
  height: 2.25rem;
  width: 2.25rem;
}
.n-btn--icon {
  height: 2.75rem;
  width: 2.75rem;
}
.n-btn--icon-lg {
  height: 3.25rem;
  width: 3.25rem;
}
/* Full width, but still shrinkable: beside another button in a row it must
   share the space rather than push the row wider than its container. */
.n-btn--block {
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;
}

/* primary */
.n-btn--primary-solid {
  background: var(--accent-500);
  border-color: var(--accent-500);
  color: var(--base-0);
}
.n-btn--primary-solid:hover:not(:disabled) {
  background: var(--accent-600);
  border-color: var(--accent-600);
}
.n-btn--primary-soft {
  background: var(--accent-50);
  color: var(--accent-fg);
}
.n-btn--primary-outline {
  border-color: var(--accent-150);
  color: var(--accent-fg);
}
.n-btn--primary-ghost {
  color: var(--accent-fg);
}
.n-btn--primary-ghost:hover:not(:disabled) {
  background: var(--accent-50);
}
.n-btn--primary-link {
  color: var(--accent-fg);
  height: auto;
  padding: 0;
}
.n-btn--primary-link:hover:not(:disabled) {
  text-decoration: underline;
}

/* neutral */
.n-btn--neutral-solid {
  background: var(--text-strong);
  border-color: var(--text-strong);
  color: var(--surface);
}
.n-btn--neutral-soft {
  background: var(--surface-inset);
  color: var(--text-strong);
}
.n-btn--neutral-outline {
  border-color: var(--border-strong);
  color: var(--text-strong);
  background: var(--surface-raised);
}
.n-btn--neutral-outline:hover:not(:disabled) {
  background: var(--surface-inset);
}
.n-btn--neutral-ghost {
  color: var(--text-body);
}
.n-btn--neutral-ghost:hover:not(:disabled) {
  background: var(--surface-inset);
}
.n-btn--neutral-link {
  color: var(--text-muted);
  height: auto;
  padding: 0;
}

/* destructive */
.n-btn--destructive-solid {
  background: var(--red-500);
  border-color: var(--red-500);
  color: var(--base-0);
}
.n-btn--destructive-solid:hover:not(:disabled) {
  background: var(--red-600);
}
.n-btn--destructive-soft {
  background: var(--red-50);
  color: var(--red-fg);
}
.n-btn--destructive-outline {
  border-color: var(--red-150);
  color: var(--red-fg);
}
.n-btn--destructive-ghost {
  color: var(--red-fg);
}

/* success + info */
.n-btn--success-solid {
  background: var(--green-500);
  border-color: var(--green-500);
  color: var(--base-0);
}
.n-btn--success-soft {
  background: var(--green-50);
  color: var(--green-fg);
}
.n-btn--info-solid {
  background: var(--blue-500);
  border-color: var(--blue-500);
  color: var(--base-0);
}
.n-btn--info-soft {
  background: var(--blue-50);
  color: var(--blue-fg);
}
.n-btn--info-outline {
  border-color: var(--blue-150);
  color: var(--blue-fg);
}

/* inverse — on the brand gradient */
.n-btn--inverse-solid {
  background: var(--base-0);
  border-color: var(--base-0);
  /* Always on white, so the raw step — not the theme-aware --accent-fg. */
  color: var(--accent-600);
}
.n-btn--inverse-outline {
  border: 2px solid rgb(255 255 255 / 0.7);
  color: var(--base-0);
}
.n-btn--inverse-outline:hover:not(:disabled) {
  background: rgb(255 255 255 / 0.12);
}
</style>
