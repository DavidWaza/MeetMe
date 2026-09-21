<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

/** The phone-width column every screen lives in. Mobile-first: on a desktop
 *  viewport it simply centres rather than reflowing into a second layout. */
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div data-slot="page-container" :class="cn('n-page', props.class)">
    <slot />
  </div>
</template>

<style scoped>
.n-page {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--app-max-width);
  min-height: 100dvh;
  background: var(--surface);
  overflow: hidden;
}

@media (min-width: 40rem) {
  .n-page {
    min-height: min(100dvh, 56rem);
    margin-block: auto;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-lg);
  }
}
</style>
