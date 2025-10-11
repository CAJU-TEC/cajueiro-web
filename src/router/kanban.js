import can from '../support/auth/can.js';

export default [
  {
    path: 'kanban/',
    name: 'kanban.list',
    meta: { permissions: ['tickets.*', 'tickets.list'] },
    component: () => import('src/pages/kanban/KanbanPage.vue'),
    beforeEnter: [can],
  },
];
