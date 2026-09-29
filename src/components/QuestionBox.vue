<script setup lang="ts">
import { reactive, ref, type Reactive } from 'vue'

const questionList: Reactive<
  { title: string; description: string; subject: string; answer: string | null }[]
> = reactive([
  {
    title: 'go and node.js',
    description: 'Knowledge about the fundamentals of Node.js and Go language.',
    subject: 'Developing',
    answer: null,
  },
  {
    title: 'microservice',
    description: 'The knowledge about DDD, API Gateway, SAGA Pattern, Event Sourcing etc.',
    subject: 'Fundamental',
    answer: null,
  },
  {
    title: 'SKILLS',
    description: 'R&D, Communication, Problem Solving.',
    subject: 'Soft Skill',
    answer: null,
  },
])

const currentQuestion = ref(0)

const transitionDirection = ref<'next' | 'previous'>('next')

function nextQuestion() {
  console.log(questionList.length > currentQuestion.value)

  if (questionList.length - 1 > currentQuestion.value) {
    transitionDirection.value = 'next'
    currentQuestion.value++
    selectedOption.value = ''
  }
}

function previousQuestion() {
  if (0 < currentQuestion.value) {
    transitionDirection.value = 'previous'
    currentQuestion.value--
    selectedOption.value = ''
  }
}

const questionRates: string[] = ['Weak', 'Familiar', 'Good Understanding', 'Strong Knowledge']

const selectedOption = ref('')
</script>

<template>
  <section
    class="rounded-2xl border border-white/10 bg-foreground/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
  >
    <section
      class="rounded-2xl border border-white/10 bg-foreground/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
    >
      <Transition
        :name="transitionDirection === 'next' ? 'question-next' : 'question-previous'"
        mode="out-in"
      >
        <div :key="currentQuestion">
          <!-- HEADER -->
          <div
            class="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center"
          >
            <div>
              <p
                class="mb-1 font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase"
              >
                Question {{ String(currentQuestion + 1).padStart(2, '0') }}
              </p>

              <h2 class="font-display text-4xl tracking-wide text-white uppercase">
                {{ questionList[currentQuestion]?.title }}
              </h2>
            </div>

            <span
              class="w-fit rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 font-body text-xs text-primary-500 uppercase"
            >
              {{ questionList[currentQuestion]?.subject }}
            </span>
          </div>

          <!-- DESCRIPTION -->
          <div class="mb-8">
            <h3 class="font-body text-xl font-semibold text-white">
              {{ questionList[currentQuestion]?.description }}
            </h3>

            <p class="mt-2 font-body text-sm text-white/40">
              Choose the option according to the answers.
            </p>
          </div>

          <!-- OPTIONS -->
          <form class="space-y-3">
            <label
              v-for="(rate, index) in questionRates"
              :key="rate"
              :for="`option-${index}`"
              class="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-background/40 p-4 transition-all duration-200 hover:border-primary-500/50 hover:bg-primary-500/5"
            >
              <input
                :id="`option-${index}`"
                v-model="selectedOption"
                type="radio"
                name="answer"
                :value="rate"
                class="peer sr-only"
              />

              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all peer-checked:border-primary-500 peer-checked:bg-primary-500"
              >
                <span
                  class="h-2 w-2 scale-0 rounded-full bg-background transition-transform peer-checked:scale-100"
                ></span>
              </span>

              <span
                class="font-body text-sm text-white/70 transition-colors group-hover:text-white peer-checked:text-white"
              >
                {{ rate }}
              </span>
            </label>
          </form>
        </div>
      </Transition>

      <!-- NAVIGATION STAYS STATIC -->
      <div
        class="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <span class="font-body text-xs text-white/30">
          {{ currentQuestion + 1 }} of {{ questionList.length }} questions
        </span>
      </div>
    </section>

    <div
      class="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        @click="previousQuestion"
        :disabled="currentQuestion == 0 ? true : false"
        type="button"
        class="rounded-xl bg-primary-500 px-8 py-3 font-body w-50 text-sm font-bold text-background transition-all duration-200 hover:bg-primary-600 hover:shadow-[0_0_24px_#ffd00040] active:scale-95 disabled:bg-disabled-500"
      >
        PREVIOUS QUESTION
      </button>

      <button
        @click="nextQuestion"
        type="button"
        :class="[
          'w-50 rounded-xl px-8 py-3 font-body text-sm font-bold text-background transition-all duration-200 active:scale-95',
          currentQuestion === questionList.length - 1
            ? 'bg-secondary-500 hover:bg-secondary-600 hover:shadow-[0_0_24px_#ff7b0040]'
            : 'bg-primary-500 hover:bg-primary-600 hover:shadow-[0_0_24px_#ffd00040]',
        ]"
      >
        {{ currentQuestion === questionList.length - 1 ? 'FINISH QUESTION' : 'NEXT QUESTION' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.question-next-enter-active,
.question-next-leave-active,
.question-previous-enter-active,
.question-previous-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.question-next-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.question-next-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.question-previous-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.question-previous-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
