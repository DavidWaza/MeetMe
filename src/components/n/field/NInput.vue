<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    id?: string
    multiline?: boolean
    rows?: number
    maxlength?: number
    class?: HTMLAttributes['class']
  }>(),
  { multiline: false, rows: 3 },
)

const emit = defineEmits<{ 'update:modelValue': [string] }>()

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    v-if="props.multiline"
    :id="props.id"
    data-slot="input"
    :class="cn('n-input n-input--multiline', props.class)"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :maxlength="props.maxlength"
    @input="onInput"
  />
  <input
    v-else
    :id="props.id"
    data-slot="input"
    :class="cn('n-input', props.class)"
    :value="props.modelValue"
    :placeholder="props.placeholder"
    :maxlength="props.maxlength"
    @input="onInput"
  />
</template>

<style scoped>
.n-input {
  width: 100%;
  min-height: 2.75rem;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  color: var(--text-strong);
  font-size: var(--text-base);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.n-input::placeholder {
  color: var(--text-muted);
}

.n-input:focus {
  outline: none;
  border-color: var(--accent-500);
}

.n-input--multiline {
  min-height: 5rem;
  padding-block: var(--space-3);
  resize: vertical;
  line-height: 1.5;
}
</style>
