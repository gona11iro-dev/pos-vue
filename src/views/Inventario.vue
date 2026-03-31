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
        </div>

        <div class="inv-empty">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <p>Sin datos de inventario</p>
          <span>Agrega productos desde la seccion de Productos para verlos aqui</span>
          <button class="btn-ir-productos" @click="$router.push('/productos')">
            Ir a productos
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'

const buscar = ref('')
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
</style>
