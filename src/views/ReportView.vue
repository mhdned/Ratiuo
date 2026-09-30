<script setup lang="ts">
import InterviewReport from '@/components/InterviewReport.vue'
import { useInterviewStore } from '@/stores/interview'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const store = useInterviewStore()

const reportId = computed(() => {
  const param = route.params.id
  return typeof param === 'string' ? param : ''
})

const record = computed(() => store.reportById(reportId.value))
</script>

<template>
  <div>
    <InterviewReport v-if="record" :record="record" :people="store.archive" />
    <section
      v-else
      class="rounded-2xl border border-white/10 bg-foreground/80 p-6 shadow-2xl sm:p-8"
    >
      <h2 class="font-display text-5xl tracking-wide text-white">
        This report is not on this device.
      </h2>
      <p class="mt-3 max-w-xl font-body text-sm text-white/50">
        Saved interviews stay in this browser. Start again from the form.
      </p>
      <RouterLink
        to="/"
        class="mt-6 inline-flex rounded-xl bg-primary-500 px-6 py-3 font-body text-sm font-bold text-background"
      >
        Back to the form
      </RouterLink>
    </section>
  </div>
</template>
