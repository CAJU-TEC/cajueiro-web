
export default [
  {
    path: 'users/',
    name: 'users.list',
    component: () => import('src/pages/users/List.vue')
  },
  {
    path: 'users/form-client/:id?',
    name: 'users.form',
    component: () => import('src/pages/users/FormClient.vue')
  },
];
