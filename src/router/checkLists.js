import can from '../support/auth/can.js';

export default [
  {
    path: 'checkLists/',
    name: 'checkLists.list',
    meta: {permissions: ['tickets.*', 'tickets.list']},
    component: () => import('src/pages/checkLists/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'checkLists/form-ticket/:id?',
    name: 'checkLists.form',
    meta: {permissions: ['checkLists.create', 'checkLists.edit', 'checkLists.*']},
    component: () => import('src/pages/checkLists/FormCheckList.vue'),
    // beforeEnter: [can]
  },
  // {
  //   path: 'checkLists/details/:id?',
  //   name: 'checkLists.details',
  //   meta: {permissions: ['checkLists.details', 'checkLists.*']},
  //   component: () => import('src/pages/checkLists/List.vue'),
  //   // beforeEnter: [can]
  // },
  {
    path: 'checkLists/check-list',
    name: 'checkLists.check-list',
    meta: {permissions: ['checkLists.details', 'checkLists.*']},
    component: () => import('src/pages/checkLists/FormCheckList.vue'),
    // beforeEnter: [can]
  },
  {
    path: 'checkLists/movements',
    name: 'checkLists.movements',
    meta: {permissions: ['checkLists.movements', 'checkLists.*']},
    component: () => import('src/pages/checkLists/MovementsCheckList.vue'),
    // beforeEnter: [can]
  },
];
