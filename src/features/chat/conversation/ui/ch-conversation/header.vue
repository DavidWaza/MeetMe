<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NAvatar from '@/components/n/avatar/NAvatar.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { resolveStatus, STATUS_REGISTRY } from '@/utils/status'
import type { TypeChatPartner } from '../../domain/chat-entities'

const props = defineProps<{ partner: TypeChatPartner | null; isTyping: boolean }>()
const emit = defineEmits<{ profile: []; menu: [] }>()

function presenceLabel(raw: string): string {
  return STATUS_REGISTRY[resolveStatus(raw, 'presence')].label
}
</script>

<template>
  <header class="ch-header">
    <RouterLink
      :to="{ name: ROUTE_NAMES.matches }"
      class="ch-header__icon"
      aria-label="Back to matches"
    >
      <NIcon name="back" :size="22" />
    </RouterLink>

    <button v-if="props.partner" class="ch-header__who" @click="emit('profile')">
      <NAvatar
        :seed="props.partner.matchId"
        :src="props.partner.photo"
        :name="props.partner.name"
        :presence="props.partner.presence"
        :size="40"
      />
      <span class="ch-header__text">
        <span class="ch-header__name u-truncate">{{ props.partner.name }}</span>
        <span :class="['ch-header__sub', { 'ch-header__sub--typing': props.isTyping }]">
          {{ props.isTyping ? 'typing…' : presenceLabel(props.partner.presence) }}
        </span>
      </span>
    </button>
    <span v-else class="ch-header__who" />

    <button class="ch-header__icon" aria-label="Conversation options" @click="emit('menu')">
      <NIcon name="settings" :size="22" />
    </button>
  </header>
</template>

<style scoped>
.ch-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--appbar-height);
  padding: var(--space-2) var(--space-2);
  padding-top: max(var(--space-2), env(safe-area-inset-top));
  background: var(--surface);
  border-bottom: 1px solid var(--border-subtle);
  flex: none;
  z-index: 3;
}

.ch-header__icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  flex: none;
  border-radius: var(--radius-full);
  color: var(--text-body);
}

.ch-header__icon:hover {
  background: var(--surface-inset);
}

.ch-header__who {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
  text-align: left;
}

.ch-header__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ch-header__name {
  font-weight: 650;
  color: var(--text-strong);
}

.ch-header__sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.ch-header__sub--typing {
  color: var(--accent-fg);
  font-weight: 600;
}
</style>
