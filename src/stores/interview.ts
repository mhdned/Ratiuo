import {
  answeredAverage,
  averageOf,
  emptyDraft,
  emptyRatings,
  isRatingValue,
  questions,
  type Draft,
  type InterviewRecord,
  type RatingValue,
} from '@/domain/interview'
import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const ARCHIVE_STORAGE_KEY = 'ratiuo.archive'
export const DRAFT_STORAGE_KEY = 'ratiuo.draft'

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The in-memory interview still works when storage is blocked.
  }
}

function sanitizeRatings(value: unknown): Record<string, RatingValue | null> {
  const ratings = emptyRatings()
  if (!value || typeof value !== 'object') return ratings
  const source = value as Record<string, unknown>
  for (const question of questions) {
    const rating = source[question.id]
    ratings[question.id] = isRatingValue(rating) ? rating : null
  }
  return ratings
}

function sanitizeDraft(value: unknown): Draft {
  const base = emptyDraft()
  if (!value || typeof value !== 'object') return base
  const source = value as Partial<Draft>
  return {
    candidateName: typeof source.candidateName === 'string' ? source.candidateName : '',
    role: typeof source.role === 'string' ? source.role : '',
    interviewerName: typeof source.interviewerName === 'string' ? source.interviewerName : '',
    interviewedAt:
      typeof source.interviewedAt === 'string' && source.interviewedAt
        ? source.interviewedAt
        : base.interviewedAt,
    notes: typeof source.notes === 'string' ? source.notes : '',
    ratings: sanitizeRatings(source.ratings),
  }
}

function sanitizeRecord(value: unknown): InterviewRecord | null {
  if (!value || typeof value !== 'object') return null
  const source = value as Partial<InterviewRecord>
  if (typeof source.id !== 'string' || source.id.trim() === '') return null
  if (typeof source.candidateName !== 'string' || source.candidateName.trim() === '') return null
  if (typeof source.role !== 'string' || source.role.trim() === '') return null
  if (typeof source.interviewerName !== 'string' || source.interviewerName.trim() === '') {
    return null
  }
  if (typeof source.interviewedAt !== 'string' || source.interviewedAt.trim() === '') return null

  const parsed = sanitizeRatings(source.ratings)
  const ratings: Record<string, RatingValue> = {}
  for (const question of questions) {
    const rating = parsed[question.id]
    if (!rating) return null
    ratings[question.id] = rating
  }

  return {
    id: source.id,
    candidateName: source.candidateName.trim(),
    role: source.role.trim(),
    interviewerName: source.interviewerName.trim(),
    interviewedAt: source.interviewedAt,
    ratings,
    notes: typeof source.notes === 'string' ? source.notes.trim() : '',
    submittedAt:
      typeof source.submittedAt === 'string' && source.submittedAt
        ? source.submittedAt
        : source.interviewedAt,
  }
}

function loadDraft(): Draft {
  return sanitizeDraft(readJson(DRAFT_STORAGE_KEY))
}

function loadArchive(): InterviewRecord[] {
  const parsed = readJson(ARCHIVE_STORAGE_KEY)
  if (!Array.isArray(parsed)) return []
  return parsed.flatMap((item) => {
    const record = sanitizeRecord(item)
    return record ? [record] : []
  })
}

export const useInterviewStore = defineStore('interview', () => {
  const draft = ref<Draft>(loadDraft())
  const archive = ref<InterviewRecord[]>(loadArchive())

  const ratedCount = computed(
    () => questions.filter((question) => draft.value.ratings[question.id] != null).length,
  )

  const runningAverage = computed(() => answeredAverage(draft.value.ratings)?.average ?? null)

  const canSubmit = computed(() => {
    const current = draft.value
    return (
      current.candidateName.trim() !== '' &&
      current.role.trim() !== '' &&
      current.interviewerName.trim() !== '' &&
      current.interviewedAt.trim() !== '' &&
      averageOf(current.ratings) != null
    )
  })

  function setRating(questionId: string, value: RatingValue) {
    if (!questions.some((question) => question.id === questionId)) return
    draft.value.ratings[questionId] = value
  }

  function submit(): InterviewRecord | null {
    if (!canSubmit.value) return null

    const ratings: Record<string, RatingValue> = {}
    for (const question of questions) {
      const rating = draft.value.ratings[question.id]
      if (!rating) return null
      ratings[question.id] = rating
    }

    const record: InterviewRecord = {
      id: crypto.randomUUID(),
      candidateName: draft.value.candidateName.trim(),
      role: draft.value.role.trim(),
      interviewerName: draft.value.interviewerName.trim(),
      interviewedAt: draft.value.interviewedAt,
      ratings,
      notes: draft.value.notes.trim(),
      submittedAt: new Date().toISOString(),
    }

    archive.value = [record, ...archive.value]
    draft.value = emptyDraft()
    return record
  }

  function resetDraft() {
    draft.value = emptyDraft()
  }

  function reportById(id: string): InterviewRecord | null {
    return archive.value.find((record) => record.id === id) ?? null
  }

  watch(draft, (value) => writeJson(DRAFT_STORAGE_KEY, value), { deep: true, flush: 'sync' })
  watch(archive, (value) => writeJson(ARCHIVE_STORAGE_KEY, value), { deep: true, flush: 'sync' })

  return {
    draft,
    archive,
    ratedCount,
    runningAverage,
    canSubmit,
    setRating,
    submit,
    resetDraft,
    reportById,
  }
})
