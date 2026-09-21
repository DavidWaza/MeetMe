<script setup lang="ts">
import { ref, watch } from 'vue'
import NSheet from '@/components/n/sheet/NSheet.vue'
import NButton from '@/components/n/button/NButton.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import NSwitch from '@/components/n/switch/NSwitch.vue'

const props = defineProps<{
  open: boolean
  partnerName: string
  autoReply: boolean
  showCoach: boolean
  ruleCount: number
  unmatching: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  'update:autoReply': [boolean]
  'update:showCoach': [boolean]
  rules: []
  profile: []
  unmatch: []
}>()

// Unmatching is irreversible, so it takes a second, explicit tap.
const confirming = ref(false)
watch(
  () => props.open,
  (open) => {
    if (!open) confirming.value = false
  },
)

function go(event: 'rules' | 'profile'): void {
  emit('update:open', false)
  if (event === 'rules') emit('rules')
  else emit('profile')
}
</script>

<template>
  <NSheet
    :open="props.open"
    :title="`Chat with ${props.partnerName}`"
    @update:open="emit('update:open', $event)"
  >
    <ul class="ch-menu">
      <li>
        <NSwitch
          :model-value="props.autoReply"
          @update:model-value="emit('update:autoReply', $event)"
        >
          <template #icon><NIcon name="sparkles" :size="20" /></template>
          Simulated replies
          <template #detail>
            {{
              props.autoReply
                ? `${props.partnerName} replies automatically`
                : 'Paused. Reply as them with the speaker button'
            }}
          </template>
        </NSwitch>
      </li>
      <li>
        <NSwitch
          :model-value="props.showCoach"
          @update:model-value="emit('update:showCoach', $event)"
        >
          <template #icon><NIcon name="flame" :size="20" /></template>
          Conversation coach
          <template #detail>Interest meter and feedback on each message</template>
        </NSwitch>
      </li>
      <li>
        <button class="ch-menu__item" @click="go('rules')">
          <NIcon name="chat" :size="20" class="ch-menu__icon" />
          <span class="ch-menu__text">
            <span class="ch-menu__label">Teach replies</span>
            <span class="ch-menu__detail">
              {{
                props.ruleCount ? `${props.ruleCount} active` : 'Tell the simulator how to answer'
              }}
            </span>
          </span>
          <NIcon name="next" :size="18" class="ch-menu__chevron" />
        </button>
      </li>
      <li>
        <button class="ch-menu__item" @click="go('profile')">
          <NIcon name="profile" :size="20" class="ch-menu__icon" />
          <span class="ch-menu__text">
            <span class="ch-menu__label">View profile</span>
          </span>
          <NIcon name="next" :size="18" class="ch-menu__chevron" />
        </button>
      </li>
    </ul>

    <template #footer>
      <NButton
        v-if="!confirming"
        color="destructive"
        variant="soft"
        block
        @click="confirming = true"
      >
        <NIcon name="x" :size="18" /> Unmatch
      </NButton>
      <template v-else>
        <NButton color="neutral" variant="outline" block @click="confirming = false"
          >Cancel</NButton
        >
        <NButton color="destructive" block :loading="props.unmatching" @click="emit('unmatch')">
          Unmatch {{ props.partnerName }}
        </NButton>
      </template>
    </template>
  </NSheet>
</template>

<style scoped>
.ch-menu {
  display: flex;
  flex-direction: column;
}

.ch-menu > li {
  border-bottom: 1px solid var(--border-subtle);
}

.ch-menu__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) 0;
  text-align: left;
}

.ch-menu__icon {
  color: var(--accent-500);
}

.ch-menu__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ch-menu__label {
  font-weight: 600;
  color: var(--text-strong);
}

.ch-menu__detail {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.ch-menu__chevron {
  color: var(--text-muted);
}
</style>
