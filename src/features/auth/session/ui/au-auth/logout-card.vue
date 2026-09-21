<script setup lang="ts">
import { useRouter } from 'vue-router'
import NButton from '@/components/n/button/NButton.vue'
import NCard from '@/components/n/card/NCard.vue'
import NCardDescription from '@/components/n/card/NCardDescription.vue'
import NCardFooter from '@/components/n/card/NCardFooter.vue'
import NCardHeader from '@/components/n/card/NCardHeader.vue'
import NCardTitle from '@/components/n/card/NCardTitle.vue'
import NIcon from '@/components/n/icon/NIcon.vue'
import { ROUTE_NAMES } from '@/router/route-names'
import { useSessionStore } from '@/stores/session'
import useAuAuth from '../../composition/use-au-auth'

const session = useSessionStore()
const router = useRouter()
const { logOut, isLoggingOut } = useAuAuth()

async function onLogOut(): Promise<void> {
  await logOut()
  await router.replace({ name: ROUTE_NAMES.login })
}
</script>

<template>
  <NCard>
    <NCardHeader>
      <NCardTitle>Account</NCardTitle>
      <NCardDescription v-if="session.user">Signed in as {{ session.user.email }}</NCardDescription>
    </NCardHeader>
    <NCardFooter>
      <NButton color="neutral" variant="outline" block :loading="isLoggingOut" @click="onLogOut">
        <NIcon name="logout" :size="16" /> Log out
      </NButton>
    </NCardFooter>
  </NCard>
</template>
