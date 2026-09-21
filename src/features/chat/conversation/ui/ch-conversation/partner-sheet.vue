<script setup lang="ts">
import { fallbackToPortrait } from '@/utils/profile-photos'
import NSheet from '@/components/n/sheet/NSheet.vue'
import NStatus from '@/components/n/badge/NStatus.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import { formatDayDivider } from '@/utils/date-formatters'
import type { TypeChatPartner } from '../../domain/chat-entities'

const props = defineProps<{ open: boolean; partner: TypeChatPartner }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <NSheet :open="props.open" @update:open="emit('update:open', $event)">
    <div class="ch-partner">
      <img
        class="ch-partner__photo"
        :src="props.partner.photo"
        :alt="props.partner.name"
        @error="fallbackToPortrait($event, props.partner.matchId)"
      />
      <div>
        <h2 class="ch-partner__name">{{ props.partner.name }}, {{ props.partner.age }}</h2>
        <p v-if="props.partner.pronouns" class="ch-partner__muted">{{ props.partner.pronouns }}</p>
      </div>
      <div class="ch-partner__statuses">
        <NStatus :status="props.partner.verification" kind="verification" />
        <NStatus :status="props.partner.presence" kind="presence" />
      </div>
      <ul class="ch-partner__facts">
        <li v-if="props.partner.jobLabel">
          <NIcon name="job" :size="16" /> {{ props.partner.jobLabel }}
        </li>
        <li><NIcon name="distance" :size="16" /> {{ props.partner.city }}</li>
        <li>
          <NIcon name="match" :size="16" /> Matched
          {{ formatDayDivider(props.partner.matchedAt).toLowerCase() }}
        </li>
      </ul>
      <p class="ch-partner__bio">{{ props.partner.bio }}</p>
      <div
        v-for="prompt in props.partner.prompts"
        :key="prompt.question"
        class="ch-partner__prompt"
      >
        <p class="ch-partner__muted">{{ prompt.question }}</p>
        <p class="ch-partner__answer">{{ prompt.answer }}</p>
      </div>
      <div class="ch-partner__interests">
        <span v-for="interest in props.partner.interests" :key="interest">{{ interest }}</span>
      </div>
    </div>
  </NSheet>
</template>

<style scoped>
.ch-partner {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ch-partner__photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius-xl);
}

.ch-partner__name {
  font-size: var(--text-2xl);
}

.ch-partner__muted {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.ch-partner__statuses {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.ch-partner__facts {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.ch-partner__facts li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.ch-partner__bio {
  color: var(--text-strong);
}

.ch-partner__prompt {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--surface-inset);
}

.ch-partner__answer {
  margin-top: var(--space-1);
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--text-strong);
}

.ch-partner__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.ch-partner__interests span {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-strong);
  font-size: var(--text-sm);
  color: var(--text-strong);
}
</style>
