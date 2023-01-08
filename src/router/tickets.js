import can from '../support/auth/can.js';

export default [
  {
    path: 'tickets/',
    name: 'tickets.list',
    meta: {permissions: ['tickets.index', 'tickets.*']},
    component: () => import('src/pages/tickets/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'tickets/form-ticket/:id?',
    name: 'tickets.form',
    meta: {permissions: ['tickets.create', 'tickets.edit', 'tickets.*']},
    component: () => import('src/pages/tickets/FormTicket.vue'),
    beforeEnter: [can]
  },
];
