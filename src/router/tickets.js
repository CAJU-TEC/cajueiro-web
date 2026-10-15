import can from '../support/auth/can.js';

// editar protocolo (rota com :id) só para super-admin ou tickets.trash; criar segue as regras normais
const canEditTicket = (to, from, next) => {
  if (!to.params.id) return next(true);
  try {
    const names = JSON.parse(localStorage.getItem('permissions') ?? '[]').map((p) => p.name)
      .concat(JSON.parse(localStorage.getItem('roles') ?? '[]').map((r) => r.name));
    return next(names.includes('super-admin') || names.includes('tickets.trash'));
  } catch (e) {
    return next(false);
  }
};

export default [
  {
    path: 'tickets/',
    name: 'tickets.list',
    meta: {permissions: ['tickets.index', 'tickets.*']},
    component: () => import('src/pages/tickets/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'tickets/trashed',
    name: 'tickets.trashed',
    meta: {permissions: ['super-admin', 'tickets.trash']},
    component: () => import('src/pages/tickets/Trashed.vue'),
    beforeEnter: [can]
  },
  {
    path: 'tickets/form-ticket/:id?',
    name: 'tickets.form',
    meta: {permissions: ['tickets.create', 'tickets.edit', 'tickets.*']},
    component: () => import('src/pages/tickets/FormTicket.vue'),
    beforeEnter: [can, canEditTicket]
  },
  {
    path: 'tickets/details/:id?',
    name: 'tickets.details',
    meta: {permissions: ['tickets.details', 'tickets.*']},
    component: () => import('src/pages/tickets/DetailsView.vue'),
    beforeEnter: [can]
  },
];
