import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../database/db'

/**
 * Store de autenticación.
 * Fuente única de verdad para saber quién está logueado.
 * Persiste en sessionStorage para sobrevivir recargas de página.
 */
export const useAuthStore = defineStore('auth', () => {
  // ── Estado reactivo ────────────────────────────────────────────────────────
  const userId   = ref(Number(sessionStorage.getItem('pos_userId'))   || null)
  const username = ref(sessionStorage.getItem('pos_user')             || '')
  const role     = ref(sessionStorage.getItem('pos_session')          || '')

  // ── Computed ───────────────────────────────────────────────────────────────
  const isLoggedIn  = computed(() => !!role.value)
  const isAdmin     = computed(() => role.value === 'admin')
  const isCajero    = computed(() => role.value === 'cajero')

  // ── Acciones ───────────────────────────────────────────────────────────────

  /**
   * Intenta autenticar al usuario.
   * @returns {Object} { ok: bool, error: string }
   */
  async function login(inputUsername, inputPassword) {
    const u = (inputUsername || '').trim().toLowerCase()

    if (!u || !inputPassword) {
      return { ok: false, error: 'Completa todos los campos.' }
    }

    try {
      const found = await db.usuarios.where('username').equals(u).first()

      if (!found || found.password !== inputPassword) {
        return { ok: false, error: 'Usuario o contraseña incorrectos.' }
      }

      // Persistir sesión
      sessionStorage.setItem('pos_userId',  found.id)
      sessionStorage.setItem('pos_user',    found.username)
      sessionStorage.setItem('pos_session', found.role)

      userId.value   = found.id
      username.value = found.username
      role.value     = found.role

      return { ok: true }
    } catch (e) {
      console.error('[Auth] login error:', e)
      return { ok: false, error: 'Error al conectar con la base de datos.' }
    }
  }

  /** Cierra sesión y limpia el estado. */
  function logout() {
    sessionStorage.removeItem('pos_userId')
    sessionStorage.removeItem('pos_user')
    sessionStorage.removeItem('pos_session')
    userId.value   = null
    username.value = ''
    role.value     = ''
  }

  /**
   * Cambia la contraseña del usuario actualmente logueado.
   * @returns {Object} { ok: bool, error: string }
   */
  async function cambiarPassword(actual, nueva) {
    if (!nueva || nueva.length < 4) {
      return { ok: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' }
    }

    try {
      const found = await db.usuarios.get(userId.value)

      if (!found || found.password !== actual) {
        return { ok: false, error: 'La contraseña actual es incorrecta.' }
      }

      await db.usuarios.update(userId.value, { password: nueva })
      return { ok: true }
    } catch (e) {
      console.error('[Auth] cambiarPassword error:', e)
      return { ok: false, error: 'Error al actualizar la contraseña.' }
    }
  }

  return {
    userId, username, role,
    isLoggedIn, isAdmin, isCajero,
    login, logout, cambiarPassword,
  }
})
