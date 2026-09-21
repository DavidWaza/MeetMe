<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min?: number
    max?: number
    step?: number
    id?: string
    class?: HTMLAttributes['class']
  }>(),
  { min: 0, max: 100, step: 1 },
)

const emit = defineEmits<{ 'update:modelValue': [number] }>()
</script>

<template>
  <input
    :id="props.id"
    data-slot="range"
    type="range"
    :class="cn('n-range', props.class)"
    :value="props.modelValue"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    @input="emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
  />
</template>

<style scoped>
.n-range {
  width: 100%;
  appearance: none;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  cursor: pointer;
}

.n-range::-webkit-slider-thumb {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-full);
  background: var(--accent-500);
  border: 2px solid var(--surface);
  box-shadow: var(--shadow-sm);
}

.n-range::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--surface);
  border-radius: var(--radius-full);
  background: var(--accent-500);
}
</style>
