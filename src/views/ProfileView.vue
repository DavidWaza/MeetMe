<script setup lang="ts">
import AProfile from '@/features/account/profile/ui/a-profile/index.vue'
import AuLogoutCard from '@/features/auth/session/ui/au-auth/logout-card.vue'
</script>

<template>
  <!-- Two slices on one page: the page composes them; neither imports the other. -->
  <AProfile>
    <template #footer><AuLogoutCard /></template>
  </AProfile>
</template>
