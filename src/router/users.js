
export default [
  {
    path: '/login',
    name: 'users.login',
    component: () => import('src/pages/users/Login.vue')
  },
  {
    path: '/logout',
    name: 'users.logout',
    component: () => import('src/pages/users/Logout.vue')
  },
];
