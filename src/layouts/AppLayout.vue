<template>
  <div
    class="app-layout"
    :class="{
      'is-mobile-view': isMobileView,
      'is-tablet-view': isTabletView,
      'is-compact-desktop': isCompactDesktop,
      'sidebar-open': sidebarOpen
    }"
  >
    <template v-if="isMobileView">
      <header class="mobile-top-navbar">
        <div class="top-navbar-left">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </div>
        <h1 class="top-navbar-title">{{ currentRole === 'admin' ? 'Admin' : 'Cajero' }}</h1>
        <div class="top-navbar-right">
          <div class="mobile-user-avatar" @click="showUserMenu = true">
            {{ userInitial }}
          </div>
        </div>
      </header>

      <div v-if="showUserMenu && isMobileView" class="mobile-menu-overlay" @click="showUserMenu = false">
        <div class="mobile-dropdown" @click.stop>
          <div class="m-drop-header">
            <strong>{{ currentUsername }}</strong>
            <span>{{ currentRoleLabel }}</span>
          </div>
          <button class="m-drop-btn" @click="abrirCambiarPass(); showUserMenu = false">Cambiar Contraseña</button>
          <button class="m-drop-btn text-danger" @click="logout(); showUserMenu = false">Cerrar Sesión</button>
        </div>
      </div>

      <nav class="bottom-nav">
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

      <main class="main-content main-content--mobile">
        <slot />
      </main>
    </template>

    <template v-else>
      <div class="desktop-shell">
        <div class="desktop-frame">
          <div class="desktop-chrome">
            <div class="chrome-traffic">
              <span class="chrome-dot chrome-dot--red"></span>
              <span class="chrome-dot chrome-dot--amber"></span>
              <span class="chrome-dot chrome-dot--green"></span>
            </div>
            <div class="chrome-address">{{ brandName }} / {{ desktopRouteMeta.label }}</div>
            <div class="chrome-date">{{ desktopDateLabel }}</div>
          </div>

          <div class="desktop-body">
            <div v-if="isTabletView && sidebarOpen" class="desktop-sidebar-scrim" @click="sidebarOpen = false"></div>

            <aside class="sidebar">
              <div class="sidebar-brand">
                <div class="brand-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                  </svg>
                </div>
                <div class="brand-copy">
                  <strong>{{ brandName }}</strong>
                  <span>Panel de escritorio</span>
                </div>
              </div>

              <div class="sidebar-profile">
                <div class="sidebar-profile__avatar">{{ userInitial }}</div>
                <div class="sidebar-profile__info">
                  <strong>{{ currentUsername || 'Usuario' }}</strong>
                  <span>{{ currentRoleLabel }}</span>
                </div>
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

              <div class="sidebar-note">
                <span class="sidebar-note__label">Vista actual</span>
                <strong>{{ desktopRouteMeta.label }}</strong>
                <p>{{ desktopRouteMeta.description }}</p>
              </div>

              <div class="sidebar-footer">
                <button class="sidebar-secondary-btn" @click="abrirCambiarPass">Cambiar contraseña</button>
                <button class="logout-btn" @click="logout">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                  </svg>
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </aside>

            <section class="desktop-stage">
              <header class="desktop-toolbar">
                <div class="desktop-toolbar__copy">
                  <span class="desktop-toolbar__eyebrow">{{ currentRoleLabel }}</span>
                  <h1>{{ desktopRouteMeta.label }}</h1>
                  <p>{{ desktopRouteMeta.helper }}</p>
                </div>

                <div class="desktop-toolbar__actions">
                  <button v-if="isTabletView" class="desktop-nav-toggle" @click="toggleSidebar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                    <span>{{ sidebarOpen ? 'Cerrar menú' : 'Abrir menú' }}</span>
                  </button>
                  <span class="desktop-chip">Panel local</span>
                  <span class="desktop-chip desktop-chip--accent">{{ brandName }}</span>
                  <div class="desktop-user-pill">
                    <div class="desktop-user-pill__avatar">{{ userInitial }}</div>
                    <div class="desktop-user-pill__meta">
                      <strong>{{ currentUsername || 'Usuario' }}</strong>
                      <span>{{ currentRoleLabel }}</span>
                    </div>
                  </div>
                </div>
              </header>

              <main class="main-content main-content--desktop">
                <slot />
              </main>
            </section>
          </div>
        </div>
      </div>
    </template>
  </div>

  <Teleport to="body">
    <div v-if="modalPass" class="modal-overlay" @click.self="modalPass = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Cambiar contraseña</h3>
          <button class="btn-close-modal" @click="modalPass = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Capacitor } from '@capacitor/core'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)
const showUserMenu = ref(false)
const sidebarOpen = ref(false)

const currentRole = computed(() => auth.role)
const currentUsername = computed(() => auth.username)
const currentRoleLabel = computed(() => currentRole.value === 'admin' ? 'Administrador' : 'Cajero')
const userInitial = computed(() => currentUsername.value ? currentUsername.value.charAt(0).toUpperCase() : 'U')
const brandName = computed(() => Capacitor.getPlatform() !== 'web' ? 'Gudi' : 'Surtiprais')

const routeMetaMap = {
  dashboard: {
    label: 'Dashboard',
    description: 'Resumen general del negocio y accesos rápidos para la operación diaria.',
    helper: 'Supervisa ventas, inventario y movimientos clave desde una sola estructura de escritorio.'
  },
  ventas: {
    label: 'Punto de venta',
    description: 'Flujo de cobro con ticket fijo, catálogo y acciones rápidas para mostrador.',
    helper: 'Busca productos, arma el ticket y cobra sin salir de una sola pantalla.'
  },
  polleria: {
    label: 'Pollería',
    description: 'Cobro de pollo separado.',
    helper: 'Selecciona las piezas o pollo entero para venta.'
  },
  historial: {
    label: 'Historial de ventas',
    description: 'Consulta tickets recientes, detalles por venta y movimientos registrados.',
    helper: 'Revisa operaciones pasadas y resuelve incidencias desde una vista más limpia.'
  },
  corte: {
    label: 'Corte de caja',
    description: 'Control del cierre diario y persistencia del resumen de caja.',
    helper: 'Concentra los totales del día y guarda el corte con mejor jerarquía visual.'
  },
  productos: {
    label: 'Productos',
    description: 'Catálogo, alta y edición de productos desde el panel administrativo.',
    helper: 'Organiza tu catálogo con formularios y tablas más legibles para escritorio.'
  },
  inventario: {
    label: 'Inventario',
    description: 'Seguimiento del stock y visualización de alertas por producto.',
    helper: 'Mantén a la vista existencias críticas y movimientos de inventario.'
  },
  usuarios: {
    label: 'Usuarios',
    description: 'Administración de accesos, permisos y personal del sistema.',
    helper: 'Controla los perfiles que operan el sistema desde una vista ordenada.'
  },
  'base-datos': {
    label: 'Base de datos',
    description: 'Herramientas para respaldo, revisión y mantenimiento de la información.',
    helper: 'Centraliza las tareas de respaldo y soporte con una navegación consistente.'
  }
}

const desktopRouteMeta = computed(() => {
  return routeMetaMap[route.name] || {
    label: 'Panel',
    description: 'Vista del sistema.',
    helper: 'Navega por el sistema con una estructura orientada a escritorio.'
  }
})

const desktopDateLabel = computed(() => {
  const formatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

const isMobileView = computed(() => {
  return windowWidth.value <= 820 || windowHeight.value <= 520
})

const isTabletView = computed(() => !isMobileView.value && windowWidth.value <= 1180)
const isCompactDesktop = computed(() => !isMobileView.value && windowWidth.value <= 1440)

function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => route.fullPath, () => {
  sidebarOpen.value = false
})

watch(isTabletView, (tabletActive) => {
  if (!tabletActive) {
    sidebarOpen.value = false
  }
})

const mobileMenuItems = computed(() => {
  if (currentRole.value === 'admin') {
    return [
      { to: '/dashboard', label: 'Inicio', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
      { to: '/polleria', label: 'Venta de pollo', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
      { to: '/historial', label: 'Historial', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
      { to: '/corte', label: 'Corte', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12A10 10 0 0015 21v-9z"/><path d="M12 2A10 10 0 0012 22"/><path d="M15 3A10 10 0 0115 21"/></svg>' },
      { to: '/productos', label: 'Productos', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/></svg>' },
      { to: '/inventario', label: 'Inventario', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>' },
      { to: '/usuarios', label: 'Usuarios', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
      { to: '/base-datos', label: 'Datos', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>' },
    ]
  }

  return [
    { to: '/ventas', label: 'Hacer Venta', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
    { to: '/polleria', label: 'Venta de pollo', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
    { to: '/historial', label: 'Historial de Venta', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
  ]
})

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
    to: '/polleria', label: 'Venta de pollo', roles: ['admin', 'cajero'],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
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

const menu = computed(() => menuCompleto.filter(item => item.roles.includes(auth.role)))

function logout() {
  auth.logout()
  router.push('/')
}

const modalPass = ref(false)
const savingPass = ref(false)
const passMsg = ref('')
const passMsgOk = ref(false)
const passForm = ref({ actual: '', nueva: '', confirmar: '' })

function abrirCambiarPass() {
  passForm.value = { actual: '', nueva: '', confirmar: '' }
  passMsg.value = ''
  passMsgOk.value = false
  modalPass.value = true
}

async function cambiarPassword() {
  passMsg.value = ''
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
    passMsg.value = 'Contraseña actualizada correctamente.'
    passForm.value = { actual: '', nueva: '', confirmar: '' }
    setTimeout(() => { modalPass.value = false }, 1500)
  } else {
    passMsg.value = result.error
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  --layout-shell-padding: 24px;
}

.desktop-shell {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  padding: var(--layout-shell-padding);
  overflow: hidden;
}

.desktop-frame {
  height: calc(100vh - var(--layout-shell-padding) - var(--layout-shell-padding));
  height: calc(100dvh - var(--layout-shell-padding) - var(--layout-shell-padding));
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface-soft);
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 32px;
  overflow: hidden;
  backdrop-filter: blur(22px);
  box-shadow: var(--shadow-xl);
}

.desktop-chrome {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 0 22px;
  height: 64px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(240, 245, 252, 0.78));
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.chrome-traffic {
  display: flex;
  gap: 8px;
}

.chrome-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35);
}

.chrome-dot--red { background: #fb7185; }
.chrome-dot--amber { background: #fbbf24; }
.chrome-dot--green { background: #4ade80; }

.chrome-address {
  justify-self: center;
  min-width: 320px;
  padding: 10px 18px;
  text-align: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-weight: 700;
}

.chrome-date {
  color: var(--gray-500);
  font-size: var(--text-sm);
  font-weight: 700;
}

.desktop-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  position: relative;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 0;
  padding: 24px 18px 18px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 8px 10px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 18px 30px rgba(37, 99, 235, 0.32);
  flex-shrink: 0;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-copy strong {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
}

.brand-copy span {
  color: rgba(226, 232, 240, 0.72);
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-profile__avatar,
.desktop-user-pill__avatar,
.mobile-user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #2563eb);
}

.sidebar-profile__avatar,
.desktop-user-pill__avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.sidebar-profile__info,
.desktop-user-pill__meta {
  display: flex;
  flex-direction: column;
}

.sidebar-profile__info strong,
.desktop-user-pill__meta strong {
  font-size: var(--text-sm);
  font-weight: 800;
}

.sidebar-profile__info strong {
  color: #fff;
}

.sidebar-profile__info span {
  color: rgba(226, 232, 240, 0.72);
  font-size: var(--text-xs);
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid transparent;
  color: var(--sidebar-text);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}

.nav-item--active {
  color: #fff;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.34), rgba(37, 99, 235, 0.12));
  border-color: rgba(147, 197, 253, 0.24);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 11px;
  bottom: 11px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #bfdbfe, #3b82f6);
}

.nav-icon {
  width: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  font-weight: 700;
  font-size: var(--text-sm);
}

.sidebar-note {
  padding: 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-note__label {
  display: inline-flex;
  margin-bottom: 8px;
  color: rgba(191, 219, 254, 0.92);
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-note strong {
  display: block;
  color: #fff;
  font-size: var(--text-lg);
  font-weight: 800;
  margin-bottom: 6px;
}

.sidebar-note p {
  color: rgba(226, 232, 240, 0.74);
  font-size: var(--text-sm);
  line-height: 1.55;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-secondary-btn,
.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.sidebar-secondary-btn {
  border: 1px solid rgba(191, 219, 254, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: #dbeafe;
}

.sidebar-secondary-btn:hover,
.logout-btn:hover {
  transform: translateY(-1px);
}

.logout-btn {
  border: none;
  background: #fff;
  color: #132744;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
}

.desktop-stage {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(250, 252, 255, 0.52), rgba(244, 247, 251, 0.96));
  overflow: hidden;
}

.desktop-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 30px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.desktop-toolbar__copy {
  max-width: 720px;
}

.desktop-toolbar__eyebrow {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--primary-ink);
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.desktop-toolbar__copy h1 {
  margin: 10px 0 8px;
  font-size: 2.15rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.desktop-toolbar__copy p {
  color: var(--gray-500);
  font-size: 1rem;
  line-height: 1.6;
}

.desktop-toolbar__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.desktop-nav-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(37, 99, 235, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--primary-ink);
  font-size: var(--text-sm);
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.desktop-chip {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: var(--gray-600);
  font-size: var(--text-sm);
  font-weight: 700;
}

.desktop-chip--accent {
  background: rgba(37, 99, 235, 0.08);
  color: var(--primary-ink);
}

.desktop-user-pill {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.desktop-user-pill__meta strong {
  color: var(--gray-900);
}

.desktop-user-pill__meta span {
  color: var(--gray-500);
  font-size: var(--text-xs);
  font-weight: 600;
}

.desktop-sidebar-scrim {
  position: absolute;
  inset: 0;
  z-index: 12;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(2px);
}

.main-content {
  flex: 1;
  min-width: 0;
}

.main-content--desktop {
  min-height: 0;
  overflow-y: auto;
}

.main-content--mobile {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--content-bg);
  padding-top: var(--mobile-header-height);
  padding-bottom: var(--mobile-nav-height);
}

.mobile-top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-height: var(--mobile-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--safe-area-top) calc(20px + var(--safe-area-right)) 0 calc(20px + var(--safe-area-left));
  background: #132744;
  color: #fff;
  border-bottom: 2px solid var(--primary);
  z-index: 1000;
}

.top-navbar-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.mobile-user-avatar {
  width: 32px;
  height: 32px;
  font-size: 0.8rem;
  cursor: pointer;
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  justify-content: flex-end;
  padding-top: calc(var(--mobile-header-height) + 8px);
  padding-right: calc(15px + var(--safe-area-right));
}

.mobile-dropdown {
  width: 220px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: popIn 0.2s ease;
}

.m-drop-header {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.m-drop-header strong {
  color: #0f172a;
  font-size: 1rem;
}

.m-drop-header span {
  margin-top: 2px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.m-drop-btn {
  padding: 15px;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: left;
}

.m-drop-btn.text-danger {
  color: #ef4444;
  border-bottom: none;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
  min-height: var(--mobile-nav-height);
  padding: 0 calc(10px + var(--safe-area-right)) var(--safe-area-bottom) calc(10px + var(--safe-area-left));
  background: #fff;
  color: var(--gray-600);
  overflow-x: auto;
  white-space: nowrap;
  border-top: 1px solid var(--gray-200);
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  z-index: 1000;
}

.bottom-nav::-webkit-scrollbar {
  display: none;
}

.bottom-nav-item {
  flex: 0 0 auto;
  min-width: 75px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: inherit;
  text-decoration: none;
  font-size: 0.7rem;
  font-weight: 600;
}

.bottom-nav-item--active {
  color: var(--primary);
}

.bottom-nav-icon {
  display: flex;
  color: inherit;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gray-100);
}

.modal-header h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--gray-800);
}

.btn-close-modal {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-close-modal:hover {
  background: var(--gray-100);
  color: var(--gray-700);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 20px 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-group label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-700);
}

.input-group input {
  padding: 10px 14px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--gray-800);
  background: var(--gray-50);
  outline: none;
  transition: all var(--transition-fast);
}

.input-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

.modal-msg {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
}

.modal-msg--err {
  background: var(--danger-light);
  color: var(--danger);
}

.modal-msg--ok {
  background: var(--success-light);
  color: var(--success-dark);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: 16px 24px;
  border-top: 1px solid var(--gray-100);
}

.btn-cancelar,
.btn-guardar {
  padding: 9px 20px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancelar {
  border: 1px solid var(--gray-300);
  background: transparent;
  color: var(--gray-600);
}

.btn-cancelar:hover {
  background: var(--gray-100);
}

.btn-guardar {
  border: none;
  background: var(--primary);
  color: #fff;
}

.btn-guardar:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-guardar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1440px) {
  .app-layout {
    --layout-shell-padding: 18px;
  }

  .app-layout.is-compact-desktop .desktop-body {
    grid-template-columns: 248px minmax(0, 1fr);
  }

  .app-layout.is-compact-desktop .desktop-chrome {
    padding: 0 18px;
  }

  .app-layout.is-compact-desktop .sidebar {
    padding: 20px 14px 16px;
  }

  .app-layout.is-compact-desktop .desktop-toolbar {
    padding: 24px 24px 18px;
  }

  .app-layout.is-compact-desktop .desktop-toolbar__copy h1 {
    font-size: 1.9rem;
  }

  .app-layout.is-compact-desktop .sidebar-note {
    padding: 14px;
  }
}

@media (max-width: 1180px) {
  .app-layout {
    --layout-shell-padding: 14px;
  }

  .app-layout.is-tablet-view .desktop-frame {
    height: calc(100vh - var(--layout-shell-padding) - var(--layout-shell-padding));
    height: calc(100dvh - var(--layout-shell-padding) - var(--layout-shell-padding));
    min-height: 0;
    border-radius: 24px;
  }

  .app-layout.is-tablet-view .desktop-chrome {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px;
    padding: 0 16px;
    height: auto;
    min-height: 58px;
  }

  .app-layout.is-tablet-view .chrome-address {
    min-width: 0;
    justify-self: stretch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-layout.is-tablet-view .chrome-date {
    display: none;
  }

  .app-layout.is-tablet-view .desktop-body {
    display: block;
  }

  .app-layout.is-tablet-view .sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(320px, 88vw);
    z-index: 20;
    transform: translateX(-108%);
    transition: transform 0.22s ease;
    box-shadow: 0 22px 50px rgba(15, 23, 42, 0.24);
  }

  .app-layout.is-tablet-view.sidebar-open .sidebar {
    transform: translateX(0);
  }

  .app-layout.is-tablet-view .desktop-toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 22px 20px 16px;
  }

  .app-layout.is-tablet-view .desktop-toolbar__copy {
    max-width: none;
  }

  .app-layout.is-tablet-view .desktop-toolbar__copy h1 {
    font-size: 1.85rem;
  }

  .app-layout.is-tablet-view .desktop-toolbar__actions {
    justify-content: flex-start;
  }
}

@media (max-height: 760px) and (min-width: 821px) {
  .app-layout {
    --layout-shell-padding: 12px;
  }

  .desktop-chrome {
    height: 52px;
  }

  .desktop-toolbar {
    padding: 18px 22px 14px;
  }

  .desktop-toolbar__copy h1 {
    margin: 6px 0 4px;
    font-size: 1.65rem;
  }

  .desktop-toolbar__copy p {
    font-size: var(--text-sm);
  }

  .sidebar {
    gap: 12px;
    padding: 16px 14px;
  }

  .sidebar-note {
    display: none;
  }
}

@media (max-width: 820px) {
  .modal-card {
    max-width: 100%;
    border-radius: 24px 24px 0 0;
    align-self: flex-end;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0 var(--safe-area-right) var(--safe-area-bottom) var(--safe-area-left);
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-guardar {
    width: 100%;
  }
}
</style>
