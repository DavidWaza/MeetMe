<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div data-slot="card-content" :class="cn('n-card-content', props.class)"><slot /></div>
</template>

<style scoped>
.n-card-content {
  padding-inline: var(--space-5);
}
</style>
