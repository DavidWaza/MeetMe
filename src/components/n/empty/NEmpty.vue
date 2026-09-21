<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'
import NIcon from '@/components/n/icon/NIcon.vue'
import type { TypeIconName } from '@/utils/icons'

const props = withDefaults(
  defineProps<{
    icon?: TypeIconName
    title: string
    description?: string
    class?: HTMLAttributes['class']
  }>(),
  { icon: 'empty' },
)
</script>

<template>
  <div data-slot="empty" :class="cn('n-empty', props.class)">
    <span class="n-empty__icon"><NIcon :name="props.icon" :size="28" /></span>
    <h3 class="n-empty__title">{{ props.title }}</h3>
    <p v-if="props.description" class="n-empty__description">{{ props.description }}</p>
    <div v-if="$slots.default" class="n-empty__action"><slot /></div>
  </div>
</template>

<style scoped>
.n-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-10) var(--space-6);
  text-align: center;
}

.n-empty__icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  color: var(--text-muted);
}

.n-empty__title {
  font-size: var(--text-lg);
}

.n-empty__description {
  font-size: var(--text-sm);
  color: var(--text-muted);
  max-width: 24ch;
}

.n-empty__action {
  margin-top: var(--space-3);
}
</style>
