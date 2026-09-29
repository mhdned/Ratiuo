<script setup lang="ts">
import QuestionBox from './components/QuestionBox.vue'
</script>

```vue
<template>
  <main class="min-h-screen w-full bg-background px-6 py-12 text-white sm:px-10 lg:px-16">
    <div class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl flex-col justify-center">
      <header class="mb-8">
        <div class="mb-4 flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-primary-500 shadow-[0_0_16px_#ffd000]"></div>

          <span class="font-sans text-sm tracking-[0.25em] text-primary-500 uppercase">
            Developer Challenge
          </span>
        </div>

        <h1 class="font-display text-7xl leading-none tracking-wide text-white sm:text-8xl">
          RATIUO
        </h1>

        <p class="mt-4 max-w-xl font-body text-base text-white/50 sm:text-lg">
          Questions for hiring developer in Kaveh Glass Industry
        </p>
      </header>
      <QuestionBox></QuestionBox>
    </div>
  </main>
</template>
