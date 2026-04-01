<template>
  <AppLayout>
    <div class="dashboard">
      <div class="page-header">
        <h1>Corte de Caja (Dashboard)</h1>
        <p class="page-subtitle">Resumen y administración de operaciones diarias</p>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Ventas totales</span>
            <span class="stat-value">${{ ventasHoy.toFixed(2) }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon--green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Transacciones (Tickets)</span>
            <span class="stat-value">{{ transacciones }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon--purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Productos Registrados</span>
            <span class="stat-value">{{ productosTotales }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon stat-icon--orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Stock bajo (Alertas)</span>
            <span class="stat-value">{{ bajosStock }}</span>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <h2>Panel de Corte y Administración</h2>
        <div class="actions-grid">
          
          <!-- CORTE DE CAJA -->
          <button class="action-card action-cut" @click="confirmarCorte">
            <div class="action-icon action-icon--red">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
                <circle cx="12" cy="15" r="2"/>
              </svg>
            </div>
            <span class="action-label">Realizar Corte de Caja</span>
            <span class="action-desc">Cierra transacciones y limpia las ventas de hoy</span>
          </button>

          <button class="action-card" @click="$router.push('/productos')">
            <div class="action-icon action-icon--blue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span class="action-label">Agregar producto</span>
            <span class="action-desc">Registrar nuevo catálogo</span>
          </button>

          <button class="action-card" @click="$router.push('/inventario')">
            <div class="action-icon action-icon--purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <span class="action-label">Inventario</span>
            <span class="action-desc">Ajustar stock de productos</span>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'
import { exportToCsv } from '../utils/export'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()

// Métricas Dinámicas
const ventasHoy = computed(() => {
  return ventasStore.ventas.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
})

const transacciones = computed(() => ventasStore.ventas.length)

const productosTotales = computed(() => productosStore.totalProductos)

const bajosStock = computed(() => {
  return productosStore.productos.filter(p => Number(p.stock) <= 10).length
})

async function confirmarCorte() {
  if (transacciones.value === 0) {
    alert("No hay ventas registradas para hacer corte hoy.")
    return
  }
  
  const ok = confirm(`¿Estás seguro de realizar el corte de caja por $${ventasHoy.value.toFixed(2)} acumulados? Esto descargará tu reporte de ventas en tu computadora y vaciará las transacciones actuales y preparará el sistema para un nuevo turno.`)
  if (ok) {
    const reportData = ventasStore.ventas.map(v => {
      // Concatenar todos los artículos vendidos en esa transacción
      const detalle = v.items ? v.items.map(i => `${i.qty}x ${i.name}`).join(' | ') : ''
      
      return {
        folio: v.id,
        fecha: new Date(v.date).toLocaleString(),
        cliente: v.client || 'Publico Gral.',
        metodo: v.method,
        total: (v.total || 0).toFixed(2),
        pagoCon: (v.paidAmount || 0).toFixed(2),
        cambio: (v.change || 0).toFixed(2),
        articulos: detalle
      }
    })

    const columns = ['folio', 'fecha', 'cliente', 'metodo', 'total', 'pagoCon', 'cambio', 'articulos']
    const headers = ['Folio de Venta', 'Fecha Hora', 'Cliente', 'Modo de Pago', 'Total Recaudado ($)', 'Monto Ingresado', 'Cambio Devuelto', 'Articulos Vendidos']
    
    const fechaLog = new Date().toISOString().slice(0, 10)
    exportToCsv(reportData, columns, headers, `reporte_ventas_${fechaLog}.csv`)

    await ventasStore.vaciarVentas()
    alert("✔ Corte de caja realizado exitosamente. Sistema preparado para nuevas ventas y archivo de reporte descargado.")
  }
}
</script>

<style scoped>
.dashboard {
  padding: var(--space-8);
}

.page-header {
  margin-bottom: var(--space-8);
}

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.page-subtitle {
  color: var(--gray-500);
  font-size: var(--text-sm);
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--blue {
  background: var(--primary-light);
  color: var(--primary);
}

.stat-icon--green {
  background: var(--success-light);
  color: var(--success);
}

.stat-icon--purple {
  background: #ede9fe;
  color: #7c3aed;
}

.stat-icon--orange {
  background: var(--warning-light);
  color: var(--warning);
}

.stat-icon--red {
  background: var(--danger-light);
  color: var(--danger);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--gray-500);
  font-weight: 500;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.2;
}

/* Quick actions */
.quick-actions h2 {
  margin-bottom: var(--space-5);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-5);
}

.action-card {
  background: var(--card-bg);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  box-shadow: var(--shadow-sm);
}

.action-cut {
  background: #fffcfc;
  border-color: #fca5a5;
  box-shadow: inset 0px 0px 5px rgba(239, 68, 68, 0.1);
}

.action-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--gray-300);
}

.action-cut:hover {
  border-color: var(--danger);
  transform: translateY(-2px);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon--blue {
  background: var(--primary-light);
  color: var(--primary);
}

.action-icon--purple {
  background: #ede9fe;
  color: #7c3aed;
}

.action-label {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-800);
}

.action-desc {
  font-size: var(--text-sm);
  color: var(--gray-500);
}
</style>
