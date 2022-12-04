
export default [
  {
    path: 'impacts/',
    name: 'impacts.list',
    component: () => import('src/pages/impacts/List.vue')
  },
  {
    path: 'impacts/form-impact/:id?',
    name: 'impacts.form',
    component: () => import('src/pages/impacts/FormImpact.vue')
  },
];
