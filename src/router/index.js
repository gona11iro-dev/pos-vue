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
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/productos',
    name: 'productos',
    component: Productos,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: Ventas,
    meta: { requiresAuth: true, roles: ['admin', 'cajero'] },
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: Inventario,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const role = sessionStorage.getItem('pos_session')
  const isLogged = !!role

  if (to.meta.requiresAuth && !isLogged) {
    return '/'
  }

  if (to.meta.requiresAuth && isLogged) {
    // Check role permission
    if (to.meta.roles && !to.meta.roles.includes(role)) {
      // Si no tiene permiso, lo mandamos a ventas (cajero) o si no hay fallback, nada.
      return role === 'cajero' ? '/ventas' : '/dashboard'
    }
  }

  if (to.name === 'login' && isLogged) {
    return role === 'cajero' ? '/ventas' : '/dashboard'
  }
})

export default router