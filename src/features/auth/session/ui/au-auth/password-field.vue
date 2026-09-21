<script setup lang="ts">
import { ref } from 'vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NInput from '@/components/n/field/NInput.vue'

const props = defineProps<{ id?: string; autocomplete: 'current-password' | 'new-password' }>()
const password = defineModel<string>({ required: true })

const visible = ref(false)
</script>

<template>
  <div class="au-password">
    <NInput
      :id="props.id"
      v-model="password"
      :type="visible ? 'text' : 'password'"
      :autocomplete="props.autocomplete"
      class="au-password__input"
    />
    <button
      type="button"
      class="au-password__toggle"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <NIcon :name="visible ? 'eye-off' : 'eye'" :size="18" />
      <span>{{ visible ? 'Hide' : 'Show' }}</span>
    </button>
  </div>
</template>

<style scoped>
.au-password {
  position: relative;
}

.au-password__input {
  padding-right: 5.5rem;
}

.au-password__toggle {
  position: absolute;
  top: 50%;
  right: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: var(--text-xs);
  font-weight: 650;
  transform: translateY(-50%);
}

.au-password__toggle:hover {
  background: var(--surface-inset);
  color: var(--text-strong);
}
</style>
