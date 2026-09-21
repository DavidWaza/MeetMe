<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'
import { createId } from '@/lib/id'

const props = defineProps<{
  label?: string
  hint?: string
  error?: string
  class?: HTMLAttributes['class']
}>()

const id = createId('field')
</script>

<template>
  <div data-slot="field" :class="cn('n-field', props.class)">
    <label v-if="props.label" class="n-field__label" :for="id">{{ props.label }}</label>
    <slot :id="id" />
    <p v-if="props.error" class="n-field__error">{{ props.error }}</p>
    <p v-else-if="props.hint" class="n-field__hint">{{ props.hint }}</p>
  </div>
</template>

<style scoped>
.n-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.n-field__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-strong);
}

.n-field__hint {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.n-field__error {
  font-size: var(--text-xs);
  color: var(--red-fg);
}
</style>
