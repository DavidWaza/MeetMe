<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = withDefaults(
  defineProps<{ scroll?: boolean; padded?: boolean; class?: HTMLAttributes['class'] }>(),
  { scroll: true, padded: false },
)
</script>

<template>
  <main
    data-slot="page-content"
    :class="
      cn(
        'n-page-content',
        props.scroll && 'n-page-content--scroll',
        props.padded && 'n-page-content--padded',
        props.class,
      )
    "
  >
    <slot />
  </main>
</template>

<style scoped>
.n-page-content {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.n-page-content--scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.n-page-content--padded {
  padding: var(--space-4);
  gap: var(--space-4);
}
</style>
