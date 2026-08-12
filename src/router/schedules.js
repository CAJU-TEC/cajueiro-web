import can from '../support/auth/can.js';

export default [
  {
    path: 'schedules/',
    name: 'schedules.list',
    meta: {permissions: ['schedules.list', 'schedules.*']},
    component: () => import('src/pages/schedules/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'schedules/form-schedule/:id?',
    name: 'schedules.form',
    meta: {permissions: ['schedules.store', 'schedules.update', 'schedules.*']},
    component: () => import('src/pages/schedules/FormSchedule.vue'),
    beforeEnter: [can]
  },
  {
    path: 'schedules/show/:id',
    name: 'schedules.show',
    meta: {permissions: ['schedules.show', 'schedules.*']},
    component: () => import('src/pages/schedules/Show.vue'),
    beforeEnter: [can]
  },
];
