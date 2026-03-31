<template>
  <AppLayout>
    <div class="productos-page">
      <div class="page-header">
        <h1>Productos</h1>
        <p class="page-subtitle">Gestiona tu catalogo de productos</p>
      </div>

      <div class="productos-layout">
        <!-- Add product form -->
        <div class="form-card card">
          <h2 class="form-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar producto
          </h2>

          <div class="form-grid">
            <div class="input-group">
              <label for="barcode">Codigo de barras</label>
              <input
                id="barcode"
                v-model="barcode"
                type="text"
                placeholder="Ej: 7501055303045"
              />
            </div>

            <div class="input-group">
              <label for="name">Nombre</label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="Ej: Coca-Cola 600ml"
              />
            </div>

            <div class="input-group">
              <label for="price">Precio</label>
              <div class="input-prefix">
                <span class="prefix">$</span>
                <input
                  id="price"
                  v-model="price"
                  type="text"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div class="input-group">
              <label for="stock">Stock</label>
              <input
                id="stock"
                v-model="stock"
                type="text"
                placeholder="Ej: 50"
              />
            </div>
          </div>

          <button class="btn-guardar" @click="guardar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Guardar producto
          </button>
        </div>

        <!-- Product list -->
        <div class="product-list card">
          <h2 class="form-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            Lista de productos
            <span v-if="productos.length" class="count-badge">{{ productos.length }}</span>
          </h2>

          <div v-if="!productos.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p>Sin productos</p>
            <span>Agrega tu primer producto con el formulario</span>
          </div>

          <table v-else class="products-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in productos" :key="p.barcode">
                <td><code>{{ p.barcode }}</code></td>
                <td class="td-name">{{ p.name }}</td>
                <td class="td-price">${{ p.price }}</td>
                <td>
                  <span class="stock-badge" :class="{ 'stock-low': Number(p.stock) < 10 }">
                    {{ p.stock }}
                  </span>
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
import { ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'

const barcode = ref('')
const name = ref('')
const price = ref('')
const stock = ref('')
const productos = ref([])

function guardar() {
  if (!barcode.value.trim() || !name.value.trim()) return

  productos.value.push({
    barcode: barcode.value.trim(),
    name: name.value.trim(),
    price: price.value.trim(),
    stock: stock.value.trim()
  })

  barcode.value = ''
  name.value = ''
  price.value = ''
  stock.value = ''
}
</script>

<style scoped>
.productos-page {
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

.productos-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: var(--space-6);
  align-items: start;
}

/* Form card */
.form-card {
  padding: var(--space-6);
}

.form-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  margin-bottom: var(--space-5);
}

.count-badge {
  background: var(--gray-200);
  color: var(--gray-600);
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: auto;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-group label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--gray-700);
}

.input-group input {
  padding: 10px 14px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  color: var(--gray-800);
  background: var(--gray-50);
  outline: none;
  transition: all var(--transition-fast);
}

.input-group input::placeholder {
  color: var(--gray-400);
}

.input-group input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

.input-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix {
  position: absolute;
  left: 14px;
  color: var(--gray-500);
  font-weight: 500;
  pointer-events: none;
}

.input-prefix input {
  padding-left: 28px;
  width: 100%;
}

.btn-guardar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: 12px;
  margin-top: var(--space-5);
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

.btn-guardar:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

/* Product list */
.product-list {
  padding: var(--space-6);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  color: var(--gray-400);
  gap: var(--space-2);
  text-align: center;
}

.empty-state p {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--gray-500);
}

.empty-state span {
  font-size: var(--text-sm);
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
</style>
