<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <h1>Surtiprais</h1>
        <p class="login-subtitle">Inicia sesion para continuar</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <label for="user">Usuario</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="user"
              v-model="user"
              type="text"
              placeholder="Ingresa tu usuario"
              autocomplete="username"
              @keyup.enter="login"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="pass">Contrasena</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="pass"
              v-model="pass"
              type="password"
              placeholder="Ingresa tu contrasena"
              autocomplete="current-password"
              @keyup.enter="login"
            />
          </div>
        </div>

        <button class="login-btn" @click="login" :disabled="loading">
          {{ loading ? 'Verificando...' : 'Entrar' }}
        </button>

        <p v-if="msg" class="error-msg">{{ msg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router   = useRouter()
const auth     = useAuthStore()

const user     = ref('')
const pass     = ref('')
const msg      = ref('')
const loading  = ref(false)

async function login() {
  msg.value     = ''
  loading.value = true

  const result = await auth.login(user.value, pass.value)

  loading.value = false

  if (result.ok) {
    router.push(auth.isAdmin ? '/dashboard' : '/ventas')
  } else {
    msg.value = result.error
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--gray-900) 0%, #1e3a5f 50%, var(--primary-dark) 100%);
  padding: var(--space-4);
}

.login-card {
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-8) var(--space-8) var(--space-6);
  width: 100%;
  max-width: 400px;
}

.login-logo {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: var(--primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin: 0 auto var(--space-4);
}

.login-logo h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.login-subtitle {
  color: var(--gray-500);
  font-size: var(--text-sm);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-group label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--gray-400);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
  color: var(--gray-800);
  background: var(--gray-50);
  transition: all var(--transition-fast);
  outline: none;
}

.input-wrapper input::placeholder {
  color: var(--gray-400);
}

.input-wrapper input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-2);
}

.login-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.login-btn:active {
  transform: translateY(0);
}

.error-msg {
  text-align: center;
  color: var(--danger);
  font-size: var(--text-sm);
  font-weight: 500;
  background: var(--danger-light);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}
</style>
