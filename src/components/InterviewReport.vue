<script setup lang="ts">
import PeopleAverages from '@/components/PeopleAverages.vue'
import {
  MAX_SCORE,
  averageOf,
  formatAverage,
  formatDate,
  labelOf,
  questions,
  scoreOf,
  scorePercent,
  type InterviewRecord,
} from '@/domain/interview'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  record: InterviewRecord
  people: InterviewRecord[]
}>()

const personAverage = computed(() => averageOf(props.record.ratings))
const personAverageText = computed(() =>
  personAverage.value == null ? '—' : formatAverage(personAverage.value),
)
const averagePercent = computed(() => {
  if (personAverage.value == null || MAX_SCORE === 0) return 0
  return (personAverage.value / MAX_SCORE) * 100
})

function printReport() {
  window.print()
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <article class="rounded-2xl border border-white/10 bg-foreground/80 p-6 shadow-2xl sm:p-8">
      <div
        class="flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <p class="font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase">
            Report for {{ record.interviewerName }}
          </p>
          <h2 class="mt-2 font-display text-6xl leading-none tracking-wide text-white sm:text-7xl">
            {{ record.candidateName }}
          </h2>
          <p class="mt-3 font-body text-sm text-white/50">
            {{ record.role }} · {{ formatDate(record.interviewedAt) }}
          </p>
        </div>

        <div class="no-print flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            class="rounded-xl border border-white/15 px-6 py-3 font-body text-sm font-bold text-white transition-colors hover:border-white/30"
            @click="printReport"
          >
            Print report
          </button>
          <RouterLink
            to="/"
            class="rounded-xl bg-primary-500 px-6 py-3 text-center font-body text-sm font-bold text-background transition-all duration-200 hover:bg-primary-600 hover:shadow-[0_0_24px_#ffd00040]"
          >
            New interview
          </RouterLink>
        </div>
      </div>

      <div class="mt-8">
        <p class="font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase">
          Average of answers
        </p>
        <p class="mt-2 flex items-end gap-2">
          <span
            data-testid="answer-average"
            class="font-display text-8xl leading-none text-primary-500"
            >{{ personAverageText }}</span
          >
          <span class="pb-2 font-body text-sm text-white/40">/ {{ MAX_SCORE }}</span>
        </p>
        <p class="mt-2 font-body text-sm text-white/50">
          Average of {{ questions.length }} answers, scored from 1 to {{ MAX_SCORE }}.
        </p>
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div
            class="h-full rounded-full bg-primary-500"
            :style="{ width: `${averagePercent}%` }"
          ></div>
        </div>
      </div>

      <ul class="mt-8 flex flex-col gap-3">
        <li
          v-for="question in questions"
          :key="question.id"
          class="rounded-xl border border-white/10 bg-background/40 px-4 py-4"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-body text-xs tracking-[0.2em] text-primary-500 uppercase">
                {{ question.subject }}
              </p>
              <h3 class="mt-1 font-body text-lg text-white">{{ question.title }}</h3>
            </div>
            <p class="text-right">
              <span class="block font-body text-sm text-white/70">
                {{ labelOf(record.ratings[question.id]) }}
              </span>
              <span class="font-display text-4xl leading-none text-primary-500">
                {{ scoreOf(record.ratings[question.id]) ?? '—' }}
              </span>
            </p>
          </div>
          <div class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              class="h-full rounded-full bg-primary-500"
              :style="{ width: `${scorePercent(record.ratings[question.id])}%` }"
            ></div>
          </div>
        </li>
      </ul>

      <section v-if="record.notes" class="mt-8 border-t border-white/10 pt-6">
        <h3 class="font-body text-xs tracking-[0.2em] text-primary-500 uppercase">Notes</h3>
        <p class="mt-3 font-body text-sm whitespace-pre-wrap text-white/80">{{ record.notes }}</p>
      </section>
    </article>

    <PeopleAverages :people="people" :current-id="record.id" />
  </div>
</template>
