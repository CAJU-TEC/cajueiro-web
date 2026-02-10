import can from '../support/auth/can.js';

export default [
  {
    path: 'control/',
    name: 'control.list',
    meta: {permissions: ['tickets.*', 'tickets.list']},
    component: () => import('src/pages/control/ControlList.vue'),
    beforeEnter: [can]
  },
];
