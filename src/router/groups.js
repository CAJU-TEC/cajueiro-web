
export default [
  {
    path: 'groups/',
    name: 'groups.list',
    component: () => import('src/pages/groups/List.vue')
  },
  {
    path: 'groups/form-client/:id?',
    name: 'groups.form',
    component: () => import('src/pages/groups/FormClient.vue')
  },
];
