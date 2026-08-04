import can from '../support/auth/can.js';

export default [
  {
    path: 'teams/',
    name: 'teams.list',
    meta: {permissions: ['teams.index', 'teams.*']},
    component: () => import('src/pages/teams/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'teams/form-team/:id?',
    name: 'teams.form',
    meta: {permissions: ['teams.store', 'teams.update', 'teams.*']},
    component: () => import('src/pages/teams/FormTeam.vue'),
    beforeEnter: [can]
  },
];
