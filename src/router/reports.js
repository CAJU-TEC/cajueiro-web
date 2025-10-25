// src/router/reports.js
import can from '../support/auth/can.js';

export default [
  {
    path: '/reports/support',
    name: 'reports.support',
    meta: { permissions: ['tickets.index', 'tickets.*'] },
    component: () => import('src/pages/reports/SupportReport.vue'),
    beforeEnter: [can],
  },
  {
    path: '/reports/development',
    name: 'reports.development',
    meta: { permissions: ['tickets.index', 'tickets.*'] },
    component: () => import('src/pages/reports/DevelopmentReport.vue'),
    beforeEnter: [can],
  },
  {
    path: '/reports/qa',
    name: 'reports.qa',
    meta: { permissions: ['tickets.index', 'tickets.*'] },
    component: () => import('src/pages/reports/QAReport.vue'),
    beforeEnter: [can],
  },
];
