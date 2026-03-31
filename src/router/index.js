import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Productos from '../views/Productos.vue'
import Ventas from '../views/Ventas.vue'
import Inventario from '../views/Inventario.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login,
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/productos',
    name: 'productos',
    component: Productos,
    meta: { requiresAuth: true },
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: Ventas,
    meta: { requiresAuth: true },
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: Inventario,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const isLogged = sessionStorage.getItem('pos_session') === 'admin'

  if (to.meta.requiresAuth && !isLogged) return '/'
  if (to.name === 'login' && isLogged) return '/dashboard'
})

export default router