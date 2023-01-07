import clients from './clients.js';
import impacts from './impacts.js';
import collaborators from './collaborators.js';
import corporates from './corporates.js';
import jobPlans from './jobPlans.js';
import tickets from './tickets.js';
import users from './users.js';
import auth from './auth.js';
import groups from './groups.js';

import can from '../support/auth/can.js';

const routes = [
  // path for login
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      ...auth,
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      console.log(can(to.meta.permissions));
      next(true);
    },
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
      ...users,
      ...groups,
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
