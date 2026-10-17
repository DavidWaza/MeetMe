<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import NAppBar from '@/components/n/page/NAppBar.vue'
import NPageContent from '@/components/n/page/NPageContent.vue'
import NButton from '@/components/n/button/NButton.vue'
import NEmpty from '@/components/n/empty/NEmpty.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NLogo from '@/components/n/logo/NLogo.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { useSessionStore } from '@/stores/session'
import useDcDeck from '../../composition/use-dc-deck'
import type { TypeSwipeAction } from '../../domain/deck-entities'
import DcDeckActions from './actions.vue'
import DcDeckCard from './card.vue'
import DcDeckMatchCurtain from './match-curtain.vue'
import DcDeckProfileSheet from './profile-sheet.vue'
import DcDeckSkeleton from './skeleton.vue'

const session = useSessionStore()

const {
  current,
  stack,
  isLoading,
  isEmpty,
  loadError,
  canUndo,
  isUndoing,
  isResetting,
  celebration,
  swipe,
  undo,
  reset,
  retry,
  dismissCelebration,
} = useDcDeck()

type TypeCardInstance = InstanceType<typeof DcDeckCard>

// Keyed by profile id: which card is "top" changes every swipe, and a
// positional ref can be nulled by the outgoing card after the new one registers.
const cardRefs = new Map<string, TypeCardInstance>()

function setCardRef(id: string, el: unknown): void {
  if (el) cardRefs.set(id, el as TypeCardInstance)
  else cardRefs.delete(id)
}

const lift = ref(0)
const busy = ref(false)
const detailsOpen = ref(false)
const hasLoadedOnce = ref(false)

watch(isLoading, (loading) => {
  if (!loading) setTimeout(() => (hasLoadedOnce.value = true), 0)
})

/** Buttons and keys route through the card, so every swipe gets the same fly-out. */
async function act(action: TypeSwipeAction): Promise<void> {
  if (busy.value || !current.value) return
  busy.value = true
  const card = cardRefs.get(current.value.id)
  if (card) {
    await card.fling(action)
  } else {
    await swipe(action)
    busy.value = false
  }
}

async function onSwiped(action: TypeSwipeAction): Promise<void> {
  lift.value = 0
  busy.value = false
  await swipe(action)
}

function onKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, [contenteditable="true"]')) return
  if (detailsOpen.value || celebration.value) return

  const keyMap: Partial<Record<string, TypeSwipeAction>> = {
    ArrowLeft: 'pass',
    ArrowRight: 'like',
    ArrowUp: 'superlike',
  }
  const action = keyMap[event.key]
  if (action) {
    event.preventDefault()
    void act(action)
  } else if ((event.key === 'Backspace' || event.key === 'z') && canUndo.value) {
    event.preventDefault()
    void undo()
  } else if (event.key === 'Enter' && current.value) {
    detailsOpen.value = true
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <NAppBar>
    <template #lead>
      <RouterLink
        :to="{ name: ROUTE_NAMES.profile }"
        class="dc-deck__icon-link"
        aria-label="Discovery settings"
      >
        <NIcon name="settings" :size="22" />
      </RouterLink>
    </template>
    <NLogo :size="26" wordmark />
    <template #trail>
      <RouterLink
        :to="{ name: ROUTE_NAMES.matches }"
        class="dc-deck__icon-link"
        aria-label="Matches"
      >
        <NIcon name="messages" :size="22" />
      </RouterLink>
    </template>
  </NAppBar>

  <NPageContent :scroll="false" class="dc-deck">
    <div class="dc-deck__stage">
      <DcDeckSkeleton v-if="isLoading" />

      <NEmpty
        v-else-if="loadError"
        icon="alert"
        title="Could not load profiles"
        :description="loadError"
        class="dc-deck__empty"
      >
        <NButton variant="soft" @click="retry">Try again</NButton>
      </NEmpty>

      <NEmpty
        v-else-if="isEmpty"
        icon="discover"
        title="You've seen everyone nearby"
        description="Widen your distance or age range, or bring back the people you passed on."
        class="dc-deck__empty"
      >
        <div class="dc-deck__empty-actions">
          <NButton :loading="isResetting" @click="reset"
            ><NIcon name="refresh" :size="18" /> Refresh deck</NButton
          >
          <NButton variant="ghost" color="neutral" :to="{ name: ROUTE_NAMES.profile }"
            >Adjust preferences</NButton
          >
        </div>
      </NEmpty>

      <template v-else>
        <!-- Rendered bottom-up so the top card is last in the DOM and paints above. -->
        <DcDeckCard
          v-for="(profile, index) in [...stack].reverse()"
          :key="profile.id"
          :ref="(el) => setCardRef(profile.id, el)"
          :profile="profile"
          :depth="stack.length - 1 - index"
          :lift="lift"
          :animate-enter="hasLoadedOnce"
          @drag="lift = $event"
          @swiped="onSwiped"
          @details="detailsOpen = true"
        />
      </template>
    </div>

    <DcDeckActions
      :disabled="!current || busy || isLoading"
      :can-undo="canUndo"
      :is-undoing="isUndoing"
      @act="act"
      @undo="undo"
    />

    <p class="dc-deck__hint" aria-hidden="true">← pass · → like · ↑ super like · ⌫ rewind</p>
  </NPageContent>

  <DcDeckProfileSheet v-model:open="detailsOpen" :profile="current" @act="act" />
  <DcDeckMatchCurtain
    :celebration="celebration"
    :me-name="session.user?.firstName ?? 'You'"
    @close="dismissCelebration"
  />
</template>

<style scoped>
.dc-deck {
  background: var(--surface);
}

.dc-deck__icon-link {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-full);
  color: var(--text-muted);
}

.dc-deck__icon-link:hover {
  background: var(--surface-inset);
  color: var(--text-strong);
}

.dc-deck__stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 22rem;
  margin: var(--space-3) var(--space-3) 0;
}

.dc-deck__empty {
  position: absolute;
  inset: 0;
}

.dc-deck__empty-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dc-deck__hint {
  display: none;
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding-bottom: var(--space-3);
  margin-top: calc(var(--space-2) * -1);
}

/* Keyboard hints only where a keyboard is likely. */
@media (hover: hover) and (pointer: fine) {
  .dc-deck__hint {
    display: block;
  }
}
</style>
