<script setup lang="ts">
import NAppBar from '@/components/n/page/NAppBar.vue'
import NPageContent from '@/components/n/page/NPageContent.vue'
import NButton from '@/components/n/button/NButton.vue'
import NChip from '@/components/n/chip/NChip.vue'
import NEmpty from '@/components/n/empty/NEmpty.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NInput from '@/components/n/field/NInput.vue'
import NSpinner from '@/components/n/spinner/NSpinner.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import useMtInbox from '../../composition/use-mt-inbox'
import MtInboxNewMatches from './new-matches.vue'
import MtInboxRow from './row.vue'

const {
  chips,
  activeFilterId,
  search,
  newMatches,
  conversations,
  hasAnyMatches,
  hasAnyConversations,
  isLoading,
  loadError,
  onSelectFilter,
  retry,
} = useMtInbox()
</script>

<template>
  <NAppBar>Matches</NAppBar>

  <NPageContent class="mt-inbox">
    <div v-if="isLoading" class="mt-inbox__loading">
      <NSpinner :size="28" label="Loading matches" />
    </div>

    <NEmpty
      v-else-if="loadError"
      icon="alert"
      title="Could not load matches"
      :description="loadError"
    >
      <NButton variant="soft" @click="retry">Try again</NButton>
    </NEmpty>

    <NEmpty
      v-else-if="!hasAnyMatches"
      icon="like"
      title="No matches yet"
      description="When someone you liked likes you back, they show up here."
    >
      <NButton :to="{ name: ROUTE_NAMES.discover }"
        ><NIcon name="discover" :size="18" /> Start swiping</NButton
      >
    </NEmpty>

    <template v-else>
      <div class="mt-inbox__search">
        <NIcon name="search" :size="18" class="mt-inbox__search-icon" />
        <NInput v-model="search" placeholder="Search matches" class="mt-inbox__search-input" />
      </div>

      <MtInboxNewMatches v-if="newMatches.length" :matches="newMatches" />

      <section class="mt-inbox__messages" aria-labelledby="mt-inbox-messages">
        <h2 id="mt-inbox-messages" class="mt-inbox__heading">Messages</h2>

        <div
          v-if="hasAnyConversations"
          class="mt-inbox__chips"
          role="group"
          aria-label="Filter conversations"
        >
          <NChip
            v-for="chip in chips"
            :key="chip.id"
            :active="chip.id === activeFilterId"
            :count="chip.count"
            @click="onSelectFilter(chip.id)"
          >
            {{ chip.label }}
          </NChip>
        </div>

        <ul v-if="conversations.length" class="mt-inbox__list">
          <li v-for="match in conversations" :key="match.id"><MtInboxRow :match="match" /></li>
        </ul>

        <p v-else-if="hasAnyConversations" class="mt-inbox__none">Nothing here right now.</p>
        <p v-else class="mt-inbox__none">No conversations yet. Tap a new match above to say hi.</p>
      </section>
    </template>
  </NPageContent>
</template>

<style scoped>
.mt-inbox {
  gap: var(--space-5);
  padding-block: var(--space-4) var(--space-6);
}

.mt-inbox__loading {
  display: grid;
  place-items: center;
  flex: 1;
  color: var(--accent-500);
}

.mt-inbox__search {
  position: relative;
  margin-inline: var(--space-4);
}

.mt-inbox__search-icon {
  position: absolute;
  top: 50%;
  left: var(--space-4);
  color: var(--text-muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.mt-inbox__search-input {
  padding-left: var(--space-10);
  border-radius: var(--radius-full);
  background: var(--surface-inset);
  border-color: transparent;
}

.mt-inbox__messages {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.mt-inbox__heading {
  padding-inline: var(--space-4);
  font-size: var(--text-sm);
  color: var(--accent-fg);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mt-inbox__chips {
  display: flex;
  gap: var(--space-2);
  padding-inline: var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
}

.mt-inbox__list {
  display: flex;
  flex-direction: column;
}

.mt-inbox__none {
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
}
</style>
