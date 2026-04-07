<template>
  <AppLayout>
    <div class="dashboard-container" :class="{ 'is-mobile-ui': isMobileView }">
      
      <!-- ======================================================================
           VISTA MÓVIL (CUADRÍCULA 2x2)
           ====================================================================== -->
      <div v-if="isMobileView" class="mobile-dashboard">
        <div class="m-stats-header">
          <h2 class="m-title">Panel de Administración</h2>
          <div class="m-divider"></div>
        </div>

        <div class="m-stats-grid">
          <div class="m-stat-card m-stat-card--green">
            <span class="m-stat-label">Ventas Hoy</span>
            <span class="m-stat-value">${{ ventasHoy.toFixed(2) }}</span>
          </div>
          <div class="m-stat-card m-stat-card--blue">
            <span class="m-stat-label">Pedidos Hoy</span>
            <div class="m-stat-row">
              <span class="m-stat-value">{{ transacciones }}</span>
            </div>
          </div>
          <div class="m-stat-card m-stat-card--orange">
            <span class="m-stat-label">Inventario Bajo</span>
            <span class="m-stat-value">{{ bajosStock }} <small>Productos</small></span>
          </div>
          <div class="m-stat-card m-stat-card--red">
            <span class="m-stat-label">Cierre de Caja</span>
            <span class="m-stat-value">${{ ventasHoy.toFixed(2) }}</span>
          </div>
        </div>

        <div class="m-stats-header" style="margin-top: 10px;">
          <h3 class="m-subtitle">Resumen General</h3>
          <div class="m-divider"></div>
        </div>

        <div class="m-bottom-stats">
          <div class="m-info-card">
            <div class="m-info-icon icon-orange">📦</div>
            <div class="m-info-texts">
              <strong>Productos</strong>
              <span>{{ productosTotales }} en stock</span>
            </div>
          </div>
          <div class="m-info-card">
            <div class="m-info-icon icon-orange">👥</div>
            <div class="m-info-texts">
              <strong>Personal</strong>
              <span>Activos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================================
           VISTA ESCRITORIO (ORIGINAL WINDOWS)
           ====================================================================== -->
      <div v-else class="desktop-dashboard">
        <div class="pc-header">
          <h1>Dashboard Administrativo</h1>
          <p>Resumen general del negocio</p>
        </div>

        <div class="pc-stats-grid">
          <div class="pc-stat-card">
            <div class="pc-stat-icon icon-blue">💵</div>
            <div class="pc-stat-info">
              <span class="pc-label">Ventas totales</span>
              <span class="pc-value">${{ ventasHoy.toFixed(2) }}</span>
            </div>
          </div>
          <div class="pc-stat-card">
            <div class="pc-stat-icon icon-green">🎟️</div>
            <div class="pc-stat-info">
              <span class="pc-label">Tickets generados</span>
              <span class="pc-value">{{ transacciones }}</span>
            </div>
          </div>
          <div class="pc-stat-card">
            <div class="pc-stat-icon icon-purple">📦</div>
            <div class="pc-stat-info">
              <span class="pc-label">Productos totales</span>
              <span class="pc-value">{{ productosTotales }}</span>
            </div>
          </div>
          <div class="pc-stat-card">
            <div class="pc-stat-icon icon-orange">⚠️</div>
            <div class="pc-stat-info">
              <span class="pc-label">Stock bajo</span>
              <span class="pc-value">{{ bajosStock }}</span>
            </div>
          </div>
        </div>

        <!-- Acciones PC -->
        <div class="pc-section">
          <h2>Acciones Administrativas</h2>
          <div class="pc-actions-grid">
            <router-link v-for="a in acciones" :key="a.to" :to="a.to" class="pc-action-btn" :style="{ background: a.color }">
              <div class="pc-action-icon" v-html="a.icon"></div>
              <span class="pc-action-label">{{ a.label }}</span>
            </router-link>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import { useVentasStore } from '../stores/ventas'
import { useProductosStore } from '../stores/productos'
import { Capacitor } from '@capacitor/core'

const auth = useAuthStore()
const ventasStore = useVentasStore()
const productosStore = useProductosStore()

const currentUsername = computed(() => auth.username)
const windowWidth = ref(window.innerWidth)
const isMobileView = computed(() => {
  const isSmallScreen = windowWidth.value <= 1024
  const isNativeApp   = Capacitor.getPlatform() !== 'web'
  return isSmallScreen || isNativeApp
})

window.addEventListener('resize', () => windowWidth.value = window.innerWidth)

// -- DATA --
const ventasHoy = computed(() => ventasStore.ventas.reduce((sum, v) => sum + (Number(v.total) || 0), 0))
const transacciones = computed(() => ventasStore.ventas.length)
const productosTotales = computed(() => productosStore.productos.length)
const bajosStock = computed(() => productosStore.productos.filter(p => p.stock <= 5).length)

const acciones = [
  { label: 'Registrar Venta', to: '/ventas', color: '#3b82f6', icon: '🛒' },
  { label: 'Administrar Inventario', to: '/inventario', color: '#8b5cf6', icon: '📦' },
  { label: 'Ver Historial', to: '/historial', color: '#10b981', icon: '📜' },
  { label: 'Configurar Usuarios', to: '/usuarios', color: '#f59e0b', icon: '⚙️' }
]

onMounted(async () => {
  await ventasStore.cargarVentas()
  await productosStore.cargarProductos()
})
</script>

<style scoped>
.dashboard-container { height: 100vh; overflow-y: auto; background: #f8fafc; }

/* PC VERSION */
.desktop-dashboard { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.pc-header { margin-bottom: 2rem; }
.pc-header h1 { font-size: 2rem; font-weight: 800; color: #1e293b; }
.pc-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
.pc-stat-card { background: #fff; padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; border: 1px solid #e2e8f0; }
.pc-stat-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.pc-label { font-size: 0.875rem; color: #64748b; font-weight: 600; display: block; }
.pc-value { font-size: 1.5rem; font-weight: 700; color: #0f172a; }

.pc-section h2 { margin-bottom: 1.5rem; font-size: 1.25rem; }
.pc-actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.pc-action-btn { padding: 2rem; border-radius: 16px; color: #fff; text-decoration: none; text-align: center; transition: transform 0.2s; }
.pc-action-btn:hover { transform: translateY(-5px); filter: brightness(1.1); }
.pc-action-icon { font-size: 2rem; margin-bottom: 0.5rem; }

/* MOBILE VERSION */
.mobile-dashboard { padding: 20px; background: #f8fafc; height: 100%; overflow-y: auto; padding-bottom: 90px; }
.m-stats-header { text-align: center; margin-bottom: 20px; }
.m-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.m-subtitle { font-size: 1.1rem; font-weight: 700; color: #475569; }
.m-divider { height: 1px; background: #cbd5e1; width: 60%; margin: 10px auto 0; }

.m-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
.m-stat-card { padding: 15px; border-radius: 12px; color: #fff; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.m-stat-card--green { background: #65a30d; } /* Matches image closer */
.m-stat-card--blue { background: #2563eb; }
.m-stat-card--orange { background: #f59e0b; }
.m-stat-card--red { background: #dc2626; }
.m-stat-label { font-size: 0.8rem; font-weight: 600; opacity: 0.9; margin-bottom: 5px; }
.m-stat-value { font-size: 1.4rem; font-weight: 800; line-height: 1; }
.m-stat-value small { font-size: 0.8rem; font-weight: 600; opacity: 0.9; }
.m-stat-row { display: flex; align-items: center; justify-content: space-between; }

.m-bottom-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.m-info-card { background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.m-info-icon { font-size: 1.5rem; }
.m-info-texts { display: flex; flex-direction: column; }
.m-info-texts strong { color: #1e293b; font-size: 0.95rem; font-weight: 700; }
.m-info-texts span { color: #64748b; font-size: 0.8rem; font-weight: 500; }
.m-stat-label { font-size: 0.8rem; font-weight: 600; opacity: 0.9; }
.m-stat-value { font-size: 1.5rem; font-weight: 800; }

.m-actions-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.m-action-btn { background: #f1f5f9; padding: 1.25rem; border-radius: 16px; text-decoration: none; color: #1e293b; font-weight: 700; text-align: center; }
</style>
