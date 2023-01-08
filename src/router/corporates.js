import can from '../support/auth/can.js';

export default [
  {
    path: 'corporates/',
    name: 'corporates.list',
    meta: {permissions: ['corporates.index', 'corporates.*']},
    component: () => import('src/pages/corporates/List.vue'),
    beforeEnter: [can]
  },
  {
    path: 'corporates/form-corporate/:id?',
    name: 'corporates.form',
    meta: {permissions: ['corporates.create', 'corporates.edit', 'corporates.*']},
    component: () => import('src/pages/corporates/FormCorporate.vue'),
    beforeEnter: [can]
  },
];
