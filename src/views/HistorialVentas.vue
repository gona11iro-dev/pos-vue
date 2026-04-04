<template>
  <AppLayout>
    <div class="historial">
      <div class="header">
        <h1>Historial de Ventas</h1>
        <div class="filters">
          <button 
            v-for="f in filterOptions" 
            :key="f.id"
            :class="['btn-filter', filterActive === f.id ? 'active' : '']"
            @click="filterActive = f.id"
          >
            {{ f.label }}
          </button>
        </div>
      </div>

      <div class="content">
        <div v-if="!ventasFiltradas.length" class="empty-state">
          <p>No hay ventas registradas en este periodo.</p>
        </div>

        <div v-else class="sales-list">
          <div v-for="v in ventasFiltradas" :key="v.id" class="sale-card">
            <div class="sale-header" @click="toggleDetails(v.id)">
              <div class="sale-main-info">
                <span class="sale-id">#{{ v.id }}</span>
                <span class="sale-date">{{ formatDate(v.date) }}</span>
                <span class="sale-client">{{ v.client || 'Público General' }}</span>
              </div>
              <div class="sale-sum-info">
                <span :class="['sale-method', v.method === 'Efectivo' ? 'm-cash' : 'm-card']">
                  {{ v.method }}
                </span>
                <span class="sale-total">${{ Number(v.total).toFixed(2) }}</span>
                <svg :class="['icon-chevron', expandedId === v.id ? 'expanded' : '']" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <!-- Detalles Expandibles -->
            <div v-if="expandedId === v.id" class="sale-details">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th class="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in v.items" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.qty }}</td>
                    <td>${{ Number(item.price).toFixed(2) }}</td>
                    <td class="text-right">${{ (item.qty * item.price).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="sale-actions" v-if="authStore.isAdmin">
                <button class="btn-delete" @click="confirmDelete(v.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Eliminar Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useVentasStore } from '../stores/ventas'
import { useAuthStore } from '../stores/auth'

const ventasStore = useVentasStore()
const authStore = useAuthStore()

const expandedId = ref(null)
const filterActive = ref('today')

const filterOptions = [
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'all', label: 'Todo' }
]

onMounted(() => {
  ventasStore.cargarVentas()
})

const ventasFiltradas = computed(() => {
  if (filterActive.value === 'all') return ventasStore.ventas
  
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  
  const yesterdayDate = new Date()
  yesterdayDate.setDate(now.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().slice(0, 10)

  return ventasStore.ventas.filter(v => {
    const vDate = v.date.slice(0, 10)
    if (filterActive.value === 'today') return vDate === today
    if (filterActive.value === 'yesterday') return vDate === yesterday
    return true
  })
})

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('es-MX', { 
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit'
  })
}

async function confirmDelete(id) {
  if (confirm('¿Estás seguro de eliminar esta venta? El stock será devuelto al inventario.')) {
    try {
      await ventasStore.eliminarVenta(id)
      alert('Venta eliminada con éxito.')
    } catch (e) {
      alert('Error al eliminar la venta.')
    }
  }
}
</script>

<style scoped>
.historial { padding: var(--space-6); background: var(--content-bg); min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6); }
.header h1 { font-size: var(--text-2xl); font-weight: 800; }

.filters { display: flex; gap: var(--space-2); }
.btn-filter { 
  padding: 8px 16px; border: 1px solid var(--gray-200); border-radius: var(--radius-md);
  background: #fff; cursor: pointer; font-size: var(--text-sm); font-weight: 600;
  transition: all 0.2s;
}
.btn-filter.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.sales-list { display: flex; flex-direction: column; gap: var(--space-3); }
.sale-card { background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); overflow: hidden; box-shadow: var(--shadow-sm); }

.sale-header { 
  padding: var(--space-4) var(--space-5); display: flex; justify-content: space-between; align-items: center; 
  cursor: pointer; transition: background 0.2s;
}
.sale-header:hover { background: var(--gray-50); }

.sale-main-info { display: flex; align-items: center; gap: var(--space-4); }
.sale-id { font-weight: 700; color: var(--primary); font-size: var(--text-sm); min-width: 40px; }
.sale-date { color: var(--gray-500); font-size: var(--text-xs); }
.sale-client { font-weight: 600; font-size: var(--text-sm); color: var(--gray-700); }

.sale-sum-info { display: flex; align-items: center; gap: var(--space-6); }
.sale-total { font-weight: 700; font-size: var(--text-lg); color: var(--gray-900); min-width: 90px; text-align: right; }

.sale-method { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
.m-cash { background: #dcfce7; color: #15803d; }
.m-card { background: #dbeafe; color: #1d4ed8; }

.icon-chevron { transition: transform 0.2s; color: var(--gray-400); }
.icon-chevron.expanded { transform: rotate(180deg); }

.sale-details { padding: var(--space-5); background: #fafafa; border-top: 1px solid var(--gray-100); }

.items-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.items-table th { text-align: left; color: var(--gray-500); font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid var(--gray-200); }
.items-table td { padding: 8px 0; color: var(--gray-700); }
.text-right { text-align: right; }

.sale-actions { margin-top: var(--space-4); display: flex; justify-content: flex-end; }
.btn-delete { 
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: #fee2e2; color: #dc2626; border: none; 
  border-radius: var(--radius-md); font-weight: 700; font-size: var(--text-xs); cursor: pointer;
}
.btn-delete:hover { background: #fecaca; }

.empty-state { text-align: center; padding: 40px; color: var(--gray-400); }
</style>
