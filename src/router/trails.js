import can from '../support/auth/can.js';

export default [
  {
    path: 'trails/',
    name: 'trails.list',
    meta: {permissions: ['trails.index', 'trails.*']},
    component: () => import('src/pages/trails/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'trails/form-trail/:id?',
    name: 'trails.form',
    meta: {permissions: ['trails.store', 'trails.update', 'trails.*']},
    component: () => import('src/pages/trails/FormTrail.vue'),
    beforeEnter: [can]
  },
  {
    path: 'trails/progress/:id',
    name: 'trails.progress',
    meta: {permissions: ['trails.index', 'trails.advance', 'trails.*']},
    component: () => import('src/pages/trails/TrailProgress.vue'),
    beforeEnter: [can]
  },
  {
    path: 'trails/mine',
    name: 'trails.mine',
    meta: {permissions: ['trails.mine', 'trails.index', 'trails.*']},
    component: () => import('src/pages/trails/MyTrail.vue'),
    beforeEnter: [can]
  },
  {
    path: 'trails/my-cajueiro',
    name: 'trails.cajueiro',
    meta: {permissions: ['trails.mine', 'trails.index', 'trails.*']},
    component: () => import('src/pages/trails/MyCajueiro.vue'),
    beforeEnter: [can]
  },
];
