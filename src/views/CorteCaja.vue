<template>
  <AppLayout>
    <div class="corte-caja">
      <div class="header">
        <div>
          <h1>Corte de Caja Diario</h1>
          <p class="subtitle">{{ currentDate }}</p>
        </div>
        <div class="actions">
          <button class="btn-download" @click="descargarCorte">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar CSV
          </button>
        </div>
      </div>

      <div class="summary-grid">
        <div class="card stat-card">
          <div class="stat-icon s-total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Ventas Totales</span>
            <span class="stat-value">${{ resumen.total.toFixed(2) }}</span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon s-cash">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Efectivo</span>
            <span class="stat-value">${{ resumen.efectivo.toFixed(2) }}</span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon s-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Tarjeta</span>
            <span class="stat-value">${{ resumen.tarjeta.toFixed(2) }}</span>
          </div>
        </div>

        <div class="card stat-card">
          <div class="stat-icon s-count">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Transacciones</span>
            <span class="stat-value">{{ resumen.count }}</span>
          </div>
        </div>
      </div>

      <div class="tables-section">
        <div class="card table-card">
          <h2>Productos Vendidos Hoy</h2>
          <table class="report-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Cantidad</th>
                <th class="text-right">Venta Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in resumen.productos" :key="p.barcode">
                <td>{{ p.name }}</td>
                <td class="text-right">{{ p.qty.toFixed(2) }}</td>
                <td class="text-right">${{ p.total.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useVentasStore } from '../stores/ventas'
import { exportToCsv } from '../utils/export'

const ventasStore = useVentasStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })
})

onMounted(() => {
  ventasStore.cargarVentas()
})

const resumen = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const ventasHoy = ventasStore.ventas.filter(v => v.date.slice(0, 10) === today)
  
  const stats = {
    total: 0,
    efectivo: 0,
    tarjeta: 0,
    count: ventasHoy.length,
    productos: {}
  }

  ventasHoy.forEach(v => {
    stats.total += Number(v.total)
    if (v.method === 'Efectivo') stats.efectivo += Number(v.total)
    else stats.tarjeta += Number(v.total)

    v.items.forEach(item => {
      if (!stats.productos[item.barcode]) {
        stats.productos[item.barcode] = { name: item.name, qty: 0, total: 0 }
      }
      stats.productos[item.barcode].qty += Number(item.qty)
      stats.productos[item.barcode].total += (Number(item.qty) * Number(item.price))
    })
  })

  // Convertir productos a array ordenado
  const prodArray = Object.values(stats.productos).sort((a,b) => b.total - a.total)
  
  return { ...stats, productos: prodArray }
})

function descargarCorte() {
  const data = resumen.value.productos.map(p => ({
    Producto: p.name,
    Cantidad: p.qty,
    'Venta Total': p.total
  }))
  
  const headers = ['Producto', 'Cantidad', 'Venta Total']
  const columns = ['Producto', 'Cantidad', 'Venta Total']
  const date = new Date().toISOString().slice(0, 10)
  
  exportToCsv(data, columns, headers, `corte_caja_${date}.csv`)
}
</script>

<style scoped>
.corte-caja { padding: var(--space-6); background: var(--content-bg); min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
.header h1 { font-size: var(--text-3xl); font-weight: 800; color: var(--gray-900); }
.subtitle { color: var(--primary); font-weight: 600; text-transform: capitalize; margin-top: 4px; }

.actions .btn-download {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; background: var(--success); color: #fff;
  border: none; border-radius: var(--radius-md); font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.actions .btn-download:hover { background: var(--success-dark); transform: translateY(-2px); box-shadow: var(--shadow-md); }

.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-5); margin-bottom: var(--space-8); }

.card { background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--gray-100); box-shadow: var(--shadow-sm); }
.stat-card { padding: var(--space-6); display: flex; align-items: center; gap: var(--space-5); transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

.stat-icon { 
  width: 56px; height: 56px; border-radius: 16px; 
  display: flex; align-items: center; justify-content: center;
}
.s-total { background: #eff6ff; color: #2563eb; }
.s-cash { background: #ecfdf5; color: #10b981; }
.s-card { background: #f5f3ff; color: #7c3aed; }
.s-count { background: #fff7ed; color: #ea580c; }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: var(--text-sm); font-weight: 600; color: var(--gray-500); }
.stat-value { font-size: var(--text-2xl); font-weight: 800; color: var(--gray-900); }

.tables-section { max-width: 900px; margin: 0 auto; }
.table-card { padding: var(--space-6); }
.table-card h2 { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-5); color: var(--gray-800); }

.report-table { width: 100%; border-collapse: collapse; }
.report-table th { text-align: left; padding: 12px; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500); border-bottom: 2px solid var(--gray-50); }
.report-table td { padding: 14px 12px; font-size: var(--text-sm); color: var(--gray-700); border-bottom: 1px solid var(--gray-50); }
.text-right { text-align: right; }

tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--gray-50); }
</style>
