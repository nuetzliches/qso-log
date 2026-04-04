import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'qso-entry',
      component: () => import('../views/QsoEntryView.vue'),
    },
    {
      path: '/history',
      name: 'qso-history',
      component: () => import('../views/QsoHistoryView.vue'),
    },
    {
      path: '/operators',
      name: 'operators',
      component: () => import('../views/OperatorManagementView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

export default router
