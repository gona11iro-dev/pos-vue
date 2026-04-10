import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Productos from '../views/Productos.vue'
import Ventas from '../views/Ventas.vue'
import Inventario from '../views/Inventario.vue'
import Usuarios from '../views/Usuarios.vue'
import BaseDatos from '../views/BaseDatos.vue'
import HistorialVentas from '../views/HistorialVentas.vue'
import CorteCaja from '../views/CorteCaja.vue'

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
    meta: { requiresAuth: true, roles: ['cajero'] },
  },
  {
    path: '/historial',
    name: 'historial',
    component: HistorialVentas,
    meta: { requiresAuth: true, roles: ['admin', 'cajero'] },
  },
  {
    path: '/corte',
    name: 'corte',
    component: CorteCaja,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/inventario',
    name: 'inventario',
    component: Inventario,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: Usuarios,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/base-datos',
    name: 'base-datos',
    component: BaseDatos,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navegación
// Lee sessionStorage directamente para ser compatible con el Pinia store
// (ambos usan las mismas claves: pos_session, pos_user, pos_userId)
router.beforeEach((to) => {
  const role     = sessionStorage.getItem('pos_session') || ''
  const isLogged = !!role

  // Ruta protegida sin sesión → login
  if (to.meta.requiresAuth && !isLogged) return '/'

  // Ruta protegida con sesión pero sin el rol correcto → home del rol
  if (to.meta.requiresAuth && isLogged) {
    if (to.meta.roles && !to.meta.roles.includes(role)) {
      return role === 'cajero' ? '/ventas' : '/dashboard'
    }
  }

  // Ya logueado intentando entrar al login → home del rol
  if (to.name === 'login' && isLogged) {
    return role === 'cajero' ? '/ventas' : '/dashboard'
  }
})

export default router
