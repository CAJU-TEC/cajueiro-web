
export default [
  {
    path: '/login',
    name: 'auth.login',
    component: () => import('src/pages/auth/Login.vue')
  },
  {
    path: '/logout',
    name: 'auth.logout',
    component: () => import('src/pages/auth/Logout.vue')
  },
];
