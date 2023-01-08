import can from '../support/auth/can.js';

export default [
  {
    path: 'collaborators/',
    name: 'collaborators.list',
    meta: {permissions: ['collaborators.index', 'collaborators.*']},
    component: () => import('src/pages/collaborators/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'collaborators/form-collaborators/:id?',
    name: 'collaborators.form',
    meta: {permissions: ['collaborators.create', 'collaborators.edit', 'collaborators.*']},
    component: () => import('src/pages/collaborators/FormCollaborator.vue'),
    beforeEnter: [can]
  },
];
