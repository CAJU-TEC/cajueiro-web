import can from '../support/auth/can.js';

export default [
  {
    path: 'clients/',
    name: 'clients.list',
    meta: {permissions: ['clients.index', 'clients.*']},
    component: () => import('src/pages/clients/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'clients/form-client/:id?',
    name: 'clients.form',
    meta: {permissions: ['clients.store', 'clients.edit', 'clients.*']},
    component: () => import('src/pages/clients/FormClient.vue'),
    beforeEnter: [can]
  },
];
