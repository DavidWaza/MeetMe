<script setup lang="ts">
import { fallbackToPortrait } from '@/utils/profile-photos'
import { RouterLink } from 'vue-router'
import NButton from '@/components/n/button/NButton.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import { avatarFor } from '@/lib/portrait'
import { ROUTE_NAMES } from '@/router/route-names'
import type { TypeMatchCelebration } from '../../domain/deck-entities'

const props = defineProps<{ celebration: TypeMatchCelebration | null }>()
const emit = defineEmits<{ close: [] }>()

// Hearts drift up behind the text; positions are fixed so the layout is stable.
const HEARTS = [8, 22, 37, 51, 64, 78, 90].map((left, index) => ({
  left,
  delay: index * 0.35,
  size: 14 + ((index * 7) % 16),
}))
</script>

<template>
  <Teleport to="body">
    <Transition name="dc-curtain">
      <div
        v-if="props.celebration"
        class="dc-curtain"
        role="dialog"
        aria-modal="true"
        :aria-label="`You matched with ${props.celebration.profile.name}`"
      >
        <div class="dc-curtain__panel">
          <span
            v-for="(heart, index) in HEARTS"
            :key="index"
            class="dc-curtain__heart"
            :style="{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              width: `${heart.size}px`,
              height: `${heart.size}px`,
            }"
          >
            <NIcon name="like" filled :size="heart.size" />
          </span>

          <p class="dc-curtain__eyebrow">
            {{ props.celebration.viaSuperLike ? 'Your super like worked' : 'Mutual like' }}
          </p>
          <h2 class="dc-curtain__title">It's a match!</h2>
          <p class="dc-curtain__subtitle">
            You and {{ props.celebration.profile.name }} liked each other.
          </p>

          <div class="dc-curtain__pair">
            <img
              class="dc-curtain__avatar dc-curtain__avatar--me"
              :src="avatarFor('me')"
              alt="You"
            />
            <img
              class="dc-curtain__avatar dc-curtain__avatar--them"
              :src="props.celebration.profile.photos[0]"
              :alt="props.celebration.profile.name"
              @error="fallbackToPortrait($event, props.celebration.profile.id)"
            />
            <span class="dc-curtain__badge"><NIcon name="like" filled :size="20" /></span>
          </div>

          <div class="dc-curtain__actions">
            <NButton
              :to="{ name: ROUTE_NAMES.chat, params: { matchId: props.celebration.matchId } }"
              color="inverse"
              size="lg"
              block
              @click="emit('close')"
            >
              <NIcon name="send" :size="18" /> Send a message
            </NButton>
            <NButton color="inverse" variant="outline" size="lg" block @click="emit('close')">
              Keep swiping
            </NButton>
            <RouterLink
              class="dc-curtain__link"
              :to="{ name: ROUTE_NAMES.matches }"
              @click="emit('close')"
            >
              View all matches
            </RouterLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dc-curtain {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  background: var(--overlay);
}

.dc-curtain__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  max-width: var(--app-max-width);
  height: 100%;
  max-height: 56rem;
  padding: var(--space-8) var(--space-6);
  overflow: hidden;
  text-align: center;
  color: var(--base-0);
  background:
    radial-gradient(circle at 20% 10%, rgb(255 255 255 / 0.16), transparent 45%),
    linear-gradient(160deg, var(--flow-primary), var(--flow-s2) 45%, var(--flow-s3));
}

@media (min-width: 40rem) {
  .dc-curtain__panel {
    border-radius: var(--radius-2xl);
  }
}

.dc-curtain__heart {
  position: absolute;
  bottom: -30px;
  color: rgb(255 255 255 / 0.35);
  animation: dc-float 5s linear infinite;
  pointer-events: none;
}

@keyframes dc-float {
  to {
    transform: translateY(-110vh) rotate(25deg);
    opacity: 0;
  }
}

.dc-curtain__eyebrow {
  font-size: var(--text-xs);
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.85;
}

.dc-curtain__title {
  color: var(--base-0);
  font-size: 3rem;
  font-weight: 850;
  font-style: italic;
  letter-spacing: -0.03em;
  animation: dc-pop 600ms var(--ease-spring) both;
}

@keyframes dc-pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}

.dc-curtain__subtitle {
  opacity: 0.92;
}

.dc-curtain__pair {
  position: relative;
  display: flex;
  justify-content: center;
  margin: var(--space-8) 0;
}

.dc-curtain__avatar {
  width: 8.5rem;
  height: 8.5rem;
  border-radius: var(--radius-full);
  border: 4px solid var(--base-0);
  object-fit: cover;
  box-shadow: var(--shadow-lg);
}

.dc-curtain__avatar--me {
  transform: rotate(-8deg) translateX(14px);
  animation: dc-slide-left 600ms var(--ease-out) both;
}

.dc-curtain__avatar--them {
  transform: rotate(8deg) translateX(-14px);
  animation: dc-slide-right 600ms var(--ease-out) both;
}

@keyframes dc-slide-left {
  from {
    transform: translateX(-120px) rotate(-20deg);
    opacity: 0;
  }
}

@keyframes dc-slide-right {
  from {
    transform: translateX(120px) rotate(20deg);
    opacity: 0;
  }
}

.dc-curtain__badge {
  position: absolute;
  bottom: -10px;
  left: 50%;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  background: var(--base-0);
  color: var(--accent-500);
  box-shadow: var(--shadow-md);
  transform: translateX(-50%);
}

.dc-curtain__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  max-width: 20rem;
}

.dc-curtain__link {
  color: var(--base-0);
  font-size: var(--text-sm);
  opacity: 0.85;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dc-curtain-enter-active,
.dc-curtain-leave-active {
  transition: opacity var(--duration-slow) var(--ease-out);
}

.dc-curtain-enter-from,
.dc-curtain-leave-to {
  opacity: 0;
}
</style>
