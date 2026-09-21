<script setup lang="ts">
import NIcon from '@/components/n/icon/NIcon.vue'
import type { TypeSwipeAction } from '../../domain/deck-entities'

const props = defineProps<{
  disabled: boolean
  canUndo: boolean
  isUndoing: boolean
}>()

const emit = defineEmits<{ act: [action: TypeSwipeAction]; undo: [] }>()
</script>

<template>
  <div class="dc-actions" role="toolbar" aria-label="Swipe actions">
    <button
      class="dc-action dc-action--sm dc-action--rewind"
      :disabled="!props.canUndo || props.isUndoing"
      aria-label="Rewind last swipe"
      title="Rewind (Backspace)"
      @click="emit('undo')"
    >
      <NIcon name="rewind" :size="20" />
    </button>
    <button
      class="dc-action dc-action--lg dc-action--pass"
      :disabled="props.disabled"
      aria-label="Pass"
      title="Pass (←)"
      @click="emit('act', 'pass')"
    >
      <NIcon name="pass" :size="30" />
    </button>
    <button
      class="dc-action dc-action--sm dc-action--super"
      :disabled="props.disabled"
      aria-label="Super like"
      title="Super like (↑)"
      @click="emit('act', 'superlike')"
    >
      <NIcon name="superlike" :size="20" filled />
    </button>
    <button
      class="dc-action dc-action--lg dc-action--like"
      :disabled="props.disabled"
      aria-label="Like"
      title="Like (→)"
      @click="emit('act', 'like')"
    >
      <NIcon name="like" :size="30" filled />
    </button>
  </div>
</template>

<style scoped>
.dc-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-5);
  flex: none;
}

.dc-action {
  display: grid;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-md);
  transition:
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.dc-action:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: var(--shadow-lg);
}

.dc-action:active:not(:disabled) {
  transform: scale(0.92);
}

.dc-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.dc-action--sm {
  width: 3rem;
  height: 3rem;
}

.dc-action--lg {
  width: 4rem;
  height: 4rem;
}

.dc-action--rewind {
  color: var(--yellow-500);
}
.dc-action--pass {
  color: var(--red-500);
}
.dc-action--super {
  color: var(--blue-500);
}
.dc-action--like {
  color: var(--green-500);
}

.dc-action--pass:hover:not(:disabled) {
  background: var(--red-50);
}
.dc-action--like:hover:not(:disabled) {
  background: var(--green-50);
}
.dc-action--super:hover:not(:disabled) {
  background: var(--blue-50);
}
.dc-action--rewind:hover:not(:disabled) {
  background: var(--yellow-50);
}
</style>
