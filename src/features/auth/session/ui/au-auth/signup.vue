<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import NButton from '@/components/n/button/NButton.vue'
import NField from '@/components/n/field/NField.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NInput from '@/components/n/field/NInput.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import useAuAuth from '../../composition/use-au-auth'
import { GENDER_OPTIONS, latestAllowedBirthDate, PASSWORD_MIN } from '../../domain/auth-entities'
import AuAuthLayout from './layout.vue'
import AuAuthPasswordField from './password-field.vue'

const route = useRoute()
const router = useRouter()
const { signUpDraft, signUpErrors, formError, isSigningUp, submitSignUp } = useAuAuth()

const maxBirthDate = latestAllowedBirthDate()

async function onSubmit(): Promise<void> {
  if (await submitSignUp()) await router.replace({ name: ROUTE_NAMES.profile })
}
</script>

<template>
  <AuAuthLayout
    title="Create your account"
    subtitle="It takes a minute. You can fill in your profile after."
  >
    <form class="au-form" novalidate @submit.prevent="onSubmit">
      <p v-if="formError" class="au-form__error" role="alert">
        <NIcon name="alert" :size="16" /> {{ formError }}
      </p>

      <NField label="First name" :error="signUpErrors.firstName">
        <template #default="{ id }">
          <NInput
            :id="id"
            v-model="signUpDraft.firstName"
            autocomplete="given-name"
            :maxlength="40"
          />
        </template>
      </NField>

      <fieldset class="au-gender">
        <legend class="au-gender__legend">I am a</legend>
        <div class="au-gender__options" role="radiogroup" aria-label="I am a">
          <button
            v-for="option in GENDER_OPTIONS"
            :key="option.id"
            type="button"
            role="radio"
            :aria-checked="signUpDraft.gender === option.id"
            :class="[
              'au-gender__option',
              { 'au-gender__option--active': signUpDraft.gender === option.id },
            ]"
            @click="signUpDraft.gender = option.id"
          >
            <span class="au-gender__label">{{ option.label }}</span>
            <span class="au-gender__sees">{{ option.sees }}</span>
          </button>
        </div>
        <p v-if="signUpErrors.gender" class="au-gender__error">{{ signUpErrors.gender }}</p>
      </fieldset>

      <NField label="Date of birth" hint="You must be 18 or older." :error="signUpErrors.birthDate">
        <template #default="{ id }">
          <NInput
            :id="id"
            v-model="signUpDraft.birthDate"
            type="date"
            :max="maxBirthDate"
            autocomplete="bday"
          />
        </template>
      </NField>

      <NField label="City" :error="signUpErrors.city">
        <template #default="{ id }">
          <NInput
            :id="id"
            v-model="signUpDraft.city"
            autocomplete="address-level2"
            placeholder="Lagos"
          />
        </template>
      </NField>

      <NField label="Email" :error="signUpErrors.email">
        <template #default="{ id }">
          <NInput
            :id="id"
            v-model="signUpDraft.email"
            type="email"
            autocomplete="email"
            inputmode="email"
          />
        </template>
      </NField>

      <NField
        label="Password"
        :hint="`At least ${PASSWORD_MIN} characters.`"
        :error="signUpErrors.password"
      >
        <template #default="{ id }">
          <AuAuthPasswordField
            :id="id"
            v-model="signUpDraft.password"
            autocomplete="new-password"
          />
        </template>
      </NField>

      <NButton type="submit" size="lg" block :loading="isSigningUp">Create account</NButton>
    </form>

    <p class="au-form__switch">
      Already have an account?
      <RouterLink :to="{ name: ROUTE_NAMES.login, query: route.query }">Log in</RouterLink>
    </p>
  </AuAuthLayout>
</template>

<style scoped>
.au-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.au-form__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--red-50);
  color: var(--red-fg);
  font-size: var(--text-sm);
  font-weight: 550;
}

.au-form__switch {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.au-form__switch a {
  color: var(--accent-fg);
  font-weight: 650;
}

.au-gender {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border: none;
}

.au-gender__legend {
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-strong);
}

.au-gender__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.au-gender__option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--surface-raised);
  text-align: left;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.au-gender__option--active {
  border-color: var(--accent-500);
  background: var(--accent-50);
}

.au-gender__label {
  font-weight: 700;
  color: var(--text-strong);
}

.au-gender__sees {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.au-gender__option--active .au-gender__sees {
  color: var(--accent-fg);
}

.au-gender__error {
  font-size: var(--text-xs);
  color: var(--red-fg);
}
</style>
