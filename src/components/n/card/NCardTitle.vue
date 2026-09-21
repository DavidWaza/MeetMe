<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <h3 data-slot="card-title" :class="cn('n-card-title', props.class)"><slot /></h3>
</template>

<style scoped>
.n-card-title {
  font-size: var(--text-base);
  font-weight: 650;
}
</style>
