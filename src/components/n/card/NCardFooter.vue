<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div data-slot="card-footer" :class="cn('n-card-footer', props.class)"><slot /></div>
</template>

<style scoped>
.n-card-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-inline: var(--space-5);
}
</style>
