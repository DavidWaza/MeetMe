<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'vue'

/**
 * A bottom sheet — the mobile-first stand-in for a dialog.
 *
 * Teleported to `body` so it escapes the scroll container, but sized to the
 * same phone column so it does not span a desktop viewport.
 */
const props = withDefaults(
  defineProps<{ open: boolean; title?: string; class?: HTMLAttributes['class'] }>(),
  {},
)

const emit = defineEmits<{ 'update:open': [boolean] }>()

function close(): void {
  emit('update:open', false)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') close()
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="n-sheet">
      <div v-if="props.open" class="n-sheet-root" role="dialog" aria-modal="true">
        <div class="n-sheet__scrim" @click="close" />
        <div data-slot="sheet" :class="cn('n-sheet', props.class)">
          <button class="n-sheet__grabber" aria-label="Close" @click="close" />
          <h2 v-if="props.title" class="n-sheet__title">{{ props.title }}</h2>
          <div class="n-sheet__body"><slot /></div>
          <div v-if="$slots.footer" class="n-sheet__footer"><slot name="footer" /></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.n-sheet-root {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.n-sheet__scrim {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  backdrop-filter: blur(2px);
}

.n-sheet {
  position: relative;
  width: 100%;
  max-width: var(--app-max-width);
  max-height: 88dvh;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5) max(var(--space-6), env(safe-area-inset-bottom));
  background: var(--surface);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow: var(--shadow-lg);
}

.n-sheet__grabber {
  align-self: center;
  width: 2.5rem;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--border-strong);
}

.n-sheet__title {
  font-size: var(--text-lg);
}

.n-sheet__body {
  overflow-y: auto;
  overscroll-behavior: contain;
}

.n-sheet__footer {
  display: flex;
  gap: var(--space-3);
}

.n-sheet-enter-active,
.n-sheet-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.n-sheet-enter-active .n-sheet,
.n-sheet-leave-active .n-sheet {
  transition: transform var(--duration-base) var(--ease-out);
}

.n-sheet-enter-from,
.n-sheet-leave-to {
  opacity: 0;
}

.n-sheet-enter-from .n-sheet,
.n-sheet-leave-to .n-sheet {
  transform: translateY(100%);
}
</style>
