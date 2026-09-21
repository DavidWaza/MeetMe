<template>
  <div class="dc-skeleton" aria-busy="true" aria-label="Finding people near you">
    <div class="dc-skeleton__card">
      <div class="dc-skeleton__lines">
        <span class="dc-skeleton__line dc-skeleton__line--title" />
        <span class="dc-skeleton__line" />
        <span class="dc-skeleton__line dc-skeleton__line--short" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dc-skeleton {
  position: absolute;
  inset: 0;
}

.dc-skeleton__card {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: var(--space-5);
  border-radius: var(--radius-2xl);
  background: linear-gradient(
    110deg,
    var(--surface-inset) 30%,
    var(--border-subtle) 50%,
    var(--surface-inset) 70%
  );
  background-size: 250% 100%;
  animation: dc-shimmer 1.4s linear infinite;
}

.dc-skeleton__lines {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.dc-skeleton__line {
  height: 0.875rem;
  width: 70%;
  border-radius: var(--radius-full);
  background: var(--border-strong);
}

.dc-skeleton__line--title {
  height: 1.75rem;
  width: 45%;
}

.dc-skeleton__line--short {
  width: 35%;
}

@keyframes dc-shimmer {
  to {
    background-position: -150% 0;
  }
}
</style>
