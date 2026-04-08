<template>
  <AppLayout>
    <div class="dashboard-container" :class="{ 'is-mobile-ui': isMobileView }">
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

        <div class="m-stats-header mobile-extra-header">
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

      <div v-else class="desktop-dashboard">
        <section class="dashboard-hero">
          <div class="dashboard-hero__copy">
            <span class="dashboard-kicker">Centro de control</span>
            <h1>Resumen operativo del día</h1>
            <p>La vista web de escritorio ahora concentra ventas, alertas e ingresos rápidos sin movernos de pantalla.</p>
          </div>
          <div class="dashboard-hero__aside">
            <span class="dashboard-hero__label">Sesión activa</span>
            <strong>{{ currentUsername || 'Administrador' }}</strong>
            <small>{{ todayLabel }}</small>
          </div>
        </section>

        <section class="dashboard-metrics">
          <article class="metric-card metric-card--emerald">
            <span class="metric-card__label">Ventas del día</span>
            <strong>${{ ventasHoy.toFixed(2) }}</strong>
            <small>{{ transacciones }} tickets registrados</small>
          </article>
          <article class="metric-card metric-card--blue">
            <span class="metric-card__label">Ticket promedio</span>
            <strong>${{ ticketPromedio.toFixed(2) }}</strong>
            <small>Promedio por compra</small>
          </article>
          <article class="metric-card metric-card--amber">
            <span class="metric-card__label">Catálogo activo</span>
            <strong>{{ productosTotales }}</strong>
            <small>{{ productosPieza }} por pieza y {{ productosPeso }} por peso</small>
          </article>
          <article class="metric-card metric-card--rose">
            <span class="metric-card__label">Alertas de stock</span>
            <strong>{{ bajosStock }}</strong>
            <small>Productos a revisar hoy</small>
          </article>
        </section>

        <section class="dashboard-grid dashboard-grid--single">
          <article class="dashboard-panel dashboard-panel--wide">
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Movimiento</span>
                <h2>Lectura rápida del turno</h2>
              </div>
              <span class="panel-chip">Actualizado</span>
            </div>

            <div class="overview-grid">
              <div class="overview-card">
                <span>Efectivo</span>
                <strong>${{ ventasEfectivo.toFixed(2) }}</strong>
                <small>Cobros cerrados en caja</small>
              </div>
              <div class="overview-card">
                <span>Tarjeta</span>
                <strong>${{ ventasTarjeta.toFixed(2) }}</strong>
                <small>Pagos no efectivos</small>
              </div>
              <div class="overview-card">
                <span>Inventario saludable</span>
                <strong>{{ stockSaludable }}</strong>
                <small>Productos sin alertas</small>
              </div>
            </div>
          </article>

          <article class="dashboard-panel dashboard-panel--actions">
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Accesos</span>
                <h2>Atajos administrativos</h2>
              </div>
            </div>
          </article>
        </section>

        <section class="dashboard-grid dashboard-grid--single">
          <article class="dashboard-panel">
            <div class="panel-head">
              <div>
                <span class="panel-kicker">Catálogo</span>
                <h2>Estado del inventario</h2>
              </div>
            </div>

            <div class="catalog-overview">
              <div class="catalog-mini">
                <span>Productos por pieza</span>
                <strong>{{ productosPieza }}</strong>
              </div>
              <div class="catalog-mini">
                <span>Productos por peso</span>
                <strong>{{ productosPeso }}</strong>
              </div>
              <div class="catalog-mini">
                <span>Stock saludable</span>
                <strong>{{ stockSaludable }}</strong>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import { useVentasStore } from '../stores/ventas'
import { useProductosStore } from '../stores/productos'

const auth = useAuthStore()
const ventasStore = useVentasStore()
const productosStore = useProductosStore()

const currentUsername = computed(() => auth.username)
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

const isMobileView = computed(() => {
  const isSmallScreen = windowWidth.value <= 820
  const isCompactHeight = windowHeight.value <= 520
  return isSmallScreen || isCompactHeight
})

function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const ventasHoy = computed(() => ventasStore.ventas.reduce((sum, venta) => sum + (Number(venta.total) || 0), 0))
const transacciones = computed(() => ventasStore.ventas.length)
const productosTotales = computed(() => productosStore.productos.length)
const bajosStock = computed(() => productosStore.productos.filter(producto => Number(producto.stock) <= 5 && (!producto.unit || producto.unit === 'pza')).length)
const productosPieza = computed(() => productosStore.productos.filter(producto => !producto.unit || producto.unit === 'pza').length)
const productosPeso = computed(() => productosStore.productos.filter(producto => producto.unit === 'kg').length)
const stockSaludable = computed(() => Math.max(productosTotales.value - bajosStock.value, 0))
const ticketPromedio = computed(() => transacciones.value ? ventasHoy.value / transacciones.value : 0)
const ventasEfectivo = computed(() => ventasStore.ventas
  .filter(venta => (venta.method || '').toLowerCase() === 'efectivo')
  .reduce((sum, venta) => sum + (Number(venta.total) || 0), 0))
const ventasTarjeta = computed(() => ventasStore.ventas
  .filter(venta => (venta.method || '').toLowerCase() !== 'efectivo')
  .reduce((sum, venta) => sum + (Number(venta.total) || 0), 0))

const todayLabel = computed(() => {
  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date())
})

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await ventasStore.cargarVentas()
  await productosStore.cargarProductos()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
.dashboard-container {
  min-height: 100%;
}

.dashboard-container,
.dashboard-container * {
  box-sizing: border-box;
}

.desktop-dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 28px;
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 18px;
}

.dashboard-hero__copy,
.dashboard-hero__aside,
.metric-card,
.dashboard-panel {
  display: block;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.dashboard-hero__copy {
  padding: 28px;
}

.dashboard-kicker,
.panel-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  color: var(--primary-ink);
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-hero__copy h1 {
  margin-bottom: 10px;
  font-size: 2.1rem;
  letter-spacing: -0.05em;
}

.dashboard-hero__copy p {
  max-width: 620px;
  color: var(--gray-500);
  font-size: 1rem;
  line-height: 1.65;
}

.dashboard-hero__aside {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.94), rgba(37, 99, 235, 0.92));
  color: #fff;
}

.dashboard-hero__label {
  font-size: var(--text-xs);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

.dashboard-hero__aside strong {
  margin: 8px 0 6px;
  font-family: var(--font-display);
  font-size: 1.6rem;
}

.dashboard-hero__aside small {
  font-size: var(--text-sm);
  opacity: 0.86;
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  padding: 22px;
  color: #fff;
}

.metric-card strong {
  display: block;
  margin: 10px 0 8px;
  font-family: var(--font-display);
  font-size: 2rem;
}

.metric-card small,
.metric-card__label {
  display: block;
  opacity: 0.9;
}

.metric-card__label {
  font-size: var(--text-sm);
  font-weight: 700;
}

.metric-card small {
  font-size: var(--text-xs);
}

.metric-card--emerald { background: linear-gradient(135deg, #16a34a, #15803d); }
.metric-card--blue { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.metric-card--amber { background: linear-gradient(135deg, #f59e0b, #d97706); }
.metric-card--rose { background: linear-gradient(135deg, #ef4444, #dc2626); }

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.dashboard-grid--single {
  grid-template-columns: 1fr;
}

.dashboard-grid--secondary {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.dashboard-panel {
  padding: 22px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-head h2 {
  font-size: 1.25rem;
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--primary-ink);
  font-size: var(--text-xs);
  font-weight: 800;
}

.panel-chip--warning {
  background: var(--accent-light);
  color: #92400e;
}

.overview-grid,
.catalog-overview {
  display: grid;
  gap: 14px;
}

.overview-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.overview-card,
.catalog-mini {
  padding: 18px;
  border-radius: 20px;
  background: var(--surface-muted);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.overview-card span,
.catalog-mini span {
  display: block;
  color: var(--gray-500);
  font-size: var(--text-sm);
  font-weight: 700;
}

.overview-card strong,
.catalog-mini strong {
  display: block;
  margin: 8px 0 6px;
  font-family: var(--font-display);
  font-size: 1.65rem;
  color: var(--gray-900);
}

.overview-card small {
  color: var(--gray-500);
  font-size: var(--text-xs);
}

.action-stack,
.list-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 20px;
  text-decoration: none;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: var(--surface-muted);
  color: var(--gray-800);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
}

.action-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-card strong {
  display: block;
  color: var(--gray-900);
  font-size: var(--text-sm);
}

.action-card small {
  color: var(--gray-500);
  font-size: var(--text-xs);
}

.action-card--blue .action-card__icon {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
}

.action-card--teal .action-card__icon {
  background: rgba(15, 118, 110, 0.1);
  color: var(--teal);
}

.action-card--amber .action-card__icon {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.action-card--slate .action-card__icon {
  background: rgba(51, 65, 85, 0.08);
  color: #334155;
}

.list-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--surface-muted);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.list-row__copy strong {
  display: block;
  color: var(--gray-900);
  font-size: var(--text-sm);
}

.list-row__copy span {
  color: var(--gray-500);
  font-size: var(--text-xs);
}

.list-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 800;
  white-space: nowrap;
}

.list-pill--danger {
  background: var(--danger-light);
  color: var(--danger);
}

.list-pill--success {
  background: var(--success-light);
  color: var(--success-dark);
}

.panel-empty {
  padding: 18px;
  border-radius: 20px;
  background: var(--surface-muted);
  color: var(--gray-500);
  font-size: var(--text-sm);
  border: 1px dashed rgba(148, 163, 184, 0.22);
}

.mobile-dashboard {
  padding: 20px;
  background: #f8fafc;
  min-height: 100%;
  overflow-y: auto;
  padding-bottom: 24px;
}

.m-stats-header {
  text-align: center;
  margin-bottom: 20px;
}

.mobile-extra-header {
  margin-top: 10px;
}

.m-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.m-subtitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: #475569;
}

.m-divider {
  height: 1px;
  width: 60%;
  margin: 10px auto 0;
  background: #cbd5e1;
}

.m-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.m-stat-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px;
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.m-stat-card--green { background: #65a30d; }
.m-stat-card--blue { background: #2563eb; }
.m-stat-card--orange { background: #f59e0b; }
.m-stat-card--red { background: #dc2626; }

.m-stat-label {
  margin-bottom: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
}

.m-stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

.m-stat-value small {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
}

.m-stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.m-bottom-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.m-info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 10px;
  text-align: center;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.m-info-icon {
  font-size: 1.5rem;
}

.m-info-texts {
  display: flex;
  flex-direction: column;
}

.m-info-texts strong {
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 700;
}

.m-info-texts span {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
}

@media (max-width: 1400px) {
  .desktop-dashboard {
    padding: 24px;
  }

  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .dashboard-metrics,
  .dashboard-grid--secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .desktop-dashboard {
    padding: 20px;
  }

  .dashboard-metrics,
  .dashboard-grid,
  .dashboard-grid--secondary,
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .desktop-dashboard {
    padding: 18px;
  }

  .dashboard-hero__copy,
  .dashboard-hero__aside,
  .metric-card,
  .dashboard-panel {
    border-radius: 24px;
  }

  .dashboard-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .catalog-overview {
    grid-template-columns: 1fr;
  }

  .panel-head,
  .list-row {
    flex-wrap: wrap;
  }

  .list-pill {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .m-stats-grid,
  .m-bottom-stats {
    grid-template-columns: 1fr;
  }
}
</style>
