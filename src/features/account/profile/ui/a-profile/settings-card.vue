<script setup lang="ts">
import NCard from '@/components/n/card/NCard.vue'
import NCardContent from '@/components/n/card/NCardContent.vue'
import NCardDescription from '@/components/n/card/NCardDescription.vue'
import NCardHeader from '@/components/n/card/NCardHeader.vue'
import NCardTitle from '@/components/n/card/NCardTitle.vue'
import NChip from '@/components/n/chip/NChip.vue'
import NField from '@/components/n/field/NField.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NSwitch from '@/components/n/switch/NSwitch.vue'
import { usePreferencesStore, type TypeThemePreference } from '@/stores/preferences'
import { formatTime, type TypeTimePattern } from '@/utils/date-formatters'

/** Device preferences apply instantly — they are not part of the profile draft. */
const preferences = usePreferencesStore()

const THEMES: { id: TypeThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

const TIME_PATTERNS: { id: TypeTimePattern; label: string }[] = [
  { id: '12h', label: '12-hour' },
  { id: '24h', label: '24-hour' },
]

const sample = new Date()
</script>

<template>
  <NCard>
    <NCardHeader>
      <NCardTitle>App settings</NCardTitle>
      <NCardDescription>Stored on this device only.</NCardDescription>
    </NCardHeader>
    <NCardContent class="a-settings">
      <NField label="Theme">
        <div class="a-settings__chips" role="radiogroup" aria-label="Theme">
          <NChip
            v-for="theme in THEMES"
            :key="theme.id"
            role="radio"
            :aria-checked="preferences.theme === theme.id"
            :active="preferences.theme === theme.id"
            @click="preferences.theme = theme.id"
          >
            {{ theme.label }}
          </NChip>
        </div>
      </NField>

      <!-- Resolved at render: flipping this re-formats every visible timestamp. -->
      <NField label="Time format" :hint="`Now: ${formatTime(sample)} (Lagos time)`">
        <div class="a-settings__chips" role="radiogroup" aria-label="Time format">
          <NChip
            v-for="pattern in TIME_PATTERNS"
            :key="pattern.id"
            role="radio"
            :aria-checked="preferences.timePattern === pattern.id"
            :active="preferences.timePattern === pattern.id"
            @click="preferences.timePattern = pattern.id"
          >
            {{ pattern.label }}
          </NChip>
        </div>
      </NField>

      <NSwitch v-model="preferences.showCoach">
        <template #icon><NIcon name="flame" :size="20" /></template>
        Conversation coach
        <template #detail>Interest meter and feedback in every chat</template>
      </NSwitch>
    </NCardContent>
  </NCard>
</template>

<style scoped>
.a-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.a-settings__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
</style>
