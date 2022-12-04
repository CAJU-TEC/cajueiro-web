
export default [
  {
    path: 'clients/',
    name: 'clients.list',
    component: () => import('src/pages/clients/List.vue')
  },
  {
    path: 'clients/form-client/:id?',
    name: 'clients.form',
    component: () => import('src/pages/clients/FormClient.vue')
  },
];
