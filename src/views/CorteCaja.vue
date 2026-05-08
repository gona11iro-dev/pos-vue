<template>
  <AppLayout>
    <div class="corte-caja">
      <div class="header">
        <div>
          <h1>Corte de Caja Diario</h1>
          <p class="subtitle">{{ currentDate }}</p>
        </div>
        <div class="actions">
          <button class="btn-corte" :disabled="savingCorte" @click="guardarCorteDiario">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {{ savingCorte ? 'Guardando...' : 'Guardar corte diario' }}
          </button>
          <button class="btn-download" @click="descargarCorte">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar CSV
          </button>
        </div>
      </div>
      <p v-if="corteGuardadoMsg" class="save-msg">{{ corteGuardadoMsg }}</p>
      <p v-if="corteErrorMsg" class="error-msg">{{ corteErrorMsg }}</p>

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
          <div class="stat-icon s-credit">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"></path><path d="M3 8l9-5 9 5"></path><path d="M12 13v5"></path>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Fiado</span>
            <span class="stat-value">${{ resumen.fiado.toFixed(2) }}</span>
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
          <div class="report-table-wrap">
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
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useVentasStore } from '../stores/ventas'
import { exportToCsv } from '../utils/export'
import { api } from '../api/client'
import { getLocalDateKey, isSaleOnDate, normalizePaymentMethod, saleCollectedAmount, saleCreditAmount, saleTotal } from '../utils/sales'

const ventasStore = useVentasStore()
const savingCorte = ref(false)
const corteGuardadoMsg = ref('')
const corteErrorMsg = ref('')

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })
})

onMounted(() => {
  ventasStore.cargarVentas()
})

const resumen = computed(() => {
  const ventasHoy = ventasStore.ventas.filter(v => isSaleOnDate(v))
  
  const stats = {
    total: 0,
    efectivo: 0,
    tarjeta: 0,
    fiado: 0,
    count: ventasHoy.length,
    productos: {}
  }

  ventasHoy.forEach(v => {
    stats.total += saleTotal(v)

    const method = normalizePaymentMethod(v.method)
    if (method === 'efectivo') stats.efectivo += saleCollectedAmount(v)
    else if (method === 'tarjeta') stats.tarjeta += saleCollectedAmount(v)
    else stats.fiado += saleCreditAmount(v)

    v.items.forEach(item => {
      if (!stats.productos[item.barcode]) {
        stats.productos[item.barcode] = { barcode: item.barcode, name: item.name, qty: 0, total: 0 }
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
  const date = getLocalDateKey()
  
  exportToCsv(data, columns, headers, `corte_caja_${date}.csv`)
}

async function guardarCorteDiario() {
  corteGuardadoMsg.value = ''
  corteErrorMsg.value = ''
  savingCorte.value = true
  try {
    const date = getLocalDateKey()
    const payload = {
      corteDate: date,
      total: resumen.value.total,
      efectivo: resumen.value.efectivo,
      tarjeta: resumen.value.tarjeta,
      fiado: resumen.value.fiado,
      transacciones: resumen.value.count,
      productos: resumen.value.productos
    }
    await api.saveCorte(payload)
    corteGuardadoMsg.value = `Corte diario ${date} guardado correctamente. Puedes verlo en Base de Datos > Cortes.`
  } catch (error) {
    corteErrorMsg.value = `No se pudo guardar el corte: ${error.message || 'error desconocido'}`
  } finally {
    savingCorte.value = false
  }
}
</script>

<style scoped>
.corte-caja { padding: var(--space-6); background: var(--content-bg); min-height: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); }
.header h1 { font-size: var(--text-3xl); font-weight: 800; color: var(--gray-900); }
.subtitle { color: var(--primary); font-weight: 600; text-transform: capitalize; margin-top: 4px; }

.actions { display: flex; gap: 10px; }
.btn-corte { 
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; background: var(--danger); color: #fff;
  border: none; border-radius: var(--radius-md); font-weight: 800;
  cursor: pointer; transition: all 0.2s;
}
.btn-corte:hover { background: #b91c1c; transform: translateY(-2px); box-shadow: var(--shadow-md); }
.btn-corte:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }

.actions .btn-download {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; background: var(--success); color: #fff;
  border: none; border-radius: var(--radius-md); font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.actions .btn-download:hover { background: var(--success-dark); transform: translateY(-2px); box-shadow: var(--shadow-md); }
.save-msg { margin-top: -10px; margin-bottom: 14px; color: var(--success-dark); font-weight: 700; }
.error-msg { margin-top: -10px; margin-bottom: 14px; color: var(--danger); font-weight: 700; }

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
.s-credit { background: #fff7ed; color: #ea580c; }
.s-count { background: #fff7ed; color: #ea580c; }

.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: var(--text-sm); font-weight: 600; color: var(--gray-500); }
.stat-value { font-size: var(--text-2xl); font-weight: 800; color: var(--gray-900); }

.tables-section { max-width: 900px; margin: 0 auto; }
.table-card { padding: var(--space-6); }
.table-card h2 { font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-5); color: var(--gray-800); }
.report-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

.report-table { width: 100%; border-collapse: collapse; }
.report-table th { text-align: left; padding: 12px; font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500); border-bottom: 2px solid var(--gray-50); }
.report-table td { padding: 14px 12px; font-size: var(--text-sm); color: var(--gray-700); border-bottom: 1px solid var(--gray-50); }
.text-right { text-align: right; }

tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--gray-50); }

@media (max-width: 1080px) {
  .corte-caja { padding: var(--space-6); }
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .actions {
    flex-wrap: wrap;
  }

  .actions > button {
    flex: 1 1 220px;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .corte-caja { padding: var(--space-4); }
  .report-table { min-width: 520px; }
}

</style>
