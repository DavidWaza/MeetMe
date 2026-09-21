<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = withDefaults(
  defineProps<{ size?: number; label?: string; class?: HTMLAttributes['class'] }>(),
  { size: 20 },
)

const dimension = computed(() => `${props.size}px`)
</script>

<template>
  <span
    data-slot="spinner"
    role="status"
    :class="cn('n-spinner', props.class)"
    :style="{ width: dimension, height: dimension }"
  >
    <span v-if="props.label" class="u-sr-only">{{ props.label }}</span>
  </span>
</template>

<style scoped>
.n-spinner {
  display: inline-block;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--radius-full);
  opacity: 0.85;
  animation: n-spin 0.7s linear infinite;
}

@keyframes n-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
