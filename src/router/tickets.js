
export default [
  {
    path: 'tickets/',
    name: 'tickets.list',
    component: () => import('src/pages/tickets/List.vue')
  },
  {
    path: 'tickets/form-ticket/:id?',
    name: 'tickets.form',
    component: () => import('src/pages/tickets/FormTicket.vue')
  },
];
