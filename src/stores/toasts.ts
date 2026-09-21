import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createId } from '@/lib/id'
import type { TypeIconName } from '@/utils/icons'

export interface TypeToast {
  id: string
  message: string
  tone: 'neutral' | 'success' | 'danger' | 'accent'
  icon?: TypeIconName
  action?: { label: string; run: () => void }
}

const DEFAULT_DURATION_MS = 3200

/** Cross-screen client state: a toast raised on one screen outlives navigation. */
export const useToastStore = defineStore('toasts', () => {
  const toasts = ref<TypeToast[]>([])
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function dismiss(id: string): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
  }

  function push(toast: Omit<TypeToast, 'id'>, duration = DEFAULT_DURATION_MS): string {
    const id = createId('toast')
    // Keep the stack short on a phone: the newest two are all anyone reads.
    toasts.value = [...toasts.value.slice(-1), { ...toast, id }]
    timers.set(
      id,
      setTimeout(() => dismiss(id), duration),
    )
    return id
  }

  /** Turns a thrown `Error` into its message. Pairs with `unwrapApiResponse`. */
  function pushError(error: unknown, fallback = 'Something went wrong'): void {
    const message = error instanceof Error && error.message ? error.message : fallback
    push({ message, tone: 'danger', icon: 'alert' })
  }

  return { toasts, push, pushError, dismiss }
})
