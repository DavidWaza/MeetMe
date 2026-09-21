<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import NPageContainer from '@/components/n/page/NPageContainer.vue'
import NToaster from '@/components/n/toast/NToaster.vue'
import ShTabbar from '@/features/shell/tabbar/ui/sh-tabbar/index.vue'
import { usePreferencesStore } from '@/stores/preferences'
import { useSessionStore } from '@/stores/session'

// Instantiated here so the theme and time pattern apply before any screen renders.
usePreferencesStore()

const route = useRoute()
const session = useSessionStore()
</script>

<template>
  <NPageContainer>
    <!-- Keyed by account: switching who is signed in rebuilds every screen and the
         tab bar from scratch, so nothing of the previous person's state survives. -->
    <RouterView :key="session.user?.id ?? 'guest'" />
    <ShTabbar v-if="session.user" :key="session.user.id" :hidden="route.meta.hideTabBar" />
  </NPageContainer>
  <NToaster />
</template>
