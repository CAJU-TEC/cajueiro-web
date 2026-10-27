import can from '../support/auth/can.js';

// mesmas permissões de organizações
export default [
  {
    path: 'apps/',
    name: 'apps.list',
    meta: { permissions: ['corporates.index', 'corporates.*'] },
    component: () => import('src/pages/apps/List.vue'),
    beforeEnter: [can],
  },
  {
    path: 'apps/historico',
    name: 'apps.historico',
    meta: { permissions: ['corporates.index', 'corporates.*'] },
    component: () => import('src/pages/apps/Historico.vue'),
    beforeEnter: [can],
  },
];
