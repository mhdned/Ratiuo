<script setup lang="ts">
import {
  averageOf,
  formatAverage,
  formatDate,
  groupAverage,
  type InterviewRecord,
} from '@/domain/interview'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  people: InterviewRecord[]
  currentId?: string
}>()

const overall = computed(() => groupAverage(props.people))
const overallText = computed(() => (overall.value == null ? null : formatAverage(overall.value)))

function personScore(person: InterviewRecord): string {
  const average = averageOf(person.ratings)
  return average == null ? '—' : formatAverage(average)
}
</script>

<template>
  <section
    v-if="people.length"
    class="rounded-2xl border border-white/10 bg-foreground/80 p-6 shadow-2xl sm:p-8"
  >
    <h2 class="font-display text-4xl tracking-wide text-white">People interviewed</h2>
    <p v-if="people.length > 1 && overallText" class="mt-3 font-body text-sm text-white/50">
      Average of every answer
      <span data-testid="people-average" class="ml-2 font-display text-4xl text-primary-500">{{
        overallText
      }}</span>
    </p>

    <ul class="mt-6 flex flex-col gap-3">
      <li v-for="person in people" :key="person.id">
        <RouterLink
          :to="{ name: 'report', params: { id: person.id } }"
          :aria-current="person.id === currentId ? 'page' : undefined"
          class="flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors hover:border-primary-500/50"
          :class="
            person.id === currentId
              ? 'border-primary-500/50 bg-primary-500/10'
              : 'border-white/10 bg-background/40'
          "
        >
          <span class="min-w-0">
            <span class="block truncate font-body text-base text-white">
              {{ person.candidateName }}
            </span>
            <span class="block truncate font-body text-xs text-white/40">
              {{ person.role }} · {{ formatDate(person.interviewedAt) }} ·
              {{ person.interviewerName }}
            </span>
          </span>
          <span class="font-display text-3xl text-primary-500">{{ personScore(person) }}</span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
