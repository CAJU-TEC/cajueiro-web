import can from '../support/auth/can.js';

export default [
  {
    path: 'impacts/',
    name: 'impacts.list',
    meta: {permissions: ['impacts.index', 'impacts.*']},
    component: () => import('src/pages/impacts/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'impacts/form-impact/:id?',
    name: 'impacts.form',
    meta: {permissions: ['impacts.create', 'impacts.edit', 'impacts.*']},
    component: () => import('src/pages/impacts/FormImpact.vue'),
    beforeEnter: [can]
  },
];
