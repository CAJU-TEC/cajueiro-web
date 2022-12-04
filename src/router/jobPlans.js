
export default [
  {
    path: 'jobPlans/',
    name: 'jobPlans.list',
    component: () => import('src/pages/jobPlans/List.vue')
  },
  {
    path: 'jobPlans/form-job-plans/:id?',
    name: 'jobPlans.form',
    component: () => import('src/pages/jobPlans/FormJobPlans.vue')
  },
];
