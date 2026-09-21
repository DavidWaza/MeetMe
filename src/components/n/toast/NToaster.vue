<script setup lang="ts">
import NIcon from '@/components/n/icon/NIcon.vue'
import { useToastStore } from '@/stores/toasts'

const store = useToastStore()

function runAction(id: string, run: () => void): void {
  run()
  store.dismiss(id)
}
</script>

<template>
  <div class="n-toaster" aria-live="polite">
    <TransitionGroup name="n-toast">
      <div
        v-for="toast in store.toasts"
        :key="toast.id"
        data-slot="toast"
        :class="['n-toast', `n-toast--${toast.tone}`]"
      >
        <NIcon v-if="toast.icon" :name="toast.icon" :size="18" />
        <span class="n-toast__message">{{ toast.message }}</span>
        <button
          v-if="toast.action"
          class="n-toast__action"
          @click="runAction(toast.id, toast.action.run)"
        >
          {{ toast.action.label }}
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.n-toaster {
  position: fixed;
  left: 50%;
  top: max(var(--space-4), env(safe-area-inset-top));
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: min(calc(100% - var(--space-8)), calc(var(--app-max-width) - var(--space-8)));
  transform: translateX(-50%);
  pointer-events: none;
}

.n-toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--base-900);
  color: var(--base-0);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-sm);
  font-weight: 550;
  pointer-events: auto;
}

.n-toast--success {
  background: var(--green-600);
}
.n-toast--danger {
  background: var(--red-600);
}
.n-toast--accent {
  background: linear-gradient(135deg, var(--flow-primary), var(--flow-secondary));
}

.n-toast__message {
  flex: 1;
}

.n-toast__action {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 700;
  text-transform: uppercase;
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
  background: rgb(255 255 255 / 0.16);
}

.n-toast-enter-active,
.n-toast-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.n-toast-enter-from,
.n-toast-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
</style>
