// src/router/web.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Init from '../Init.vue';
import AfterloginView from '../access/AfterloginView.vue';
import { isAuthenticated } from '../api/token';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Init,
    meta: { requiresAuth: false },
  },
  {
    path: '/home',
    name: 'Home',
    component: AfterloginView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard: Cegah akses jika belum terautentikasi
router.beforeEach((to, _from, next) => {
  const isAuth = isAuthenticated();

  if (to.meta.requiresAuth && !isAuth) {
    // Cegah akses ke /home jika belum login, kembalikan ke /
    return next({ path: '/' });
  }

  if (to.path === '/' && isAuth) {
    // Jika sudah login, arahkan langsung ke /home
    return next({ path: '/home' });
  }

  next();
});

export default router;

