import can from '../support/auth/can.js';

export default [
  {
    path: 'jobPlans/',
    name: 'jobPlans.list',
    meta: {permissions: ['jobplans.index', 'jobplans.*']},
    component: () => import('src/pages/jobPlans/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'jobPlans/form-job-plans/:id?',
    name: 'jobPlans.form',
    meta: {permissions: ['jobplans.create', 'jobplans.update', 'jobplans.*']},
    component: () => import('src/pages/jobPlans/FormJobPlans.vue'),
    beforeEnter: [can]
  },
];
