<script setup lang="ts">
import NCard from '@/components/n/card/NCard.vue'
import NCardContent from '@/components/n/card/NCardContent.vue'
import NCardDescription from '@/components/n/card/NCardDescription.vue'
import NCardHeader from '@/components/n/card/NCardHeader.vue'
import NCardTitle from '@/components/n/card/NCardTitle.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NField from '@/components/n/field/NField.vue'
import NRange from '@/components/n/field/NRange.vue'
import {
  AGE_CEILING,
  AGE_FLOOR,
  DISTANCE_MAX_KM,
  SHOWN_TO,
  type TypeDiscoveryPreferences,
  type TypeMemberGender,
} from '../../domain/profile-entities'

const props = defineProps<{ gender: TypeMemberGender; ageRangeError?: string }>()
const preferences = defineModel<TypeDiscoveryPreferences>({ required: true })
</script>

<template>
  <NCard>
    <NCardHeader>
      <NCardTitle>Discovery</NCardTitle>
      <NCardDescription
        >Who shows up in your deck. Saved changes apply on your next swipe.</NCardDescription
      >
    </NCardHeader>
    <NCardContent class="a-discovery">
      <p class="a-discovery__shown">
        <NIcon name="discover" :size="16" />
        <span>
          You're shown <strong>{{ SHOWN_TO[props.gender] }}</strong
          >, based on the gender you signed up with.
        </span>
      </p>

      <NField :error="props.ageRangeError">
        <div class="a-discovery__row">
          <span class="a-discovery__label">Age range</span>
          <span class="a-discovery__value"
            >{{ preferences.ageMin }} – {{ preferences.ageMax }}</span
          >
        </div>
        <label class="a-discovery__sub">
          <span>Min</span>
          <NRange
            v-model="preferences.ageMin"
            :min="AGE_FLOOR"
            :max="AGE_CEILING"
            aria-label="Minimum age"
          />
        </label>
        <label class="a-discovery__sub">
          <span>Max</span>
          <NRange
            v-model="preferences.ageMax"
            :min="AGE_FLOOR"
            :max="AGE_CEILING"
            aria-label="Maximum age"
          />
        </label>
      </NField>

      <NField>
        <div class="a-discovery__row">
          <span class="a-discovery__label">Maximum distance</span>
          <span class="a-discovery__value">{{ preferences.maxDistanceKm }} km</span>
        </div>
        <NRange
          v-model="preferences.maxDistanceKm"
          :min="1"
          :max="DISTANCE_MAX_KM"
          aria-label="Maximum distance"
        />
      </NField>
    </NCardContent>
  </NCard>
</template>

<style scoped>
.a-discovery {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.a-discovery__shown {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--accent-50);
  color: var(--accent-fg);
  font-size: var(--text-sm);
}

.a-discovery__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.a-discovery__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-strong);
}

.a-discovery__value {
  font-size: var(--text-sm);
  font-weight: 650;
  color: var(--accent-fg);
  font-variant-numeric: tabular-nums;
}

.a-discovery__sub {
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
</style>
