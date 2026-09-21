<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from 'vue-router'
import NButton from '@/components/n/button/NButton.vue'
import NField from '@/components/n/field/NField.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NInput from '@/components/n/field/NInput.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import useAuAuth from '../../composition/use-au-auth'
import { DEMO_LOGINS } from '../../domain/auth-entities'
import AuAuthLayout from './layout.vue'
import AuAuthPasswordField from './password-field.vue'

const route = useRoute()
const router = useRouter()
const { logInDraft, logInErrors, formError, isLoggingIn, submitLogIn, fillLogIn } = useAuAuth()

/** Back to wherever the guard intercepted them, if it was somewhere in the app. */
async function goOn(): Promise<void> {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  await router.replace(redirect.startsWith('/') ? redirect : { name: ROUTE_NAMES.discover })
}

async function onSubmit(): Promise<void> {
  if (await submitLogIn()) await goOn()
}

async function tryDemo(email: string, password: string): Promise<void> {
  fillLogIn(email, password)
  await onSubmit()
}
</script>

<template>
  <AuAuthLayout title="Welcome back" subtitle="Log in to see who you've matched with.">
    <form class="au-form" novalidate @submit.prevent="onSubmit">
      <p v-if="formError" class="au-form__error" role="alert">
        <NIcon name="alert" :size="16" /> {{ formError }}
      </p>

      <NField label="Email" :error="logInErrors.email">
        <template #default="{ id }">
          <NInput
            :id="id"
            v-model="logInDraft.email"
            type="email"
            autocomplete="email"
            inputmode="email"
            placeholder="you@example.com"
          />
        </template>
      </NField>

      <NField label="Password" :error="logInErrors.password">
        <template #default="{ id }">
          <AuAuthPasswordField
            :id="id"
            v-model="logInDraft.password"
            autocomplete="current-password"
          />
        </template>
      </NField>

      <NButton type="submit" size="lg" block :loading="isLoggingIn">Log in</NButton>
    </form>

    <p class="au-form__switch">
      New to MeetMe?
      <RouterLink :to="{ name: ROUTE_NAMES.signup, query: route.query }"
        >Create an account</RouterLink
      >
    </p>

    <div class="au-demo">
      <p class="au-demo__label">Just looking? Try a demo account</p>
      <div class="au-demo__buttons">
        <NButton
          v-for="demo in DEMO_LOGINS"
          :key="demo.email"
          color="neutral"
          variant="outline"
          block
          :disabled="isLoggingIn"
          @click="tryDemo(demo.email, demo.password)"
        >
          {{ demo.label }}
        </NButton>
      </div>
      <p class="au-demo__hint">
        Password for both: <code>{{ DEMO_LOGINS[0]?.password }}</code>
      </p>
    </div>
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

.au-demo {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.au-demo__label,
.au-demo__hint {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.au-demo__buttons {
  display: flex;
  gap: var(--space-2);
}

.au-demo__hint code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--text-strong);
}
</style>
