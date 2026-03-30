import { createRouter, createWebHistory } from 'vue-router'

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
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
