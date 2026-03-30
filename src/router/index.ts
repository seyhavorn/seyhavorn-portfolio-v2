import { createRouter, createWebHistory } from 'vue-router'

// Disable browser's automatic scroll restoration on page refresh
// This prevents the browser from scrolling to the previous position before Vue can handle it
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'portfolio-v2',
      component: () => import('../pages/PortfolioV2.vue'),
    },
    {
      path: '/v1',
      name: 'portfolio-v1',
      component: () => import('../pages/PortfolioV1.vue'),
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    // If navigating with back/forward buttons, restore saved position
    if (savedPosition) return savedPosition
    // If navigating to a hash (e.g. #about), scroll to that element
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }
    // Otherwise scroll to top
    return { top: 0 }
  },
})

export default router
