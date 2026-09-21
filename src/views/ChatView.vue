<script setup lang="ts">
import ChConversation from '@/features/chat/conversation/ui/ch-conversation/index.vue'

defineProps<{ matchId: string }>()
</script>

<template>
  <ChConversation :match-id="matchId" />
</template>
