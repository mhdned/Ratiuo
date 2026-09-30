<script setup lang="ts">
import QuestionRating from '@/components/QuestionRating.vue'
import { MAX_SCORE, formatAverage, questions } from '@/domain/interview'
import { useInterviewStore } from '@/stores/interview'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useInterviewStore()

const fieldClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-background/40 px-4 py-3 font-body text-sm font-normal tracking-normal text-white normal-case outline-none transition-colors placeholder:text-white/30 focus:border-primary-500'

const guidance = computed(() => {
  const current = store.draft
  if (!current.candidateName.trim()) return 'Enter the name of the person interviewed.'
  if (!current.role.trim()) return 'Enter the role they are interviewing for.'
  if (!current.interviewerName.trim()) return 'Enter your name as the interviewer.'
  if (!current.interviewedAt) return 'Enter the interview date.'
  const remaining = questions.length - store.ratedCount
  if (remaining === 1) return 'Rate 1 more topic.'
  if (remaining > 1) return `Rate ${remaining} more topics.`
  return 'All topics rated. The report keeps these answers.'
})

const runningLabel = computed(() =>
  store.runningAverage == null ? 'No ratings yet' : formatAverage(store.runningAverage),
)

const attempted = ref(false)

function focusFirstGap() {
  const current = store.draft
  const missingField = (
    [
      ['candidateName', current.candidateName],
      ['interviewerName', current.interviewerName],
      ['role', current.role],
      ['interviewedAt', current.interviewedAt],
    ] as const
  ).find(([, value]) => value.trim() === '')

  if (missingField) {
    document.querySelector<HTMLElement>(`[name="${missingField[0]}"]`)?.focus()
    return
  }

  const missingQuestion = questions.find((question) => !current.ratings[question.id])
  if (missingQuestion) document.getElementById(`${missingQuestion.id}-weak`)?.focus()
}

function finish() {
  if (!store.canSubmit) {
    attempted.value = true
    focusFirstGap()
    return
  }

  const record = store.submit()
  if (!record) return
  void router.push({ name: 'report', params: { id: record.id } })
}
</script>

<template>
  <form
    class="rounded-2xl border border-white/10 bg-foreground/80 p-6 shadow-2xl sm:p-8"
    aria-describedby="interview-guidance"
    @submit.prevent="finish"
  >
    <div class="mb-8 border-b border-white/10 pb-6">
      <h2 class="font-display text-4xl tracking-wide text-white">Interview form</h2>
      <p class="mt-2 max-w-2xl font-body text-sm text-white/50">
        Record who came in and rate each answer. The form keeps every choice on this device, then
        opens a report with the average.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label
        class="block font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase"
      >
        Candidate
        <input
          v-model="store.draft.candidateName"
          name="candidateName"
          type="text"
          required
          autocomplete="section-candidate name"
          placeholder="Name of the person interviewed"
          :class="fieldClass"
        />
      </label>

      <label
        class="block font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase"
      >
        Interviewer
        <input
          v-model="store.draft.interviewerName"
          name="interviewerName"
          type="text"
          required
          autocomplete="section-interviewer name"
          placeholder="Your name"
          :class="fieldClass"
        />
      </label>

      <label
        class="block font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase"
      >
        Role
        <input
          v-model="store.draft.role"
          name="role"
          type="text"
          required
          autocomplete="organization-title"
          placeholder="Developer"
          :class="fieldClass"
        />
      </label>

      <label
        class="block font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase"
      >
        Interview date
        <input
          v-model="store.draft.interviewedAt"
          name="interviewedAt"
          type="date"
          required
          :class="fieldClass"
        />
      </label>
    </div>

    <div class="mt-10 flex flex-col gap-10 border-t border-white/10 pt-8">
      <QuestionRating
        v-for="(question, index) in questions"
        :key="question.id"
        :question="question"
        :index="index"
        :model-value="store.draft.ratings[question.id] ?? null"
        :invalid="attempted && !store.draft.ratings[question.id]"
        @update:model-value="store.setRating(question.id, $event)"
      />
    </div>

    <label
      class="mt-10 block border-t border-white/10 pt-8 font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase"
    >
      Notes
      <textarea
        v-model="store.draft.notes"
        name="notes"
        rows="3"
        placeholder="What stood out in their answers?"
        :class="fieldClass"
      ></textarea>
    </label>

    <footer
      class="mt-8 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <p class="font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase">
          Running average
        </p>
        <p class="mt-2 flex items-end gap-2">
          <span
            data-testid="running-average"
            class="leading-none"
            :class="
              store.runningAverage == null
                ? 'font-body text-2xl text-white/40'
                : 'font-display text-6xl text-primary-500'
            "
            aria-live="polite"
            >{{ runningLabel }}</span
          >
          <span v-if="store.runningAverage != null" class="pb-1 font-body text-sm text-white/40">
            / {{ MAX_SCORE }}
          </span>
        </p>
        <p id="interview-guidance" class="mt-2 font-body text-sm text-white/50">
          {{ guidance }}
        </p>
      </div>

      <div class="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          class="rounded-xl border border-white/15 px-6 py-3 font-body text-sm font-bold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          @click="store.resetDraft()"
        >
          Clear
        </button>
        <button
          type="submit"
          class="rounded-xl bg-primary-500 px-8 py-3 font-body text-sm font-bold text-background transition-all duration-200 hover:bg-primary-600 hover:shadow-[0_0_24px_#ffd00040] active:scale-95"
        >
          View report
        </button>
      </div>
    </footer>
  </form>
</template>
