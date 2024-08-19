import checkLists from './checkLists.js';
import clients from './clients.js';
import impacts from './impacts.js';
import collaborators from './collaborators.js';
import corporates from './corporates.js';
import jobPlans from './jobPlans.js';
import tickets from './tickets.js';
import users from './users.js';
import auth from './auth.js';
import groups from './groups.js';

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
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue')
      },
      ...checkLists,
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
