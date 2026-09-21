<script setup lang="ts">
import { ref } from 'vue'
import NAppBar from '@/components/n/page/NAppBar.vue'
import NPageContent from '@/components/n/page/NPageContent.vue'
import NButton from '@/components/n/button/NButton.vue'
import NCard from '@/components/n/card/NCard.vue'
import NCardAction from '@/components/n/card/NCardAction.vue'
import NCardContent from '@/components/n/card/NCardContent.vue'
import NCardDescription from '@/components/n/card/NCardDescription.vue'
import NCardFooter from '@/components/n/card/NCardFooter.vue'
import NCardHeader from '@/components/n/card/NCardHeader.vue'
import NCardTitle from '@/components/n/card/NCardTitle.vue'
import NChip from '@/components/n/chip/NChip.vue'
import NField from '@/components/n/field/NField.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NInput from '@/components/n/field/NInput.vue'
import NSpinner from '@/components/n/spinner/NSpinner.vue'
import { avatarFor } from '@/lib/portrait'
import useAProfile from '../../composition/use-a-profile'
import { BIO_MAX_LENGTH, INTEREST_OPTIONS, INTERESTS_MAX } from '../../domain/profile-entities'
import AProfileDiscoveryCard from './discovery-card.vue'
import AProfileSettingsCard from './settings-card.vue'

const {
  profile,
  draft,
  errors,
  isDirty,
  isValid,
  isLoading,
  isSaving,
  isResetting,
  toggleInterest,
  save,
  discard,
  resetActivity,
} = useAProfile()

const confirmingReset = ref(false)

async function onReset(): Promise<void> {
  if (await resetActivity()) confirmingReset.value = false
}
</script>

<template>
  <NAppBar>Profile</NAppBar>

  <NPageContent class="a-profile">
    <div v-if="isLoading || !draft || !profile" class="a-profile__loading">
      <NSpinner :size="28" label="Loading profile" />
    </div>

    <template v-else>
      <section class="a-profile__hero">
        <img class="a-profile__avatar" :src="avatarFor('me')" alt="Your photo" />
        <h1 class="a-profile__name">{{ profile.name }}, {{ profile.age }}</h1>
        <p class="a-profile__meta">
          <NIcon name="distance" :size="14" /> {{ profile.city }}
          <template v-if="profile.jobTitle"> · {{ profile.jobTitle }}</template>
        </p>
      </section>

      <NCard>
        <NCardHeader>
          <NCardTitle>About you</NCardTitle>
          <NCardDescription>What people see on your card.</NCardDescription>
        </NCardHeader>
        <NCardContent class="a-profile__fields">
          <NField label="First name" :error="errors.name">
            <template #default="{ id }"
              ><NInput :id="id" v-model="draft.name" :maxlength="40"
            /></template>
          </NField>
          <NField label="Job title">
            <template #default="{ id }"
              ><NInput :id="id" v-model="draft.jobTitle" :maxlength="60"
            /></template>
          </NField>
          <NField label="City">
            <template #default="{ id }"
              ><NInput :id="id" v-model="draft.city" :maxlength="40"
            /></template>
          </NField>
          <NField label="Bio" :error="errors.bio" :hint="`${draft.bio.length} / ${BIO_MAX_LENGTH}`">
            <template #default="{ id }">
              <NInput
                :id="id"
                v-model="draft.bio"
                multiline
                :rows="4"
                :maxlength="BIO_MAX_LENGTH + 20"
              />
            </template>
          </NField>
        </NCardContent>
      </NCard>

      <NCard>
        <NCardHeader>
          <NCardTitle>Interests</NCardTitle>
          <NCardDescription
            >Shared interests lift your chats. Pick up to {{ INTERESTS_MAX }}.</NCardDescription
          >
          <NCardAction>
            <span class="a-profile__count">{{ draft.interests.length }}/{{ INTERESTS_MAX }}</span>
          </NCardAction>
        </NCardHeader>
        <NCardContent class="a-profile__interests">
          <NChip
            v-for="interest in INTEREST_OPTIONS"
            :key="interest"
            :active="draft.interests.includes(interest)"
            @click="toggleInterest(interest)"
          >
            {{ interest }}
          </NChip>
        </NCardContent>
      </NCard>

      <AProfileDiscoveryCard
        v-model="draft.preferences"
        :gender="profile.gender"
        :age-range-error="errors.ageRange"
      />

      <AProfileSettingsCard />

      <NCard class="a-profile__danger">
        <NCardHeader>
          <NCardTitle>Your activity</NCardTitle>
          <NCardDescription>
            Clears your swipes, matches, chats and reply rules. Your account and profile stay.
          </NCardDescription>
        </NCardHeader>
        <NCardFooter>
          <NButton
            v-if="!confirmingReset"
            color="destructive"
            variant="soft"
            block
            @click="confirmingReset = true"
          >
            <NIcon name="refresh" :size="16" /> Reset activity
          </NButton>
          <template v-else>
            <NButton color="neutral" variant="outline" block @click="confirmingReset = false"
              >Cancel</NButton
            >
            <NButton color="destructive" block :loading="isResetting" @click="onReset"
              >Clear my activity</NButton
            >
          </template>
        </NCardFooter>
      </NCard>

      <!-- Account actions owned by other slices (log out) are composed in by the page. -->
      <slot name="footer" />
    </template>
  </NPageContent>

  <Transition name="a-savebar">
    <div v-if="isDirty" class="a-savebar" role="region" aria-label="Unsaved changes">
      <span class="a-savebar__text">Unsaved changes</span>
      <NButton color="inverse" variant="outline" size="sm" @click="discard">Discard</NButton>
      <NButton size="sm" :loading="isSaving" :disabled="!isValid" @click="save">Save</NButton>
    </div>
  </Transition>
</template>

<style scoped>
.a-profile {
  gap: var(--space-4);
  padding: var(--space-4) var(--space-4) var(--space-16);
  background: var(--surface-sunken);
}

.a-profile__loading {
  flex: 1;
  display: grid;
  place-items: center;
  color: var(--accent-500);
}

.a-profile__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-4) 0 var(--space-2);
  text-align: center;
}

.a-profile__avatar {
  width: 6.5rem;
  height: 6.5rem;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-full);
  border: 3px solid var(--surface);
  box-shadow:
    0 0 0 3px var(--accent-500),
    var(--shadow-md);
}

.a-profile__name {
  font-size: var(--text-2xl);
}

.a-profile__meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.a-profile__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.a-profile__count {
  font-size: var(--text-sm);
  font-weight: 650;
  color: var(--accent-fg);
  font-variant-numeric: tabular-nums;
}

.a-profile__interests {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.a-profile__danger {
  border-color: var(--red-150);
}

.a-savebar {
  position: absolute;
  left: var(--space-3);
  right: var(--space-3);
  bottom: calc(var(--tabbar-height) + var(--space-3));
  z-index: 20;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  background: var(--base-900);
  box-shadow: var(--shadow-lg);
}

.a-savebar__text {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--base-0);
}

.a-savebar-enter-active,
.a-savebar-leave-active {
  transition:
    transform var(--duration-base) var(--ease-out),
    opacity var(--duration-base) var(--ease-out);
}

.a-savebar-enter-from,
.a-savebar-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>
