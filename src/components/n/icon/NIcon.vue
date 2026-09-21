<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'
import { resolveIcon, type TypeIconName } from '@/utils/icons'

const props = withDefaults(
  defineProps<{
    name: TypeIconName
    size?: number | string
    filled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { size: 20, filled: false },
)

// Module-constant markup from `utils/icons.ts`, never user input.
const glyph = computed(() => resolveIcon(props.name))
const dimension = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : String(props.size),
)
</script>

<template>
  <svg
    data-slot="icon"
    :class="cn('n-icon', props.filled && 'n-icon--filled', props.class)"
    :style="{ width: dimension, height: dimension }"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="glyph"
  />
</template>

<style scoped>
.n-icon {
  flex: none;
}

.n-icon--filled {
  fill: currentColor;
}
</style>
