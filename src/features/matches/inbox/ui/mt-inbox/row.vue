<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NAvatar from '@/components/n/avatar/NAvatar.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NStatus from '@/components/n/badge/NStatus.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { formatRelative } from '@/utils/date-formatters'
import { resolveStatus } from '@/utils/status'
import type { TypeInboxMatch } from '../../domain/inbox-entities'

const props = defineProps<{ match: TypeInboxMatch }>()
</script>

<template>
  <RouterLink
    :to="{ name: ROUTE_NAMES.chat, params: { matchId: props.match.id } }"
    :class="['mt-row', { 'mt-row--unread': props.match.unreadCount > 0 }]"
  >
    <NAvatar
      :seed="props.match.id"
      :src="props.match.photo"
      :name="props.match.name"
      :presence="props.match.presence"
      :size="56"
    />
    <div class="mt-row__body">
      <div class="mt-row__top">
        <span class="mt-row__name u-truncate">{{ props.match.name }}</span>
        <!-- Raw timestamp in, formatted at render: the time pattern setting reaches it. -->
        <time
          v-if="props.match.lastMessage"
          class="mt-row__time"
          :datetime="props.match.lastMessage.sentAt"
        >
          {{ formatRelative(props.match.lastMessage.sentAt) }}
        </time>
      </div>
      <div class="mt-row__bottom">
        <p class="mt-row__preview u-truncate">
          <template v-if="props.match.lastMessage?.fromMe">
            <NIcon
              :name="
                resolveStatus(props.match.lastMessage.delivery, 'delivery') === 'read'
                  ? 'read'
                  : 'delivered'
              "
              :size="14"
              :class="[
                'mt-row__tick',
                {
                  'mt-row__tick--read':
                    resolveStatus(props.match.lastMessage.delivery, 'delivery') === 'read',
                },
              ]"
            />
            You:
          </template>
          {{ props.match.lastMessage?.body }}
        </p>
        <span v-if="props.match.unreadCount" class="mt-row__unread">{{
          props.match.unreadCount
        }}</span>
      </div>
      <NStatus
        :status="props.match.connectionState"
        kind="connection"
        size="sm"
        class="mt-row__status"
      />
    </div>
  </RouterLink>
</template>

<style scoped>
.mt-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: inherit;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.mt-row:hover {
  background: var(--surface-sunken);
}

.mt-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mt-row__top,
.mt-row__bottom {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.mt-row__name {
  flex: 1;
  font-weight: 650;
  color: var(--text-strong);
}

.mt-row__time {
  flex: none;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.mt-row__preview {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.mt-row--unread .mt-row__preview {
  color: var(--text-strong);
  font-weight: 600;
}

.mt-row--unread .mt-row__time {
  color: var(--accent-fg);
  font-weight: 600;
}

.mt-row__tick {
  flex: none;
  color: var(--text-muted);
}

.mt-row__tick--read {
  color: var(--blue-500);
}

.mt-row__unread {
  flex: none;
  display: grid;
  place-items: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: 6px;
  border-radius: var(--radius-full);
  background: var(--accent-500);
  color: var(--base-0);
  font-size: var(--text-2xs);
  font-weight: 700;
}

.mt-row__status {
  align-self: flex-start;
  margin-top: 2px;
}
</style>
