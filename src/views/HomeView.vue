<script setup lang="ts">
import InterviewForm from '@/components/InterviewForm.vue'
import PeopleAverages from '@/components/PeopleAverages.vue'
import { useInterviewStore } from '@/stores/interview'

const store = useInterviewStore()
</script>

<template>
  <div class="flex flex-col gap-8">
    <InterviewForm />
    <PeopleAverages :people="store.archive" />
  </div>
</template>
