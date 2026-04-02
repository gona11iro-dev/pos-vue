<template>
  <AppLayout>
    <div class="db-page">
      <div class="page-header">
        <div>
          <h1>Base de Datos</h1>
          <p class="page-subtitle">Vista completa de todos los registros del sistema</p>
        </div>
        <div class="header-actions">
          <button class="btn-export btn-json" @click="descargarBackupCompleto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Backup completo (JSON)
          </button>
        </div>
      </div>

      <!-- Stats rápidas -->
      <div class="stats-row">
        <div class="stat-pill">
          <span class="stat-dot dot-blue"></span>
          <span class="stat-num">{{ totales.usuarios }}</span>
          <span class="stat-lbl">Usuarios</span>
        </div>
        <div class="stat-pill">
          <span class="stat-dot dot-green"></span>
          <span class="stat-num">{{ totales.productos }}</span>
          <span class="stat-lbl">Productos</span>
        </div>
        <div class="stat-pill">
          <span class="stat-dot dot-purple"></span>
          <span class="stat-num">{{ totales.ventas }}</span>
          <span class="stat-lbl">Transacciones</span>
        </div>
        <div class="stat-pill">
          <span class="stat-dot dot-orange"></span>
          <span class="stat-num">${{ totales.ingresos }}</span>
          <span class="stat-lbl">Total en ventas</span>
        </div>
      </div>

      <!-- Tabs de tablas -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ 'tab-btn--active': tabActiva === tab.key }"
          @click="tabActiva = tab.key"
        >
          <span v-html="tab.icon"></span>
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- ─── TABLA: VENTAS ─────────────────────────────────────── -->
      <div v-if="tabActiva === 'ventas'" class="card tabla-card">
        <div class="tabla-toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="busquedaVenta" id="bus-venta" type="text" placeholder="Buscar por folio, cliente, método..." class="search-input" />
          </div>
          <div class="toolbar-right">
            <button class="btn-export btn-csv" @click="exportarVentasCsv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              CSV
            </button>
            <button class="btn-export btn-json-sm" @click="exportarVentasJson">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              JSON
            </button>
          </div>
        </div>

        <div v-if="!ventasFiltradas.length" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <p>Sin transacciones registradas</p>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha / Hora</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Artículos</th>
                <th class="th-right">Cobrado</th>
                <th class="th-right">Cambio</th>
                <th class="th-right">Total</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="v in ventasFiltradas" :key="v.id">
                <tr @click="toggleDetalle(v.id)" class="tr-click">
                  <td><code class="folio">#{{ v.id }}</code></td>
                  <td class="td-fecha">{{ formatFecha(v.date) }}</td>
                  <td>{{ v.client || 'Público Gral.' }}</td>
                  <td>
                    <span class="method-badge" :class="methodClass(v.method)">{{ v.method }}</span>
                  </td>
                  <td class="td-center">{{ v.items?.length || 0 }}</td>
                  <td class="td-right">${{ (v.paidAmount || 0).toFixed(2) }}</td>
                  <td class="td-right td-change">${{ (v.change || 0).toFixed(2) }}</td>
                  <td class="td-right td-total">${{ (v.total || 0).toFixed(2) }}</td>
                  <td class="td-center">
                    <svg class="expand-icon" :class="{ 'rotated': ventaExpandida === v.id }"
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </td>
                </tr>
                <!-- Fila de detalle colapsable -->
                <tr v-if="ventaExpandida === v.id" class="tr-detail">
                  <td colspan="9">
                    <div class="detail-panel">
                      <p class="detail-title">Artículos de la venta #{{ v.id }}</p>
                      <table class="detail-table">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Producto</th>
                            <th class="th-right">Precio unitario</th>
                            <th class="th-right">Cantidad</th>
                            <th class="th-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(item, i) in v.items" :key="i">
                            <td><code>{{ item.barcode }}</code></td>
                            <td>{{ item.name }}</td>
                            <td class="td-right">${{ Number(item.price).toFixed(2) }}</td>
                            <td class="td-right">{{ item.qty }}</td>
                            <td class="td-right td-total">${{ (Number(item.price) * Number(item.qty)).toFixed(2) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── TABLA: PRODUCTOS ──────────────────────────────────── -->
      <div v-if="tabActiva === 'productos'" class="card tabla-card">
        <div class="tabla-toolbar">
          <div class="search-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="busquedaProd" id="bus-prod" type="text" placeholder="Buscar por nombre o código..." class="search-input" />
          </div>
          <div class="toolbar-right">
            <button class="btn-export btn-csv" @click="exportarProductosCsv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              CSV
            </button>
            <button class="btn-export btn-json-sm" @click="exportarProductosJson">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              JSON
            </button>
          </div>
        </div>

        <div v-if="!productosFiltrados.length" class="empty-state">
          <p>Sin productos registrados</p>
        </div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código de barras</th>
                <th>Nombre</th>
                <th class="th-right">Precio</th>
                <th class="th-right">Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in productosFiltrados" :key="p.barcode">
                <td><code>{{ p.barcode }}</code></td>
                <td class="td-name">{{ p.name }}</td>
                <td class="td-right td-total">${{ Number(p.price).toFixed(2) }}</td>
                <td class="td-right">{{ p.stock }}</td>
                <td>
                  <span class="stock-badge" :class="Number(p.stock) <= 10 ? 'stock-low' : 'stock-ok'">
                    {{ Number(p.stock) <= 10 ? 'Stock bajo' : 'OK' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ─── TABLA: USUARIOS ───────────────────────────────────── -->
      <div v-if="tabActiva === 'usuarios'" class="card tabla-card">
        <div class="tabla-toolbar">
          <p class="toolbar-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Las contraseñas no se muestran por seguridad
          </p>
          <div class="toolbar-right">
            <button class="btn-export btn-json-sm" @click="exportarUsuariosJson">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              JSON
            </button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Usuario</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(u, i) in usuarios" :key="u.id">
                <td class="td-num">{{ i + 1 }}</td>
                <td><code>{{ u.id }}</code></td>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ u.username.charAt(0).toUpperCase() }}</div>
                    <span>{{ u.username }}</span>
                  </div>
                </td>
                <td>
                  <span class="role-badge" :class="u.role === 'admin' ? 'role-admin' : 'role-cajero'">
                    {{ u.role === 'admin' ? 'Administrador' : 'Cajero' }}
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
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { db } from '../database/db'
import { exportToCsv, exportToJson, exportFullBackup } from '../utils/export'

// ── Estado ────────────────────────────────────────────────
const ventas    = ref([])
const productos = ref([])
const usuarios  = ref([])

const tabActiva     = ref('ventas')
const busquedaVenta = ref('')
const busquedaProd  = ref('')
const ventaExpandida = ref(null)

// ── Cargar datos ──────────────────────────────────────────
async function cargar() {
  ventas.value    = await db.ventas.orderBy('date').reverse().toArray()
  productos.value = await db.productos.toArray()
  usuarios.value  = await db.usuarios.toArray()
}

onMounted(cargar)

// ── Tabs config ───────────────────────────────────────────
const tabs = computed(() => [
  {
    key: 'ventas', label: 'Transacciones',
    count: ventas.value.length,
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
  },
  {
    key: 'productos', label: 'Productos',
    count: productos.value.length,
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
  },
  {
    key: 'usuarios', label: 'Usuarios',
    count: usuarios.value.length,
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>'
  },
])

// ── Totales para stats ────────────────────────────────────
const totales = computed(() => ({
  usuarios:  usuarios.value.length,
  productos: productos.value.length,
  ventas:    ventas.value.length,
  ingresos:  ventas.value.reduce((s, v) => s + (Number(v.total) || 0), 0).toFixed(2),
}))

// ── Filtros ───────────────────────────────────────────────
const ventasFiltradas = computed(() => {
  const q = busquedaVenta.value.trim().toLowerCase()
  if (!q) return ventas.value
  return ventas.value.filter(v =>
    String(v.id).includes(q) ||
    (v.client || '').toLowerCase().includes(q) ||
    (v.method || '').toLowerCase().includes(q) ||
    (v.items || []).some(i => i.name.toLowerCase().includes(q))
  )
})

const productosFiltrados = computed(() => {
  const q = busquedaProd.value.trim().toLowerCase()
  if (!q) return productos.value
  return productos.value.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.barcode.toLowerCase().includes(q)
  )
})

// ── Detalle colapsable ────────────────────────────────────
function toggleDetalle(id) {
  ventaExpandida.value = ventaExpandida.value === id ? null : id
}

// ── Formateo ──────────────────────────────────────────────
function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function methodClass(m = '') {
  const map = { 'efectivo': 'method-cash', 'tarjeta': 'method-card', 'transferencia': 'method-transfer' }
  return map[m.toLowerCase()] || 'method-other'
}

// ── Exportar ventas ───────────────────────────────────────
function exportarVentasCsv() {
  if (!ventas.value.length) return alert('No hay transacciones para exportar.')
  const rows = ventas.value.map(v => ({
    folio:    v.id,
    fecha:    formatFecha(v.date),
    cliente:  v.client || 'Público Gral.',
    metodo:   v.method,
    articulos: (v.items || []).map(i => `${i.qty}x ${i.name}`).join(' | '),
    cobrado:  (v.paidAmount || 0).toFixed(2),
    cambio:   (v.change || 0).toFixed(2),
    total:    (v.total || 0).toFixed(2),
  }))
  const cols    = ['folio','fecha','cliente','metodo','articulos','cobrado','cambio','total']
  const headers = ['Folio','Fecha y Hora','Cliente','Método de Pago','Artículos','Cobrado ($)','Cambio ($)','Total ($)']
  const fecha   = new Date().toISOString().slice(0,10)
  exportToCsv(rows, cols, headers, `ventas_${fecha}.csv`)
}

function exportarVentasJson() {
  if (!ventas.value.length) return alert('No hay transacciones para exportar.')
  exportToJson(ventas.value, `ventas_${new Date().toISOString().slice(0,10)}.json`)
}

// ── Exportar productos ────────────────────────────────────
function exportarProductosCsv() {
  if (!productos.value.length) return alert('No hay productos para exportar.')
  const cols    = ['barcode','name','price','stock']
  const headers = ['Código de Barras','Nombre','Precio ($)','Stock']
  exportToCsv(productos.value, cols, headers, `productos_${new Date().toISOString().slice(0,10)}.csv`)
}

function exportarProductosJson() {
  exportToJson(productos.value, `productos_${new Date().toISOString().slice(0,10)}.json`)
}

// ── Exportar usuarios (sin passwords) ────────────────────
function exportarUsuariosJson() {
  const safe = usuarios.value.map(({ password, ...rest }) => rest)
  exportToJson(safe, `usuarios_${new Date().toISOString().slice(0,10)}.json`)
}

// ── Backup completo ───────────────────────────────────────
function descargarBackupCompleto() {
  const safeUsuarios = usuarios.value.map(({ password, ...rest }) => rest)
  exportFullBackup({
    usuarios:  safeUsuarios,
    productos: productos.value,
    ventas:    ventas.value,
  })
}
</script>

<style scoped>
/* ── Page ───────────────────────────────── */
.db-page {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.page-header h1 { font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-1); }
.page-subtitle { color: var(--gray-500); font-size: var(--text-sm); }

.header-actions { display: flex; gap: var(--space-3); }

/* ── Stats pills ────────────────────────── */
.stats-row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.stat-pill {
  display: flex; align-items: center; gap: 8px;
  background: var(--card-bg);
  border: 1px solid var(--gray-200);
  border-radius: 999px;
  padding: 8px 16px;
  box-shadow: var(--shadow-sm);
  font-size: var(--text-sm);
}
.stat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dot-blue   { background: #3b82f6; }
.dot-green  { background: #22c55e; }
.dot-purple { background: #8b5cf6; }
.dot-orange { background: #f97316; }
.stat-num { font-weight: 700; color: var(--gray-800); }
.stat-lbl { color: var(--gray-500); }

/* ── Tabs ───────────────────────────────── */
.tabs {
  display: flex;
  gap: var(--space-2);
  border-bottom: 2px solid var(--gray-200);
  padding-bottom: 0;
}
.tab-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border: none; border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  background: transparent;
  color: var(--gray-500);
  font-size: var(--text-sm); font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer; transition: all 0.15s;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
.tab-btn:hover { color: var(--gray-800); background: var(--gray-50); }
.tab-btn--active { color: var(--primary); border-bottom-color: var(--primary); background: transparent; }
.tab-count {
  background: var(--gray-200);
  color: var(--gray-600);
  font-size: 11px; font-weight: 700;
  padding: 1px 7px; border-radius: 999px;
}
.tab-btn--active .tab-count { background: var(--primary-light); color: var(--primary); }

/* ── Buttons ────────────────────────────── */
.btn-export {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  border: none; border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer; transition: all var(--transition-fast);
}
.btn-json { background: #1e293b; color: #fff; }
.btn-json:hover { background: #0f172a; box-shadow: var(--shadow-md); }
.btn-csv { background: #16a34a; color: #fff; font-size: var(--text-xs); padding: 7px 12px; }
.btn-csv:hover { background: #15803d; }
.btn-json-sm { background: #1e293b; color: #fff; font-size: var(--text-xs); padding: 7px 12px; }
.btn-json-sm:hover { background: #0f172a; }

/* ── Tabla card ─────────────────────────── */
.tabla-card { padding: 0; overflow: hidden; }

.tabla-toolbar {
  display: flex; align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--gray-100);
  background: var(--gray-50);
}
.toolbar-right { display: flex; gap: var(--space-2); }
.toolbar-note {
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-xs); color: var(--gray-500);
}

/* Search */
.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 11px; color: var(--gray-400); pointer-events: none; }
.search-input {
  padding: 7px 14px 7px 34px;
  border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-family: var(--font-family);
  background: #fff; color: var(--gray-800); outline: none;
  width: 260px; transition: all var(--transition-fast);
}
.search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }

/* Table wrapper with horizontal scroll */
.table-wrap { overflow-x: auto; }

.data-table {
  width: 100%; border-collapse: separate; border-spacing: 0;
  font-size: var(--text-sm);
}
.data-table thead th {
  text-align: left;
  font-size: 11px; font-weight: 700;
  color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
  white-space: nowrap;
}
.th-right { text-align: right; }
.data-table tbody td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-700);
  white-space: nowrap;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.tr-click { cursor: pointer; transition: background 0.1s; }
.tr-click:hover { background: #f8faff; }

.td-center { text-align: center; }
.td-right  { text-align: right; }
.td-num    { color: var(--gray-400); font-size: var(--text-xs); }
.td-fecha  { color: var(--gray-500); font-size: var(--text-xs); }
.td-name   { font-weight: 500; color: var(--gray-800); }
.td-total  { font-weight: 700; color: var(--success-dark, #15803d); }
.td-change { color: var(--gray-500); font-size: var(--text-xs); }

code { background: var(--gray-100); padding: 2px 6px; border-radius: 4px; font-size: var(--text-xs); color: var(--gray-600); }
.folio { color: var(--primary); }

/* Badges */
.method-badge {
  display: inline-block; padding: 2px 10px;
  border-radius: 999px; font-size: 11px; font-weight: 600;
}
.method-cash     { background: #dcfce7; color: #15803d; }
.method-card     { background: #dbeafe; color: #1d4ed8; }
.method-transfer { background: #ede9fe; color: #6d28d9; }
.method-other    { background: var(--gray-200); color: var(--gray-600); }

.stock-badge {
  display: inline-block; padding: 2px 10px;
  border-radius: 999px; font-size: 11px; font-weight: 600;
}
.stock-ok  { background: #dcfce7; color: #15803d; }
.stock-low { background: #fee2e2; color: #dc2626; }

.role-badge {
  display: inline-block; padding: 2px 10px;
  border-radius: 999px; font-size: 11px; font-weight: 600;
}
.role-admin  { background: #fef3c7; color: #b45309; }
.role-cajero { background: #dbeafe; color: #1d4ed8; }

/* User cell */
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; font-weight: 700; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Expand icon */
.expand-icon { transition: transform 0.2s; color: var(--gray-400); }
.expand-icon.rotated { transform: rotate(180deg); color: var(--primary); }

/* Detail row */
.tr-detail td { padding: 0; background: #f8faff; }
.detail-panel {
  padding: var(--space-4) var(--space-6);
  border-top: 1px dashed var(--gray-200);
  border-bottom: 1px solid var(--gray-100);
}
.detail-title { font-size: var(--text-xs); font-weight: 700; color: var(--primary); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em; }
.detail-table { width: 100%; border-collapse: collapse; font-size: var(--text-xs); }
.detail-table th {
  text-align: left; color: var(--gray-400); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em;
  padding: 4px 10px; border-bottom: 1px solid var(--gray-200);
}
.detail-table td { padding: 5px 10px; color: var(--gray-600); }

/* Empty state */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 60px 20px;
  color: var(--gray-400); gap: var(--space-2); text-align: center;
}
.empty-state p { font-size: var(--text-base); font-weight: 500; color: var(--gray-500); }
</style>
