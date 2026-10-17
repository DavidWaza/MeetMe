<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/cn'
import { resolveStatus } from '@/utils/status'

const props = withDefaults(
  defineProps<{
    seed: string
    name: string
    /** A real photo. Without one the avatar falls back to initials. */
    src?: string
    size?: number
    /** Raw presence string; canonicalised here, never compared at the call site. */
    presence?: string
    ring?: boolean
    class?: HTMLAttributes['class']
  }>(),
  { size: 44, ring: false },
)

const presence = computed(() =>
  props.presence ? resolveStatus(props.presence, 'presence') : undefined,
)
const dimension = computed(() => `${props.size}px`)

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join(''),
)

/** A stable hue per seed, so one person keeps one colour across screens. */
const hue = computed(() => {
  let hash = 0
  for (let i = 0; i < props.seed.length; i += 1) hash = (hash * 31 + props.seed.charCodeAt(i)) >>> 0
  return hash % 360
})
</script>

<template>
  <span
    data-slot="avatar"
    :class="cn('n-avatar', props.ring && 'n-avatar--ring', props.class)"
    :style="{ width: dimension, height: dimension }"
  >
    <img v-if="props.src" class="n-avatar__img" :src="props.src" :alt="props.name" loading="lazy" />
    <span
      v-else
      class="n-avatar__initials"
      :style="{
        background: `linear-gradient(135deg, hsl(${hue} 70% 58%), hsl(${(hue + 40) % 360} 72% 44%))`,
        fontSize: `${props.size * 0.4}px`,
      }"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
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

.n-avatar__img,
.n-avatar__initials {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.n-avatar__initials {
  display: grid;
  place-items: center;
  color: var(--base-0);
  font-weight: 700;
  letter-spacing: 0.02em;
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
