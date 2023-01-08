import can from '../support/auth/can.js';

export default [
  {
    path: 'groups/',
    name: 'groups.list',
    meta: {permissions: ['groups.index', 'groups.*']},
    component: () => import('src/pages/groups/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'groups/form-client/:id?',
    name: 'groups.form',
    meta: {permissions: ['groups.create', 'groups.edit', 'groups.*']},
    component: () => import('src/pages/groups/FormClient.vue'),
    beforeEnter: [can]
  },
];
