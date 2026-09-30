import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '../App.vue'
import { routes } from '../router'

describe('App', () => {
  it('renders the interview form', async () => {
    localStorage.clear()
    const router = createRouter({ history: createMemoryHistory(), routes })
    const wrapper = mount(App, {
      global: { plugins: [createPinia(), router] },
    })

    await router.isReady()

    expect(wrapper.text()).toContain('RATIUO')
    expect(wrapper.text()).toContain('Interview form')
    expect(wrapper.text()).toContain('Go and Node.js')
  })
})
