<script setup lang="ts">
import { computed } from 'vue'
import NSheet from '@/components/n/sheet/NSheet.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NStatus from '@/components/n/badge/NStatus.vue'
import NButton from '@/components/n/button/NButton.vue'
import { formatRelative } from '@/utils/date-formatters'
import type { TypeDeckProfile, TypeSwipeAction } from '../../domain/deck-entities'

const props = defineProps<{ profile: TypeDeckProfile | null; open: boolean }>()
const emit = defineEmits<{ 'update:open': [boolean]; act: [TypeSwipeAction] }>()

const facts = computed(() => {
  const profile = props.profile
  if (!profile) return []
  return [
    profile.jobLabel && { icon: 'job' as const, text: profile.jobLabel },
    profile.school && { icon: 'education' as const, text: profile.school },
    { icon: 'distance' as const, text: `Lives in ${profile.city} · ${profile.distanceKm} km away` },
    profile.heightCm && { icon: 'user' as const, text: `${profile.heightCm} cm` },
  ].filter(Boolean) as { icon: 'job' | 'education' | 'distance' | 'user'; text: string }[]
})

function act(action: TypeSwipeAction): void {
  emit('update:open', false)
  emit('act', action)
}
</script>

<template>
  <NSheet :open="props.open" @update:open="emit('update:open', $event)">
    <div v-if="props.profile" class="dc-sheet">
      <div class="dc-sheet__photos">
        <img
          v-for="(photo, index) in props.profile.photos"
          :key="index"
          :src="photo"
          :alt="`${props.profile.name}, photo ${index + 1}`"
          class="dc-sheet__photo"
        />
      </div>

      <header class="dc-sheet__header">
        <h2 class="dc-sheet__name">
          {{ props.profile.name }}, <span>{{ props.profile.age }}</span>
        </h2>
        <p v-if="props.profile.pronouns" class="dc-sheet__pronouns">{{ props.profile.pronouns }}</p>
        <div class="dc-sheet__statuses">
          <NStatus :status="props.profile.verification" kind="verification" />
          <NStatus :status="props.profile.presence" kind="presence" />
          <span class="dc-sheet__active"
            >Active {{ formatRelative(props.profile.lastActiveAt) }}</span
          >
        </div>
      </header>

      <ul class="dc-sheet__facts">
        <li v-for="fact in facts" :key="fact.text">
          <NIcon :name="fact.icon" :size="18" /> {{ fact.text }}
        </li>
      </ul>

      <section class="dc-sheet__section">
        <h3>About</h3>
        <p>{{ props.profile.bio }}</p>
      </section>

      <section
        v-for="prompt in props.profile.prompts"
        :key="prompt.question"
        class="dc-sheet__prompt"
      >
        <p class="dc-sheet__prompt-q">{{ prompt.question }}</p>
        <p class="dc-sheet__prompt-a">{{ prompt.answer }}</p>
      </section>

      <section class="dc-sheet__section">
        <h3>Interests</h3>
        <div class="dc-sheet__interests">
          <span
            v-for="interest in props.profile.interests"
            :key="interest"
            class="dc-sheet__interest"
          >
            {{ interest }}
          </span>
        </div>
      </section>
    </div>

    <template #footer>
      <NButton color="destructive" variant="soft" size="lg" block @click="act('pass')">
        <NIcon name="pass" :size="18" /> Pass
      </NButton>
      <NButton
        color="info"
        variant="soft"
        size="icon-lg"
        aria-label="Super like"
        @click="act('superlike')"
      >
        <NIcon name="superlike" :size="20" filled />
      </NButton>
      <NButton size="lg" block @click="act('like')"
        ><NIcon name="like" :size="18" filled /> Like</NButton
      >
    </template>
  </NSheet>
</template>

<style scoped>
.dc-sheet {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding-bottom: var(--space-2);
}

.dc-sheet__photos {
  display: flex;
  gap: var(--space-2);
  margin-inline: calc(var(--space-5) * -1);
  padding-inline: var(--space-5);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.dc-sheet__photo {
  flex: none;
  width: 72%;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius-xl);
  object-fit: cover;
  scroll-snap-align: start;
}

.dc-sheet__name {
  font-size: var(--text-2xl);
}

.dc-sheet__name span {
  font-weight: 400;
}

.dc-sheet__pronouns {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.dc-sheet__statuses {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.dc-sheet__active {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.dc-sheet__facts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-body);
}

.dc-sheet__facts li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.dc-sheet__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dc-sheet__section h3 {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.dc-sheet__section p {
  color: var(--text-strong);
}

.dc-sheet__prompt {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--surface-inset);
}

.dc-sheet__prompt-q {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-muted);
}

.dc-sheet__prompt-a {
  margin-top: var(--space-1);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-strong);
  line-height: 1.35;
}

.dc-sheet__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.dc-sheet__interest {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-strong);
  font-size: var(--text-sm);
  color: var(--text-strong);
}
</style>
