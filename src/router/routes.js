import clients from '../router/clients.js';
import impacts from '../router/impacts.js';
import collaborators from './collaborators.js';
import corporates from './corporates.js';
import jobPlans from './jobPlans.js';
import tickets from './tickets.js';

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue')
      },
      ...clients,
      ...impacts,
      ...collaborators,
      ...jobPlans,
      ...corporates,
      ...tickets
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
