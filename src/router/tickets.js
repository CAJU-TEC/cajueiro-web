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
  {
    path: 'tickets/details/:id?',
    name: 'tickets.details',
    meta: {permissions: ['tickets.details', 'tickets.*']},
    component: () => import('src/pages/tickets/DetailsView.vue'),
    beforeEnter: [can]
  },
  {
    path: 'tickets/check-list',
    name: 'tickets.check-list',
    meta: {permissions: ['tickets.details', 'tickets.*']},
    component: () => import('src/pages/tickets/CheckList.vue'),
    beforeEnter: [can]
  },
];
