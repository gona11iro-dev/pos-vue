import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initNativeDB } from './api/sqliteDriver'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// Inicializar app de forma asíncrona para esperar a la base de datos
async function startApp() {
  console.log('[Main] Iniciando aplicación...');
  
  // Inicializar DB nativa si estamos en móvil
  try {
    await initNativeDB();
    console.log('[Main] Base de datos lista.');
  } catch (e) {
    console.error('[Main] Falló la inicialización de la base de datos:', e);
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  await router.isReady()
  app.mount('#app')
}

startApp();
