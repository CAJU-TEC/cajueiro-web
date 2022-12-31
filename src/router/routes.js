import clients from './clients.js';
import impacts from './impacts.js';
import collaborators from './collaborators.js';
import corporates from './corporates.js';
import jobPlans from './jobPlans.js';
import tickets from './tickets.js';
import users from './users.js';

const routes = [
  // path for login
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      ...users,
    ]
  },
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
      ...tickets,
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
];

export default routes;
