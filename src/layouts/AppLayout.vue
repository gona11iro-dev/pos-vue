<template>
  <div class="app-layout" :class="{ 'is-mobile-view': isMobileView }">
    <!-- Top Navbar for mobile (minimalist) -->
    <header v-if="isMobileView" class="mobile-top-navbar">
      <div class="top-navbar-left">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
      </div>
      <h1 class="top-navbar-title">{{ currentRole === 'admin' ? 'Admin' : 'Cajero' }}</h1>
      <div class="top-navbar-right">
        <div class="mobile-user-avatar" @click="showUserMenu = true">
          {{ currentUsername ? currentUsername.charAt(0).toUpperCase() : 'U' }}
        </div>
      </div>
    </header>

    <!-- Menú Desplegable Móvil -->
    <div v-if="showUserMenu && isMobileView" class="mobile-menu-overlay" @click="showUserMenu = false">
      <div class="mobile-dropdown" @click.stop>
        <div class="m-drop-header">
          <strong>{{ currentUsername }}</strong>
          <span>{{ currentRole === 'admin' ? 'Administrador' : 'Cajero' }}</span>
        </div>
        <button class="m-drop-btn" @click="abrirCambiarPass(); showUserMenu = false">🔑 Cambiar Contraseña</button>
        <button class="m-drop-btn text-danger" @click="logout(); showUserMenu = false">🚪 Cerrar Sesión</button>
      </div>
    </div>

    <!-- Bottom Navigation for mobile -->
    <nav v-if="isMobileView" class="bottom-nav">
      <router-link
        v-for="item in mobileMenuItems"
        :key="item.to"
        :to="item.to"
        class="bottom-nav-item"
        active-class="bottom-nav-item--active"
      >
        <span class="bottom-nav-icon" v-html="item.icon"></span>
        <span class="bottom-nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Desktop Sidebar (Hidden on Mobile) -->
    <aside v-if="!isMobileView" class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /></svg>
        </div>
        <span class="brand-name">{{ brandName }}</span>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in menu"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" @click="logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /></svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <slot />
    </main>
  </div>

  <!-- Modal cambiar contraseña (cajero) -->
  <Teleport to="body">
    <div v-if="modalPass" class="modal-overlay" @click.self="modalPass = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Cambiar contraseña</h3>
          <button class="btn-close-modal" @click="modalPass = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label for="pass-actual">Contraseña actual</label>
            <input id="pass-actual" v-model="passForm.actual" type="password" placeholder="Tu contraseña actual" />
          </div>
          <div class="input-group">
            <label for="pass-nueva">Nueva contraseña</label>
            <input id="pass-nueva" v-model="passForm.nueva" type="password" placeholder="Mínimo 4 caracteres" />
          </div>
          <div class="input-group">
            <label for="pass-confirmar">Confirmar nueva contraseña</label>
            <input id="pass-confirmar" v-model="passForm.confirmar" type="password" placeholder="Repite la nueva contraseña" />
          </div>
          <p v-if="passMsg" class="modal-msg" :class="passMsgOk ? 'modal-msg--ok' : 'modal-msg--err'">
            {{ passMsg }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" @click="modalPass = false">Cancelar</button>
          <button class="btn-guardar" @click="cambiarPassword" :disabled="savingPass">
            {{ savingPass ? 'Guardando...' : 'Guardar contraseña' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Capacitor } from '@capacitor/core'

const router = useRouter()
const auth   = useAuthStore()

const windowWidth = ref(window.innerWidth)
const showUserMenu = ref(false)

const currentRole     = computed(() => auth.role)
const currentUsername = computed(() => auth.username)
const brandName       = computed(() => Capacitor.getPlatform() !== 'web' ? 'Gudi' : 'Surtiprais')

const isMobileView = computed(() => {
  // Mobile detection: 
  // 1. Screen size (<= 1024px to include tablets) 
  // 2. Native platforms (Android/iOS)
  const isSmallScreen = windowWidth.value <= 1024
  const isNativeApp   = Capacitor.getPlatform() !== 'web'
  return isSmallScreen || isNativeApp
})

// Actualizar el ancho de ventana al redimensionar
window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth
})

// Menú móvil (bottom nav) simplificado
const mobileMenuItems = computed(() => {
  if (currentRole.value === 'admin') {
    return [
      { to: '/dashboard', label: 'Inicio', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
      { to: '/historial', label: 'Historial', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
      { to: '/corte', label: 'Corte', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12A10 10 0 0015 21v-9z"/><path d="M12 2A10 10 0 0012 22"/><path d="M15 3A10 10 0 0115 21"/></svg>' },
      { to: '/productos', label: 'Productos', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>' },
      { to: '/inventario', label: 'Inventario', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
      { to: '/usuarios', label: 'Usuarios', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
      { to: '/base-datos', label: 'Datos', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>' },
    ]
  } else {
    return [
      { to: '/ventas', label: 'Hacer Venta', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
      { to: '/historial', label: 'Historial de Venta', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
    ]
  }
})

// ── Menú ─────────────────────────────────
const menuCompleto = [
  {
    to: '/dashboard', label: 'Inicio', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'
  },
  {
    to: '/ventas', label: 'Venta Nueva', roles: ['cajero'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
  },
  {
    to: '/historial', label: 'Historial', roles: ['admin', 'cajero'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  },
  {
    to: '/corte', label: 'Corte de Caja', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
  },
  {
    to: '/productos', label: 'Productos', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
  },
  {
    to: '/inventario', label: 'Inventario', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'
  },
  {
    to: '/usuarios', label: 'Usuarios', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  },
  {
    to: '/base-datos', label: 'Base de Datos', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'
  },
]

const menu = computed(() =>
  menuCompleto.filter(item => item.roles.includes(auth.role))
)

// ── Logout ────────────────────────────────
function logout() {
  auth.logout()
  router.push('/')
}

// ── Cambiar contraseña (cajero) ───────────
const modalPass  = ref(false)
const savingPass = ref(false)
const passMsg    = ref('')
const passMsgOk  = ref(false)
const passForm   = ref({ actual: '', nueva: '', confirmar: '' })

function abrirCambiarPass() {
  passForm.value = { actual: '', nueva: '', confirmar: '' }
  passMsg.value  = ''
  passMsgOk.value = false
  modalPass.value = true
}

async function cambiarPassword() {
  passMsg.value   = ''
  passMsgOk.value = false

  if (!passForm.value.actual || !passForm.value.nueva) {
    passMsg.value = 'Completa todos los campos.'
    return
  }
  if (passForm.value.nueva !== passForm.value.confirmar) {
    passMsg.value = 'Las contraseñas nuevas no coinciden.'
    return
  }

  savingPass.value = true
  const result = await auth.cambiarPassword(passForm.value.actual, passForm.value.nueva)
  savingPass.value = false

  if (result.ok) {
    passMsgOk.value = true
    passMsg.value   = '¡Contraseña actualizada correctamente!'
    passForm.value  = { actual: '', nueva: '', confirmar: '' }
    setTimeout(() => { modalPass.value = false }, 1500)
  } else {
    passMsg.value = result.error
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ──────────────────────────── */
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sidebar-close-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--gray-400);
  margin-left: auto;
  cursor: pointer;
}

.brand-icon {
  width: 40px; height: 40px;
  background: var(--primary);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.brand-name {
  font-size: var(--text-lg); font-weight: 700;
  color: #fff; letter-spacing: -0.02em;
}

/* Top Navbar for mobile (Original Colors) */
.mobile-top-navbar {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: var(--sidebar-bg); /* Original dark gray */
  color: #fff;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  border-bottom: 2px solid var(--primary); /* Original blue line */
}

.top-navbar-title { font-size: 1.1rem; font-weight: 700; color: #fff; }
.mobile-user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: #fff; cursor: pointer; }

/* Menú dropdown móvil */
.mobile-menu-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 2000; display: flex; justify-content: flex-end; padding-top: 65px; padding-right: 15px; }
.mobile-dropdown { background: #fff; width: 220px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; animation: popIn 0.2s ease; display: flex; flex-direction: column; }
.m-drop-header { padding: 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; flex-direction: column; }
.m-drop-header strong { color: #0f172a; font-size: 1rem; }
.m-drop-header span { color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
.m-drop-btn { padding: 15px; text-align: left; background: #fff; border: none; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #334155; font-size: 0.95rem; display: flex; gap: 10px; align-items: center; }
.m-drop-btn.text-danger { color: #ef4444; border-bottom: none; }

/* Bottom Nav (Original Colors/Shape - WITH SCROLLING) */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 65px;
  background: #ffffff; /* Clean white for mobile */
  color: var(--gray-600);
  align-items: center;
  justify-content: flex-start; /* Permite que los elementos se acumulen desde la izquierda */
  padding: 0 10px;
  z-index: 1000;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
  border-top: 1px solid var(--gray-200);
  
  /* Habilitar Scorll horizontal Táctil */
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none; /* Firefox */
  -webkit-overflow-scrolling: touch; /* Smoother scrolling iOS */
}

/* Ocultar barra de scroll para limpiar diseño en Chrome/Safari */
.bottom-nav::-webkit-scrollbar {
  display: none;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: inherit;
  text-decoration: none;
  font-size: 0.70rem;
  font-weight: 500;
  transition: all 0.2s;
  
  /* Comportamiento al scrollear */
  flex: 0 0 auto; /* Importante para que no se compriman */
  min-width: 75px; 
  height: 100%;
}

.bottom-nav-item--active { color: var(--primary); font-weight: 700; }
.bottom-nav-icon { color: inherit; }

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 950;
}

/* ── Main Content ─────────────────────── */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  background: var(--content-bg);
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

/* ── Responsive adjustments ───────────── */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    transform: translateX(-100%);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar-close-btn {
    display: block;
  }

  .mobile-top-navbar {
    display: flex;
  }

  .bottom-nav {
    display: flex;
  }

  .main-content {
    margin-left: 0;
    padding-top: 60px;
    padding-bottom: 70px;
  }
}

/* ── Modal ────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
  padding: var(--space-4);
}
.modal-card {
  background: #fff; border-radius: var(--radius-xl);
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
  width: 100%; max-width: 420px;
  animation: modalIn 0.2s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1)  translateY(0);      }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gray-100);
}
.modal-header h3 { font-size: var(--text-lg); font-weight: 700; color: var(--gray-800); }
.btn-close-modal {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 8px;
  background: transparent; color: var(--gray-400);
  cursor: pointer; transition: all 0.15s;
}
.btn-close-modal:hover { background: var(--gray-100); color: var(--gray-700); }

.modal-body {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: var(--space-4);
}
.input-group { display: flex; flex-direction: column; gap: var(--space-2); }
.input-group label { font-size: var(--text-sm); font-weight: 500; color: var(--gray-700); }
.input-group input {
  padding: 10px 14px;
  border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-family: var(--font-family);
  color: var(--gray-800); background: var(--gray-50);
  outline: none; transition: all var(--transition-fast);
}
.input-group input:focus {
  border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: #fff;
}

.modal-msg {
  padding: 10px 14px; border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 500;
}
.modal-msg--err { background: var(--danger-light); color: var(--danger); }
.modal-msg--ok  { background: var(--success-light); color: var(--success-dark); }

.modal-footer {
  display: flex; justify-content: flex-end; gap: var(--space-3);
  padding: 16px 24px; border-top: 1px solid var(--gray-100);
}
.btn-cancelar {
  padding: 9px 20px;
  border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  background: transparent; color: var(--gray-600);
  font-size: var(--text-sm); font-weight: 500;
  font-family: var(--font-family); cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-cancelar:hover { background: var(--gray-100); }
.btn-guardar {
  padding: 9px 20px;
  background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600;
  font-family: var(--font-family); cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-guardar:hover:not(:disabled) { background: var(--primary-dark); }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
