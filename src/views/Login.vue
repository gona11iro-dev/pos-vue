<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Login POS</h1>

      <input
        v-model="user"
        type="text"
        placeholder="Usuario"
        autocomplete="username"
      />

      <input
        v-model="pass"
        type="password"
        placeholder="Contraseña"
        autocomplete="current-password"
      />

      <button @click="login">Entrar</button>

      <p v-if="msg">{{ msg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = ref('')
const pass = ref('')
const msg = ref('')

function login() {
  msg.value = ''

  if (user.value.trim() === 'admin' && pass.value === '1234') {
    sessionStorage.setItem('pos_session', 'admin')
    router.push('/dashboard')
  } else {
    msg.value = 'Usuario o contraseña incorrectos.'
  }
}
</script>