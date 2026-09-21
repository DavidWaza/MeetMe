<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <header data-slot="app-bar" :class="cn('n-appbar', props.class)">
    <div class="n-appbar__lead"><slot name="lead" /></div>
    <div class="n-appbar__title"><slot /></div>
    <div class="n-appbar__trail"><slot name="trail" /></div>
  </header>
</template>

<style scoped>
.n-appbar {
  display: grid;
  grid-template-columns: 2.75rem 1fr 2.75rem;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--appbar-height);
  padding: var(--space-2) var(--space-3);
  padding-top: max(var(--space-2), env(safe-area-inset-top));
  background: var(--surface);
  border-bottom: 1px solid var(--border-subtle);
  flex: none;
  z-index: 3;
}

.n-appbar__lead,
.n-appbar__trail {
  display: flex;
  align-items: center;
}

.n-appbar__trail {
  justify-content: flex-end;
}

.n-appbar__title {
  min-width: 0;
  text-align: center;
  font-weight: 650;
  color: var(--text-strong);
}
</style>
