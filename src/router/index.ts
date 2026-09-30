import HomeView from '@/views/HomeView.vue'
import ReportView from '@/views/ReportView.vue'
import { createRouter, createWebHistory } from 'vue-router'

export const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/report/:id', name: 'report', component: ReportView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.name === 'report' ? 'Interview report · Ratiuo' : 'Ratiuo'
})

export default router
