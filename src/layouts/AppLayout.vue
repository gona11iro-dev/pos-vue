<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <span class="brand-name">Surtiprais</span>
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
        <!-- Pill de usuario -->
        <div class="user-pill">
          <div class="user-avatar-sm">{{ currentUsername.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <span class="user-display">{{ currentUsername }}</span>
            <span class="user-role-badge">{{ currentRole === 'admin' ? 'Administrador' : 'Cajero' }}</span>
          </div>
        </div>

        <!-- Cambiar contraseña (solo cajero) -->
        <button v-if="currentRole === 'cajero'" class="sidebar-action-btn" @click="abrirCambiarPass">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Cambiar contraseña</span>
        </button>

        <button class="logout-btn" @click="logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesion</span>
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

const router = useRouter()
const auth   = useAuthStore()

const currentRole     = computed(() => auth.role)
const currentUsername = computed(() => auth.username)

// ── Menú ─────────────────────────────────
const menuCompleto = [
  {
    to: '/dashboard', label: 'Corte de Caja', roles: ['admin'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'
  },
  {
    to: '/ventas', label: 'Ventas', roles: ['cajero'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
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
  z-index: 100;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid rgba(255,255,255,0.08);
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

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  display: flex; flex-direction: column;
  gap: var(--space-1);
}
.nav-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  color: var(--sidebar-text);
  font-size: var(--text-sm); font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item--active { background: var(--primary) !important; color: #fff !important; }
.nav-icon {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; flex-shrink: 0;
}

/* Sidebar footer */
.sidebar-footer {
  padding: var(--space-3);
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column; gap: var(--space-2);
}

/* User pill */
.user-pill {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-2);
}
.user-avatar-sm {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; font-weight: 700; font-size: var(--text-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-info { display: flex; flex-direction: column; min-width: 0; }
.user-display {
  font-size: var(--text-sm); font-weight: 600;
  color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-role-badge {
  font-size: 10px; font-weight: 500;
  color: rgba(255,255,255,0.5);
}

/* Sidebar action button */
.sidebar-action-btn {
  display: flex; align-items: center; gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none; border-radius: var(--radius-md);
  background: transparent; color: var(--gray-400);
  font-size: var(--text-sm); font-weight: 500;
  cursor: pointer; transition: all var(--transition-fast);
}
.sidebar-action-btn:hover {
  background: rgba(255,255,255,0.08); color: #fff;
}

.logout-btn {
  display: flex; align-items: center; gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none; border-radius: var(--radius-md);
  background: transparent; color: var(--gray-400);
  font-size: var(--text-sm); font-weight: 500;
  cursor: pointer; transition: all var(--transition-fast);
}
.logout-btn:hover { background: rgba(220,38,38,0.15); color: #fca5a5; }

/* ── Main Content ─────────────────────── */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  background: var(--content-bg);
  min-height: 100vh;
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
