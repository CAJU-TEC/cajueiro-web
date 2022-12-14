
export default [
  {
    path: 'corporates/',
    name: 'corporates.list',
    component: () => import('src/pages/corporates/List.vue')
  },
  {
    path: 'corporates/form-corporate/:id?',
    name: 'corporates.form',
    component: () => import('src/pages/corporates/FormCorporate.vue')
  },
];
