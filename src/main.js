import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'
import { seedAdminIfMissing } from './database/db'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Garantiza que el admin siempre exista al arrancar (idempotente)
seedAdminIfMissing().then(() => {
  app.mount('#app')
})
