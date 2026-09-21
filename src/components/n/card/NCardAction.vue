<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div data-slot="card-action" :class="cn('n-card-action', props.class)"><slot /></div>
</template>

<style scoped>
.n-card-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-self: end;
}
</style>
