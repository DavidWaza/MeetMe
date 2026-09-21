<script setup lang="ts">
import NIcon from '@/components/n/icon/NIcon.vue'

const props = defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <main class="au-layout">
    <header class="au-layout__hero">
      <span class="au-layout__brand"><NIcon name="discover" :size="30" filled /> MeetMe</span>
      <p class="au-layout__tagline">Swipe. Match. Actually talk.</p>
    </header>

    <section class="au-layout__panel">
      <h1 class="au-layout__title">{{ props.title }}</h1>
      <p class="au-layout__subtitle">{{ props.subtitle }}</p>
      <slot />
    </section>
  </main>
</template>

<style scoped>
.au-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  background:
    radial-gradient(circle at 15% 0%, rgb(255 255 255 / 0.18), transparent 40%),
    linear-gradient(160deg, var(--flow-primary), var(--flow-s2) 55%, var(--flow-s3));
}

.au-layout__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: max(var(--space-10), env(safe-area-inset-top)) var(--space-6) var(--space-8);
  color: var(--base-0);
  text-align: center;
}

.au-layout__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-3xl);
  font-weight: 850;
  letter-spacing: -0.04em;
}

.au-layout__tagline {
  font-size: var(--text-sm);
  opacity: 0.9;
}

.au-layout__panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-5) max(var(--space-8), env(safe-area-inset-bottom));
  background: var(--surface);
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  box-shadow: var(--shadow-lg);
}

.au-layout__title {
  font-size: var(--text-2xl);
}

.au-layout__subtitle {
  margin-top: calc(var(--space-3) * -1);
  font-size: var(--text-sm);
  color: var(--text-muted);
}
</style>
