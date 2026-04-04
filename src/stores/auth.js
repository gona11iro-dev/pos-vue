import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'

/**
 * Store de autenticación con Backend SQL.
 */
export const useAuthStore = defineStore('auth', () => {
  const userId   = ref(Number(sessionStorage.getItem('pos_userId'))   || null)
  const username = ref(sessionStorage.getItem('pos_user')             || '')
  const role     = ref(sessionStorage.getItem('pos_session')          || '')

  const isLoggedIn  = computed(() => !!role.value)
  const isAdmin     = computed(() => role.value === 'admin')
  const isCajero    = computed(() => role.value === 'cajero')

  async function login(inputUsername, inputPassword) {
    const u = (inputUsername || '').trim().toLowerCase()
    if (!u || !inputPassword) {
      return { ok: false, error: 'Completa todos los campos.' }
    }

    try {
      const found = await api.login(u, inputPassword)

      // Guardar en sesión
      sessionStorage.setItem('pos_userId',  found.id)
      sessionStorage.setItem('pos_user',    found.username)
      sessionStorage.setItem('pos_session', found.role)

      userId.value   = found.id
      username.value = found.username
      role.value     = found.role

      return { ok: true }
    } catch (e) {
      console.error('[Auth] login error:', e)
      return { ok: false, error: e.message || 'Error al conectar con la base de datos.' }
    }
  }

  function logout() {
    sessionStorage.removeItem('pos_userId')
    sessionStorage.removeItem('pos_user')
    sessionStorage.removeItem('pos_session')
    userId.value   = null
    username.value = ''
    role.value     = ''
  }

  async function cambiarPassword(passActual, passNueva) {
    if (!passActual || !passNueva) return { ok: false, error: 'Campos vacíos' }
    try {
      await api.changePassword(username.value, passActual, passNueva)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  return {
    userId, username, role,
    isLoggedIn, isAdmin, isCajero,
    login, logout, cambiarPassword,
  }
})
