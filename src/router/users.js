import can from '../support/auth/can.js';

export default [
  {
    path: 'users/',
    name: 'users.list',
    meta: {permissions: ['users.index', 'users.*']},
    component: () => import('src/pages/users/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'users/form-client/:id?',
    name: 'users.form',
    meta: {permissions: ['users.create', 'users.edit', 'users.*']},
    component: () => import('src/pages/users/FormClient.vue'),
    beforeEnter: [can]
  },
];
