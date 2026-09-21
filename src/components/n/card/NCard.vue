<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div data-slot="card" :class="cn('n-card', props.class)">
    <slot />
  </div>
</template>

<style scoped>
.n-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-5);
  background: var(--surface-raised);
  color: var(--text-strong);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
}
</style>
