<script setup lang="ts">
import { fallbackToPortrait } from '@/utils/profile-photos'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NStatus from '@/components/n/badge/NStatus.vue'
import { resolveStatus } from '@/utils/status'
import type { TypeDeckProfile, TypeSwipeAction } from '../../domain/deck-entities'
import {
  dragIntent,
  dragRotation,
  flyOutTarget,
  releaseAction,
  TAP_SLOP_PX,
} from '../../domain/deck-gestures'

const props = withDefaults(
  defineProps<{
    profile: TypeDeckProfile
    /** 0 is the top card; only the top card takes input. */
    depth: number
    /** How far the card above is being dragged (0–1); lifts this card into place. */
    lift?: number
    animateEnter?: boolean
  }>(),
  { lift: 0, animateEnter: false },
)

const emit = defineEmits<{
  swiped: [action: TypeSwipeAction]
  drag: [strength: number]
  details: []
}>()

const root = ref<HTMLElement | null>(null)
const dx = ref(0)
const dy = ref(0)
const dragging = ref(false)
const flying = ref<TypeSwipeAction | null>(null)
const flyTarget = ref({ x: 0, y: 0, rotate: 0 })
const photoIndex = ref(0)
const entering = ref(false)

const isTop = computed(() => props.depth === 0)
const width = () => root.value?.offsetWidth ?? 340

let start = { x: 0, y: 0 }
let lastSample = { x: 0, y: 0, t: 0 }
let velocity = { x: 0, y: 0 }
let pointerId: number | null = null
let settled = false
let fallbackTimer: ReturnType<typeof setTimeout> | undefined

const intent = computed(() => {
  if (flying.value) return { action: flying.value, strength: 1 }
  return dragIntent({ dx: dx.value, dy: dy.value, width: width(), velocityX: 0, velocityY: 0 })
})

const stampOpacity = (action: TypeSwipeAction) =>
  intent.value.action === action ? Math.min(1, intent.value.strength * 1.25) : 0

const transform = computed(() => {
  if (flying.value) {
    const { x, y, rotate } = flyTarget.value
    return `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg)`
  }
  if (isTop.value) {
    return `translate3d(${dx.value}px, ${dy.value}px, 0) rotate(${dragRotation(dx.value, width())}deg)`
  }
  // Cards underneath sit smaller and lower, and rise as the top card leaves.
  const depth = Math.max(0, props.depth - (props.depth === 1 ? props.lift : 0))
  return `translate3d(0, ${depth * 12}px, 0) scale(${1 - depth * 0.045})`
})

const transition = computed(() => {
  if (dragging.value) return 'none'
  if (flying.value) return 'transform 380ms cubic-bezier(0.33, 0, 0.67, 1)'
  return 'transform 420ms var(--ease-spring)'
})

const photo = computed(() => props.profile.photos[photoIndex.value] ?? props.profile.photos[0])
const verified = computed(
  () => resolveStatus(props.profile.verification, 'verification') === 'verified',
)

function onPointerDown(event: PointerEvent): void {
  if (!isTop.value || flying.value || event.button > 0) return
  pointerId = event.pointerId
  root.value?.setPointerCapture(event.pointerId)
  start = { x: event.clientX, y: event.clientY }
  lastSample = { x: event.clientX, y: event.clientY, t: performance.now() }
  velocity = { x: 0, y: 0 }
  dragging.value = true
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging.value || event.pointerId !== pointerId) return
  dx.value = event.clientX - start.x
  dy.value = event.clientY - start.y

  const now = performance.now()
  const dt = Math.max(1, now - lastSample.t)
  // Exponential smoothing: one jittery sample shouldn't decide a flick.
  velocity = {
    x: velocity.x * 0.6 + ((event.clientX - lastSample.x) / dt) * 0.4,
    y: velocity.y * 0.6 + ((event.clientY - lastSample.y) / dt) * 0.4,
  }
  lastSample = { x: event.clientX, y: event.clientY, t: now }
  emit('drag', intent.value.strength)
}

function onPointerUp(event: PointerEvent): void {
  if (!dragging.value || event.pointerId !== pointerId) return
  dragging.value = false
  pointerId = null

  const moved = Math.hypot(dx.value, dy.value)
  if (moved < TAP_SLOP_PX) {
    dx.value = 0
    dy.value = 0
    onTap(event)
    return
  }

  const action = releaseAction({
    dx: dx.value,
    dy: dy.value,
    width: width(),
    velocityX: velocity.x,
    velocityY: velocity.y,
  })

  if (action) {
    void fling(action)
  } else {
    dx.value = 0
    dy.value = 0
    emit('drag', 0)
  }
}

function onTap(event: PointerEvent): void {
  const rect = root.value?.getBoundingClientRect()
  if (!rect) return
  const relY = (event.clientY - rect.top) / rect.height

  // Bottom third is the info panel; the rest browses photos, Tinder-style.
  if (relY > 0.7) {
    emit('details')
    return
  }
  const relX = (event.clientX - rect.left) / rect.width
  const count = props.profile.photos.length
  photoIndex.value =
    relX < 0.5 ? Math.max(0, photoIndex.value - 1) : Math.min(count - 1, photoIndex.value + 1)
}

function finish(action: TypeSwipeAction): void {
  if (settled) return
  settled = true
  clearTimeout(fallbackTimer)
  emit('swiped', action)
}

/** Programmatic swipe, for the action buttons and the keyboard. */
function fling(action: TypeSwipeAction): Promise<void> {
  if (flying.value) return Promise.resolve()
  flyTarget.value = flyOutTarget(action, width(), dy.value)
  flying.value = action
  emit('drag', 1)
  return new Promise((resolve) => {
    // `transitionend` is the signal; the timer is the net for when it never fires.
    fallbackTimer = setTimeout(() => {
      finish(action)
      resolve()
    }, 460)
  })
}

function onTransitionEnd(event: TransitionEvent): void {
  if (event.propertyName === 'transform' && flying.value) finish(flying.value)
}

onMounted(() => {
  if (props.animateEnter && isTop.value) {
    entering.value = true
    setTimeout(() => (entering.value = false), 450)
  }
})

onBeforeUnmount(() => clearTimeout(fallbackTimer))

defineExpose({ fling })
</script>

<template>
  <article
    ref="root"
    :class="['dc-card', { 'dc-card--top': isTop, 'dc-card--entering': entering }]"
    :style="{ transform, transition, zIndex: 10 - props.depth }"
    :aria-hidden="!isTop"
    :aria-label="`${props.profile.name}, ${props.profile.age}`"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @transitionend="onTransitionEnd"
  >
    <img
      class="dc-card__photo"
      :src="photo"
      :alt="`Photo of ${props.profile.name}`"
      @error="fallbackToPortrait($event, props.profile.id, photoIndex)"
      draggable="false"
    />

    <div v-if="props.profile.photos.length > 1" class="dc-card__pager">
      <span
        v-for="(_, index) in props.profile.photos"
        :key="index"
        :class="['dc-card__pager-bar', { 'dc-card__pager-bar--active': index === photoIndex }]"
      />
    </div>

    <span class="dc-card__stamp dc-card__stamp--like" :style="{ opacity: stampOpacity('like') }"
      >Like</span
    >
    <span class="dc-card__stamp dc-card__stamp--nope" :style="{ opacity: stampOpacity('pass') }"
      >Nope</span
    >
    <span
      class="dc-card__stamp dc-card__stamp--super"
      :style="{ opacity: stampOpacity('superlike') }"
    >
      Super like
    </span>

    <div class="dc-card__info">
      <div class="dc-card__chips">
        <NStatus :status="props.profile.presence" kind="presence" size="sm" class="dc-card__chip" />
      </div>
      <h2 class="dc-card__name">
        {{ props.profile.name }}
        <span class="dc-card__age">{{ props.profile.age }}</span>
        <NIcon v-if="verified" name="verified" :size="22" class="dc-card__verified" />
      </h2>
      <p v-if="props.profile.jobLabel" class="dc-card__line">
        <NIcon name="job" :size="16" /> {{ props.profile.jobLabel }}
      </p>
      <p class="dc-card__line">
        <NIcon name="distance" :size="16" /> {{ props.profile.city }} ·
        {{ props.profile.distanceKm }} km away
      </p>
      <div class="dc-card__interests">
        <span
          v-for="interest in props.profile.interests.slice(0, 3)"
          :key="interest"
          class="dc-card__interest"
        >
          {{ interest }}
        </span>
      </div>
      <button
        class="dc-card__more"
        aria-label="Open full profile"
        @pointerdown.stop
        @click.stop="emit('details')"
      >
        <NIcon name="info" :size="22" />
      </button>
    </div>
  </article>
</template>

<style scoped>
.dc-card {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--radius-2xl);
  background: var(--surface-inset);
  box-shadow: var(--shadow-card);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  will-change: transform;
  transform-origin: 50% 90%;
}

.dc-card--top {
  cursor: grab;
}

.dc-card--top:active {
  cursor: grabbing;
}

.dc-card--entering {
  animation: dc-card-return 420ms var(--ease-spring);
}

@keyframes dc-card-return {
  from {
    transform: translate3d(0, -30px, 0) scale(0.9);
    opacity: 0;
  }
}

.dc-card__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.dc-card__pager {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  right: var(--space-3);
  display: flex;
  gap: var(--space-1);
  z-index: 2;
}

.dc-card__pager-bar {
  flex: 1;
  height: 3px;
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 0.35);
}

.dc-card__pager-bar--active {
  background: rgb(255 255 255 / 0.95);
}

.dc-card__stamp {
  position: absolute;
  z-index: 3;
  padding: var(--space-1) var(--space-3);
  border: 4px solid currentColor;
  border-radius: var(--radius-md);
  font-size: var(--text-3xl);
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  pointer-events: none;
  transition: opacity var(--duration-fast) linear;
}

.dc-card__stamp--like {
  top: var(--space-10);
  left: var(--space-6);
  color: var(--green-500);
  transform: rotate(-16deg);
}

.dc-card__stamp--nope {
  top: var(--space-10);
  right: var(--space-6);
  color: var(--red-500);
  transform: rotate(16deg);
}

.dc-card__stamp--super {
  bottom: 38%;
  left: 50%;
  color: var(--blue-500);
  transform: translateX(-50%) rotate(-6deg);
  font-size: var(--text-2xl);
  white-space: nowrap;
}

.dc-card__info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-16) var(--space-5) var(--space-5);
  color: var(--base-0);
  background: linear-gradient(
    to top,
    rgb(12 8 16 / 0.88) 0%,
    rgb(12 8 16 / 0.55) 55%,
    transparent 100%
  );
}

.dc-card__chips {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.dc-card__chip {
  backdrop-filter: blur(4px);
}

.dc-card__name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--base-0);
  font-size: var(--text-3xl);
  font-weight: 750;
  line-height: 1.1;
}

.dc-card__age {
  font-weight: 400;
  font-size: var(--text-2xl);
}

.dc-card__verified {
  color: var(--blue-500);
  fill: var(--base-0);
}

.dc-card__line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  opacity: 0.92;
  padding-right: var(--space-12);
}

.dc-card__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-right: var(--space-12);
}

.dc-card__interest {
  padding: 3px var(--space-3);
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 0.18);
  border: 1px solid rgb(255 255 255 / 0.25);
  font-size: var(--text-xs);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.dc-card__more {
  position: absolute;
  right: var(--space-4);
  bottom: var(--space-5);
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-full);
  background: rgb(255 255 255 / 0.2);
  color: var(--base-0);
  backdrop-filter: blur(4px);
}
</style>
