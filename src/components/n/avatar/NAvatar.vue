<script setup lang="ts">
import { fallbackToPortrait } from '@/utils/profile-photos'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'
import { avatarFor } from '@/lib/portrait'
import { resolveStatus } from '@/utils/status'

const props = withDefaults(
  defineProps<{
    seed: string
    name: string
    src?: string
    size?: number
    /** Raw presence string; canonicalised here, never compared at the call site. */
    presence?: string
    ring?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { size: 44, ring: false },
)

const source = computed(() => props.src || avatarFor(props.seed))
const presence = computed(() =>
  props.presence ? resolveStatus(props.presence, 'presence') : undefined,
)
const dimension = computed(() => `${props.size}px`)
</script>

<template>
  <span
    data-slot="avatar"
    :class="cn('n-avatar', props.ring && 'n-avatar--ring', props.class)"
    :style="{ width: dimension, height: dimension }"
  >
    <img
      class="n-avatar__img"
      :src="source"
      :alt="props.name"
      loading="lazy"
      @error="fallbackToPortrait($event, props.seed)"
    />
    <span
      v-if="presence === 'online' || presence === 'recently_active'"
      :class="cn('n-avatar__dot', presence === 'recently_active' && 'n-avatar__dot--soft')"
      :title="presence === 'online' ? 'Online now' : 'Recently active'"
    />
  </span>
</template>

<style scoped>
.n-avatar {
  position: relative;
  display: inline-block;
  flex: none;
  border-radius: var(--radius-full);
  overflow: visible;
  background: var(--surface-inset);
}

.n-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-full);
}

.n-avatar--ring::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: var(--radius-full);
  padding: 2px;
  background: linear-gradient(135deg, var(--flow-primary), var(--flow-secondary));
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.n-avatar__dot {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 28%;
  height: 28%;
  min-width: 9px;
  min-height: 9px;
  border-radius: var(--radius-full);
  background: var(--green-500);
  border: 2px solid var(--surface-raised);
}

.n-avatar__dot--soft {
  background: var(--yellow-500);
}
</style>
