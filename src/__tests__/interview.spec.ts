import InterviewForm from '@/components/InterviewForm.vue'
import InterviewReport from '@/components/InterviewReport.vue'
import {
  averageOf,
  formatAverage,
  groupAverage,
  questions,
  type InterviewRecord,
  type RatingValue,
} from '@/domain/interview'
import { routes } from '@/router'
import { ARCHIVE_STORAGE_KEY, DRAFT_STORAGE_KEY, useInterviewStore } from '@/stores/interview'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

function rateAll(value: RatingValue) {
  const store = useInterviewStore()
  for (const question of questions) store.setRating(question.id, value)
}

describe('interview scoring', () => {
  it('averages one complete set of answers', () => {
    expect(
      averageOf({
        'go-node': 'strong',
        microservice: 'good',
        skills: 'familiar',
      }),
    ).toBe(3)
    expect(formatAverage(3)).toBe('3.0')
    expect(averageOf({ 'go-node': 'strong', microservice: null, skills: null })).toBeNull()
  })

  it('averages every answer across people', () => {
    expect(
      groupAverage([
        { ratings: { 'go-node': 'strong', microservice: 'strong', skills: 'strong' } },
        { ratings: { 'go-node': 'weak', microservice: 'weak', skills: 'weak' } },
      ]),
    ).toBe(2.5)
  })
})

describe('interview store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('refuses a blank name even when every topic is rated', () => {
    const store = useInterviewStore()
    store.draft.candidateName = '   '
    store.draft.role = 'Developer'
    store.draft.interviewerName = 'Grace Hopper'
    rateAll('strong')

    expect(store.submit()).toBeNull()
    expect(store.archive).toEqual([])
  })

  it('keeps each answer through a reload and puts the average on the report', () => {
    const store = useInterviewStore()
    store.draft.candidateName = 'Ada Lovelace'
    store.draft.role = 'Backend developer'
    store.draft.interviewerName = 'Grace Hopper'
    store.draft.notes = 'Clear explanation of SAGA.'
    store.setRating('go-node', 'strong')
    store.setRating('microservice', 'good')
    store.setRating('skills', 'familiar')

    expect(store.runningAverage).toBe(3)
    expect(JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) ?? '{}')).toMatchObject({
      candidateName: 'Ada Lovelace',
      ratings: { 'go-node': 'strong', microservice: 'good', skills: 'familiar' },
    })

    store.$dispose()
    setActivePinia(createPinia())
    const restored = useInterviewStore()

    expect(restored.draft.ratings['go-node']).toBe('strong')
    expect(restored.runningAverage).toBe(3)

    const record = restored.submit()
    expect(record?.candidateName).toBe('Ada Lovelace')
    expect(averageOf(record?.ratings ?? {})).toBe(3)
    expect(restored.draft.candidateName).toBe('')
    expect(restored.reportById(record?.id ?? '')?.notes).toBe('Clear explanation of SAGA.')
    expect(JSON.parse(localStorage.getItem(ARCHIVE_STORAGE_KEY) ?? '[]')).toHaveLength(1)
  })

  it('keeps a separate average for each person and one average for all of them', () => {
    const store = useInterviewStore()
    store.draft.candidateName = 'Ada Lovelace'
    store.draft.role = 'Developer'
    store.draft.interviewerName = 'Grace Hopper'
    rateAll('strong')
    store.submit()

    store.draft.candidateName = 'Alan Turing'
    store.draft.role = 'Developer'
    store.draft.interviewerName = 'Grace Hopper'
    rateAll('weak')
    store.submit()

    expect(store.archive.map((person) => averageOf(person.ratings))).toEqual([1, 4])
    expect(groupAverage(store.archive)).toBe(2.5)
  })

  it('ignores corrupt saved data', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, '{')
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify([{ id: 'broken' }, 'nope']))

    const store = useInterviewStore()

    expect(store.draft.candidateName).toBe('')
    expect(store.archive).toEqual([])
  })
})

describe('interview screens', () => {
  let pinia: Pinia

  beforeEach(() => {
    localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  it('stays on the form until every topic is rated', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    const wrapper = mount(InterviewForm, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.get('input[name="candidateName"]').setValue('Ada Lovelace')
    await wrapper.get('input[name="role"]').setValue('Developer')
    await wrapper.get('input[name="interviewerName"]').setValue('Grace Hopper')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).not.toBe('report')
    expect(useInterviewStore().archive).toHaveLength(0)
    expect(wrapper.findAll('fieldset[aria-invalid="true"]')).toHaveLength(questions.length)
  })

  it('submits the form with the selected answers', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes })
    const wrapper = mount(InterviewForm, {
      global: { plugins: [pinia, router] },
    })

    await wrapper.get('input[name="candidateName"]').setValue('Ada Lovelace')
    await wrapper.get('input[name="role"]').setValue('Backend developer')
    await wrapper.get('input[name="interviewerName"]').setValue('Grace Hopper')
    await wrapper.get('input[name="rating-go-node"][value="strong"]').trigger('change')
    await wrapper.get('input[name="rating-microservice"][value="good"]').trigger('change')
    await wrapper.get('input[name="rating-skills"][value="familiar"]').trigger('change')

    expect(wrapper.get('[data-testid="running-average"]').text()).toBe('3.0')

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('report')
    expect(useInterviewStore().archive[0]?.ratings).toEqual({
      'go-node': 'strong',
      microservice: 'good',
      skills: 'familiar',
    })
  })

  it('shows one person average and the average of every person', async () => {
    const ada: InterviewRecord = {
      id: 'ada',
      candidateName: 'Ada Lovelace',
      role: 'Developer',
      interviewerName: 'Grace Hopper',
      interviewedAt: '2026-09-30',
      ratings: { 'go-node': 'strong', microservice: 'good', skills: 'familiar' },
      notes: 'Explained SAGA clearly.',
      submittedAt: '2026-09-30T12:00:00.000Z',
    }
    const alan: InterviewRecord = {
      ...ada,
      id: 'alan',
      candidateName: 'Alan Turing',
      ratings: { 'go-node': 'weak', microservice: 'weak', skills: 'weak' },
      notes: '',
    }
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(InterviewReport, {
      props: { record: ada, people: [alan, ada] },
      global: { plugins: [pinia, router] },
    })

    expect(wrapper.get('[data-testid="answer-average"]').text()).toBe('3.0')
    expect(wrapper.get('[data-testid="people-average"]').text()).toBe('2.0')
    expect(wrapper.text()).toContain('Report for Grace Hopper')
    expect(wrapper.text()).toContain('Explained SAGA clearly.')
  })
})
