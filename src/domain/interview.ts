export const RATINGS = [
  { value: 'weak', label: 'Weak', score: 1 },
  { value: 'familiar', label: 'Familiar', score: 2 },
  { value: 'good', label: 'Good Understanding', score: 3 },
  { value: 'strong', label: 'Strong Knowledge', score: 4 },
] as const

export type RatingValue = (typeof RATINGS)[number]['value']

export const MAX_SCORE = Math.max(...RATINGS.map((rate) => rate.score))

export interface Question {
  id: string
  title: string
  description: string
  subject: string
}

export const questions: readonly Question[] = [
  {
    id: 'go-node',
    title: 'Go and Node.js',
    description: 'Knowledge about the fundamentals of Node.js and Go language.',
    subject: 'Developing',
  },
  {
    id: 'microservice',
    title: 'Microservice',
    description: 'The knowledge about DDD, API Gateway, SAGA Pattern, Event Sourcing etc.',
    subject: 'Fundamental',
  },
  {
    id: 'skills',
    title: 'Skills',
    description: 'R&D, Communication, Problem Solving.',
    subject: 'Soft Skill',
  },
]

export interface Draft {
  candidateName: string
  role: string
  interviewerName: string
  interviewedAt: string
  ratings: Record<string, RatingValue | null>
  notes: string
}

export interface InterviewRecord {
  id: string
  candidateName: string
  role: string
  interviewerName: string
  interviewedAt: string
  ratings: Record<string, RatingValue>
  notes: string
  submittedAt: string
}

export function isRatingValue(value: unknown): value is RatingValue {
  return RATINGS.some((rate) => rate.value === value)
}

export function scoreOf(value: RatingValue | null | undefined): number | null {
  return RATINGS.find((rate) => rate.value === value)?.score ?? null
}

export function labelOf(value: RatingValue | null | undefined): string {
  return RATINGS.find((rate) => rate.value === value)?.label ?? 'Unrated'
}

export function scorePercent(value: RatingValue | null | undefined): number {
  const score = scoreOf(value)
  if (score == null || MAX_SCORE === 0) return 0
  return (score / MAX_SCORE) * 100
}

export function emptyRatings(): Record<string, RatingValue | null> {
  const ratings: Record<string, RatingValue | null> = {}
  for (const question of questions) {
    ratings[question.id] = null
  }
  return ratings
}

export function todayISO(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function emptyDraft(now = new Date()): Draft {
  return {
    candidateName: '',
    role: '',
    interviewerName: '',
    interviewedAt: todayISO(now),
    ratings: emptyRatings(),
    notes: '',
  }
}

export function answeredAverage(ratings: Record<string, RatingValue | null | undefined>): {
  average: number
  count: number
} | null {
  let total = 0
  let count = 0
  for (const question of questions) {
    const score = scoreOf(ratings[question.id])
    if (score == null) continue
    total += score
    count += 1
  }
  if (count === 0) return null
  return { average: total / count, count }
}

export function averageOf(ratings: Record<string, RatingValue | null | undefined>): number | null {
  const result = answeredAverage(ratings)
  if (!result || result.count !== questions.length) return null
  return result.average
}

export function groupAverage(
  records: readonly { ratings: Record<string, RatingValue | null | undefined> }[],
): number | null {
  let total = 0
  let count = 0
  for (const record of records) {
    for (const question of questions) {
      const score = scoreOf(record.ratings[question.id])
      if (score == null) continue
      total += score
      count += 1
    }
  }
  if (count === 0) return null
  return total / count
}

export function formatAverage(value: number): string {
  return value.toFixed(1)
}

export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const year = Number(match[1] ?? 0)
  const month = Number(match[2] ?? 0)
  const day = Number(match[3] ?? 0)
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}
