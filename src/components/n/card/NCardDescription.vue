<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <p data-slot="card-description" :class="cn('n-card-description', props.class)"><slot /></p>
</template>

<style scoped>
.n-card-description {
  font-size: var(--text-sm);
  color: var(--text-muted);
}
</style>
