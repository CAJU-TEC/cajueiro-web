
export default [
  {
    path: 'collaborators/',
    name: 'collaborators.list',
    meta: {permissions: ['collaborators.index', 'collaborators.*']},
    component: () => import('src/pages/collaborators/List.vue')
  },
  {
    path: 'collaborators/form-collaborators/:id?',
    name: 'collaborators.form',
    component: () => import('src/pages/collaborators/FormCollaborator.vue')
  },
];
