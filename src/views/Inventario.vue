<template>
  <AppLayout>
    <div class="inventario-page">
      <div class="page-header">
        <h1>Inventario</h1>
        <p class="page-subtitle">Control de existencias y stock</p>
      </div>

      <div class="inv-card card">
        <div class="inv-header">
          <div class="inv-search">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="buscar"
              type="text"
              placeholder="Buscar en inventario..."
            />
          </div>
          <button class="btn-export" @click="exportarInventario">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar a Excel
          </button>
        </div>

        <div v-if="!productosFiltrados.length" class="inv-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <p>Sin datos de inventario</p>
          <span v-if="buscar">No se encontraron productos para tu búsqueda</span>
          <span v-else>Agrega productos desde la seccion de Productos para verlos aqui</span>
          <button v-if="!buscar" class="btn-ir-productos" @click="$router.push('/productos')">
            Ir a productos
          </button>
        </div>

        <div v-else class="table-responsive">
          <table class="products-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock Actual</th>
                <th>Ajustar Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in productosFiltrados" :key="p.barcode">
                <td><code>{{ p.barcode }}</code></td>
                <td class="td-name">{{ p.name }}</td>
                <td class="td-price">${{ Number(p.price).toFixed(2) }}</td>
                <td>
                  <span class="stock-badge" :class="{ 'stock-low': Number(p.stock) < 10 }">
                    {{ p.stock }}
                  </span>
                </td>
                <td>
                  <div class="stock-adjust">
                    <button class="btn-icon" @click="ajustarStock(p, -1)" title="Restar 1">-</button>
                    <button class="btn-icon add" @click="ajustarStock(p, 1)" title="Sumar 1">+</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useProductosStore } from '../stores/productos'
import { exportToCsv } from '../utils/export'

const store = useProductosStore()
const buscar = ref('')

const productosFiltrados = computed(() => {
  if (!buscar.value) return store.productos
  const b = buscar.value.toLowerCase()
  return store.productos.filter(p => 
    p.name.toLowerCase().includes(b) || p.barcode.includes(b)
  )
})

async function ajustarStock(producto, variacion) {
  const nuevoStock = Number(producto.stock) + variacion
  // Usamos la misma función de agregarProducto porque esta automáticamente
  // detecta si el barcode ya existe y realiza un update (put) en Dexie.
  await store.agregarProducto({
    ...producto,
    stock: isNaN(nuevoStock) ? 0 : nuevoStock
  })
}

function exportarInventario() {
  if (!store.productos.length) {
    alert("No hay productos para exportar.")
    return
  }

  const columns = ['barcode', 'name', 'price', 'stock']
  const headers = ['Código de Barras', 'Nombre del Producto', 'Precio ($)', 'Cantidad en Stock']
  
  const fecha = new Date().toISOString().slice(0, 10)
  exportToCsv(store.productos, columns, headers, `inventario_surtiprais_${fecha}.csv`)
}
</script>

<style scoped>
.inventario-page {
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

.inv-card {
  padding: var(--space-6);
}

.inv-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.inv-search {
  position: relative;
  flex: 1;
  max-width: 320px;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 16px;
  background: var(--success);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-left: auto;
}

.btn-export:hover {
  background: var(--success-dark);
  box-shadow: var(--shadow-md);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

.inv-search input {
  width: 100%;
  padding: 9px 14px 9px 36px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  color: var(--gray-800);
  background: var(--gray-50);
  outline: none;
  transition: all var(--transition-fast);
}

.inv-search input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

.inv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  color: var(--gray-400);
  gap: var(--space-2);
  text-align: center;
}

.inv-empty p {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--gray-500);
  margin-top: var(--space-2);
}

.inv-empty span {
  font-size: var(--text-sm);
  max-width: 300px;
}

.btn-ir-productos {
  margin-top: var(--space-4);
  padding: 10px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-ir-productos:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

/* Table */
.products-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.products-table thead th {
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--gray-200);
}

.products-table tbody tr {
  transition: background var(--transition-fast);
}

.products-table tbody tr:hover {
  background: var(--gray-50);
}

.products-table tbody td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-700);
  vertical-align: middle;
}

.td-name {
  font-weight: 500;
  color: var(--gray-800);
}

.td-price {
  font-weight: 600;
  color: var(--success);
}

code {
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: var(--text-xs);
  color: var(--gray-600);
}

.stock-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--success-light);
  color: var(--success-dark);
}

.stock-low {
  background: var(--danger-light);
  color: var(--danger);
}

.stock-adjust {
  display: flex;
  gap: var(--space-2);
}

.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid var(--gray-300);
  background: white;
  color: var(--gray-700);
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: var(--danger-light);
  border-color: var(--danger);
  color: var(--danger);
}

.btn-icon.add:hover {
  background: var(--success-light);
  border-color: var(--success);
  color: var(--success-dark);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .inventario-page { padding: var(--space-4); }
  .inv-header { flex-direction: column; align-items: stretch; }
  .inv-search { max-width: none; }
  .btn-export { margin-left: 0; justify-content: center; }
  .products-table { min-width: 600px; }
}
</style>
