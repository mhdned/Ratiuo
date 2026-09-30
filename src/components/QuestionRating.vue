<script setup lang="ts">
import { RATINGS, type Question, type RatingValue } from '@/domain/interview'

defineProps<{
  question: Question
  index: number
  modelValue: RatingValue | null
  invalid?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RatingValue]
}>()

function select(value: RatingValue) {
  emit('update:modelValue', value)
}
</script>

<template>
  <article>
    <fieldset
      class="m-0 min-w-0 border-0 p-0"
      :class="invalid ? 'rounded-xl ring-2 ring-danger-500' : ''"
      :aria-invalid="invalid ? 'true' : undefined"
    >
      <legend class="sr-only">Rate {{ question.title }}</legend>

      <div
        class="mb-4 flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center"
      >
        <div>
          <p class="mb-1 font-body text-xs font-medium tracking-[0.2em] text-primary-500 uppercase">
            Question {{ String(index + 1).padStart(2, '0') }}
          </p>
          <h3 class="font-display text-4xl tracking-wide text-white uppercase">
            {{ question.title }}
          </h3>
        </div>
        <span
          class="w-fit rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 font-body text-xs text-primary-500 uppercase"
        >
          {{ question.subject }}
        </span>
      </div>

      <p class="font-body text-base text-white/70">
        {{ question.description }}
      </p>

      <div class="mt-4 flex flex-col gap-3">
        <label
          v-for="rate in RATINGS"
          :key="rate.value"
          :for="`${question.id}-${rate.value}`"
          class="group flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-background/40 p-4 transition-all duration-200 has-[:focus-visible]:border-primary-500 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 hover:border-primary-500/50 hover:bg-primary-500/5"
        >
          <input
            :id="`${question.id}-${rate.value}`"
            :checked="modelValue === rate.value"
            :name="`rating-${question.id}`"
            :value="rate.value"
            type="radio"
            class="peer sr-only"
            @change="select(rate.value)"
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
            {{ rate.label }}
          </span>
          <span
            aria-hidden="true"
            class="ml-auto font-display text-2xl text-white/30 peer-checked:text-primary-500"
          >
            {{ rate.score }}
          </span>
        </label>
      </div>
    </fieldset>
  </article>
</template>
