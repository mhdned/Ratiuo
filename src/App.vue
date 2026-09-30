<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <main class="min-h-screen w-full bg-background px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16">
    <div class="mx-auto flex w-full max-w-5xl flex-col">
      <header class="mb-8">
        <div class="mb-4 flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-primary-500 shadow-[0_0_16px_#ffd000]"></div>
          <span class="font-body text-sm tracking-[0.25em] text-primary-500 uppercase">
            Developer Challenge
          </span>
        </div>

        <RouterLink
          to="/"
          class="inline-block font-display text-7xl leading-none tracking-wide text-white sm:text-8xl"
        >
          RATIUO
        </RouterLink>

        <p class="mt-4 max-w-xl font-body text-base text-white/50 sm:text-lg">
          Questions for hiring developer in Kaveh Glass Industry
        </p>
      </header>

      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </div>
  </main>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>
