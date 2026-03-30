import { createRouter, createWebHistory } from 'vue-router'

// Let Vue Router handle scroll restoration, not the browser
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
    // Restore saved position on back/forward navigation
    if (savedPosition) return savedPosition

    if (to.hash) {
      // Detect initial page load/refresh: _from has no name on first navigation
      const isInitialLoad = !_from.name

      if (isInitialLoad) {
        // On refresh: jump instantly to the hash section — no animation, no "top first" flash
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ el: to.hash, behavior: 'instant', top: 80 })
          }, 50)
        })
      }

      // In-app nav (clicking navbar links): smooth scroll
      return { el: to.hash, behavior: 'smooth', top: 80 }
    }

    // Default: scroll to top
    return { top: 0, behavior: 'instant' }
  },
})

export default router
