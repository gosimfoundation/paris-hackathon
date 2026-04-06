import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import VisionPage from './pages/VisionPage.vue'
import RulesPage from './pages/RulesPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomePage },
    { path: '/vision', component: VisionPage },
    { path: '/rules', component: RulesPage },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
