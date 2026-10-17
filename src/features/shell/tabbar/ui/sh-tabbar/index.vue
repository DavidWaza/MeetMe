<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import NIcon from '@/components/n/icon/NIcon.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import useShTabbar from '../../composition/use-sh-tabbar'
import { SHELL_NAVIGATION, type TypeNavItem } from '../../domain/shell-navigation'

const props = withDefaults(defineProps<{ hidden?: boolean }>(), { hidden: false })

const route = useRoute()
const router = useRouter()

const { inboxBadge } = useShTabbar({
  activeMatchId: () =>
    route.name === ROUTE_NAMES.chat ? String(route.params.matchId ?? '') || null : null,
  onOpenMatch: (matchId) => void router.push({ name: ROUTE_NAMES.chat, params: { matchId } }),
})

function isActive(item: TypeNavItem): boolean {
  return route.name === item.name || item.alsoActiveOn.some((name) => name === route.name)
}

function badgeFor(item: TypeNavItem): number {
  return item.badge === 'inbox' ? inboxBadge.value : 0
}
</script>

<template>
  <nav v-show="!props.hidden" class="sh-tabbar" aria-label="Main">
    <RouterLink
      v-for="item in SHELL_NAVIGATION"
      :key="item.name"
      :to="{ name: item.name }"
      :class="['sh-tabbar__item', { 'sh-tabbar__item--active': isActive(item) }]"
      :aria-current="isActive(item) ? 'page' : undefined"
    >
      <span class="sh-tabbar__icon">
        <NIcon :name="item.icon" :size="24" :filled="isActive(item) && item.icon === 'messages'" />
        <span v-if="badgeFor(item)" class="sh-tabbar__badge">
          {{ badgeFor(item) > 9 ? '9+' : badgeFor(item) }}
        </span>
      </span>
      <span class="sh-tabbar__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.sh-tabbar {
  flex: none;
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  height: calc(var(--tabbar-height) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface);
  border-top: 1px solid var(--border-subtle);
  z-index: 5;
}

.sh-tabbar__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-muted);
  font-size: var(--text-2xs);
  font-weight: 600;
  transition: color var(--duration-fast) var(--ease-out);
}

.sh-tabbar__item--active {
  color: var(--accent-500);
}

.sh-tabbar__icon {
  position: relative;
  display: grid;
  place-items: center;
  transition: transform var(--duration-base) var(--ease-spring);
}

.sh-tabbar__item--active .sh-tabbar__icon {
  transform: translateY(-1px) scale(1.06);
}

.sh-tabbar__badge {
  position: absolute;
  top: -5px;
  right: -10px;
  display: grid;
  place-items: center;
  min-width: 1.125rem;
  height: 1.125rem;
  padding-inline: 4px;
  border-radius: var(--radius-full);
  background: var(--accent-500);
  color: var(--base-0);
  border: 2px solid var(--surface);
  font-size: 0.625rem;
  font-weight: 750;
  box-sizing: content-box;
}
</style>
