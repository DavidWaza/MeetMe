<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'
import NIcon from '@/components/n/icon/NIcon.vue'
import { resolveStatus, STATUS_PALETTE, STATUS_REGISTRY, type TypeStatusKind } from '@/utils/status'

/**
 * The one call site for a state. Screens pass the raw string and a kind; what
 * it says and how it looks is registry data.
 */
const props = withDefaults(
  defineProps<{
    status: string
    kind: TypeStatusKind
    size?: 'sm' | 'md'
    iconOnly?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { size: 'md', iconOnly: false },
)

const canonical = computed(() => resolveStatus(props.status, props.kind))
const descriptor = computed(() => STATUS_REGISTRY[canonical.value])
const tone = computed(() => STATUS_PALETTE[descriptor.value.tone])
</script>

<template>
  <span
    data-slot="status"
    :class="cn('n-status', props.size === 'sm' && 'n-status--sm', props.class)"
    :style="{ '--fg': tone.fg, '--bg': tone.bg, '--bd': tone.bd }"
    :title="descriptor.label"
  >
    <NIcon :name="descriptor.icon" :size="props.size === 'sm' ? 12 : 14" />
    <span v-if="!props.iconOnly">{{ descriptor.label }}</span>
  </span>
</template>

<style scoped>
.n-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-2);
  border-radius: var(--radius-full);
  border: 1px solid var(--bd);
  background: var(--bg);
  color: var(--fg);
  font-size: var(--text-xs);
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
}

.n-status--sm {
  font-size: var(--text-2xs);
  padding: 2px var(--space-2);
}
</style>
