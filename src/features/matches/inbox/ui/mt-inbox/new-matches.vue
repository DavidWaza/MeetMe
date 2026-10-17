<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NIcon from '@/components/n/icon/NIcon.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import type { TypeInboxMatch } from '../../domain/inbox-entities'

const props = defineProps<{ matches: TypeInboxMatch[] }>()
</script>

<template>
  <section class="mt-new" aria-labelledby="mt-new-title">
    <h2 id="mt-new-title" class="mt-new__title">
      New matches <span class="mt-new__count">{{ props.matches.length }}</span>
    </h2>
    <ul class="mt-new__rail">
      <li v-for="match in props.matches" :key="match.id">
        <RouterLink
          :to="{ name: ROUTE_NAMES.chat, params: { matchId: match.id } }"
          class="mt-new__item"
        >
          <span class="mt-new__photo-wrap">
            <img class="mt-new__photo" :src="match.photo" :alt="match.name" />
            <span v-if="match.viaSuperLike" class="mt-new__super" title="Super like">
              <NIcon name="superlike" :size="12" filled />
            </span>
          </span>
          <span class="mt-new__name u-truncate">{{ match.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.mt-new {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mt-new__title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-inline: var(--space-4);
  font-size: var(--text-sm);
  color: var(--accent-fg);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mt-new__count {
  display: inline-grid;
  place-items: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: var(--space-1);
  border-radius: var(--radius-full);
  background: var(--accent-500);
  color: var(--base-0);
  font-size: var(--text-2xs);
  letter-spacing: 0;
}

.mt-new__rail {
  display: flex;
  gap: var(--space-3);
  padding-inline: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}

.mt-new__rail::-webkit-scrollbar {
  display: none;
}

.mt-new__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  width: 5.25rem;
  scroll-snap-align: start;
  color: var(--text-strong);
}

.mt-new__photo-wrap {
  position: relative;
  padding: 3px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--flow-primary), var(--flow-secondary));
}

.mt-new__photo {
  width: 4.75rem;
  height: 6.25rem;
  border-radius: calc(var(--radius-lg) - 3px);
  object-fit: cover;
  border: 2px solid var(--surface);
}

.mt-new__super {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: var(--radius-full);
  background: var(--blue-500);
  color: var(--base-0);
  border: 2px solid var(--surface);
}

.mt-new__name {
  max-width: 100%;
  font-size: var(--text-sm);
  font-weight: 600;
}
</style>
