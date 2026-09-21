<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <!-- Restructures itself when a `card-action` part is present: no prop, no JS. -->
  <div data-slot="card-header" :class="cn('n-card-header', props.class)">
    <slot />
  </div>
</template>

<style scoped>
.n-card-header {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: var(--space-1);
  padding-inline: var(--space-5);
}

.n-card-header:has([data-slot='card-action']) {
  grid-template-columns: 1fr auto;
  column-gap: var(--space-3);
}

.n-card-header:has([data-slot='card-action']) [data-slot='card-action'] {
  grid-row: 1 / -1;
  grid-column: 2;
}
</style>
