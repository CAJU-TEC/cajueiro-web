export default [
  {
    path: 'apps/',
    name: 'apps.list',
    component: () => import('src/pages/apps/List.vue'),
  },
  {
    path: 'apps/historico',
    name: 'apps.historico',
    component: () => import('src/pages/apps/Historico.vue'),
  },
];
