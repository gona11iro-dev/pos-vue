<template>
  <AppLayout>
    <div class="productos-page">
      <div class="page-header">
        <h1>Productos</h1>
        <p class="page-subtitle">Gestiona tu catálogo de productos</p>
      </div>

      <div class="productos-layout">
        <!-- Formulario -->
        <div class="form-card card">
          <h2 class="form-title">
            <svg v-if="!isEditing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ isEditing ? 'Editar producto' : 'Agregar producto' }}
          </h2>



          <div class="form-grid">
            <!-- Tipo de venta -->
            <div class="input-group">
              <label>Tipo de venta</label>
              <div class="unit-selector">
                <button
                  v-for="u in unidades"
                  :key="u.value"
                  type="button"
                  class="unit-btn"
                  :class="{ 'unit-btn--active': unit === u.value }"
                  @click="unit = u.value"
                >
                  <span class="unit-emj">{{ u.emoji }}</span>
                  {{ u.label }}
                </button>
              </div>
              <p class="unit-hint">{{ unidadHint }}</p>
            </div>

            <!-- Código de barras (opcional para kg/g) -->
            <div class="input-group">
              <label for="barcode">
                Código de barras
                <span v-if="unit !== 'pza'" class="label-optional">(opcional)</span>
              </label>
              <div class="input-with-action">
                  <input
                    id="barcode"
                    v-model="barcode"
                    type="text"
                    :disabled="isEditing"
                    :class="{ 'input-readonly': isEditing }"
                    :placeholder="unit !== 'pza' ? 'Dejar vacío para código automático' : 'Ej: 7501055303045'"
                  />

                <button class="btn-scan" type="button" @click="mostrarScanner = true" title="Escanear con cámara">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Nombre -->
            <div class="input-group">
              <label for="name">Nombre del producto</label>
              <input
                id="name"
                v-model="name"
                type="text"
                :placeholder="unit === 'kg' ? 'Ej: Jitomate' : unit === 'g' ? 'Ej: Jamón de pavo' : 'Ej: Coca-Cola 600ml'"
              />
            </div>

            <!-- Precio -->
            <div class="input-group">
              <label for="price">
                Precio
                <span class="label-unit">por {{ unidadLabel }}</span>
              </label>
              <div class="input-prefix">
                <span class="prefix">$</span>
                <input id="price" v-model="price" type="number" step="0.01" min="0" placeholder="0.00" />
              </div>
            </div>

            <!-- Stock (solo pza) -->
            <div v-if="unit === 'pza'" class="input-group">
              <label for="stock">Stock inicial</label>
              <input id="stock" v-model="stock" type="number" min="0" placeholder="Ej: 50" />
            </div>
            <div v-else class="info-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Los productos por peso no llevan control de stock digital. Se gestiona físicamente.
            </div>
          </div>

          <p v-if="errorForm" class="form-error">{{ errorForm }}</p>

          <div class="form-actions-stack">
            <button class="btn-guardar" @click="guardar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ isEditing ? 'Guardar cambios' : 'Guardar producto' }}
            </button>
            <button v-if="isEditing" class="btn-cancelar-edit" @click="cancelarEdicion">
              Cancelar edición
            </button>
          </div>
        </div>


        <!-- Lista de productos -->
        <div class="product-list card">
          <div class="list-header">
            <h2 class="form-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Lista de productos
              <span v-if="productos.length" class="count-badge">{{ productos.length }}</span>
            </h2>
            <div class="filter-tabs">
              <button
                v-for="f in filtros"
                :key="f.value"
                class="filter-tab"
                :class="{ 'filter-tab--active': filtroActivo === f.value }"
                @click="filtroActivo = f.value"
              >{{ f.label }}</button>
            </div>
          </div>

          <div v-if="!productosFiltrados.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <p>Sin productos</p>
            <span>Agrega tu primer producto con el formulario</span>
          </div>

          <div v-else-if="isMobileCardsView" class="mobile-products-list">
            <article v-for="p in productosFiltrados" :key="p.barcode" class="product-mobile-card">
              <div class="product-mobile-card__head">
                <div class="product-mobile-card__copy">
                  <strong>{{ p.name }}</strong>
                  <code :class="{ 'code-internal': p.barcode?.startsWith('INT-') }">
                    {{ p.barcode?.startsWith('INT-') ? '— sin código' : p.barcode }}
                  </code>
                </div>
                <span class="unit-badge" :class="`unit-${p.unit || 'pza'}`">
                  {{ unitLabel(p.unit) }}
                </span>
              </div>

              <div class="product-mobile-card__meta">
                <div class="mobile-meta-chip">
                  <span>Precio</span>
                  <strong>${{ Number(p.price).toFixed(2) }}</strong>
                </div>
                <div class="mobile-meta-chip">
                  <span>Stock</span>
                  <strong v-if="!p.unit || p.unit === 'pza'">{{ p.stock }}</strong>
                  <strong v-else>—</strong>
                </div>
              </div>

              <div class="product-mobile-card__footer">
                <span
                  v-if="!p.unit || p.unit === 'pza'"
                  class="stock-badge"
                  :class="{ 'stock-low': Number(p.stock) < 10 }"
                >
                  {{ Number(p.stock) < 10 ? 'Stock bajo' : 'Disponible' }}
                </span>
                <span v-else class="stock-badge stock-na">Sin stock digital</span>

                <div class="product-mobile-card__actions">
                  <button class="mobile-action-btn mobile-action-btn--edit" @click="editar(p)">
                    Editar
                  </button>
                  <button class="mobile-action-btn mobile-action-btn--delete" @click="confirmarEliminar(p.barcode)">
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="table-responsive">
            <table class="products-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th class="th-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in productosFiltrados" :key="p.barcode">
                  <td><code :class="{ 'code-internal': p.barcode?.startsWith('INT-') }">{{ p.barcode?.startsWith('INT-') ? '— sin código' : p.barcode }}</code></td>
                  <td class="td-name">{{ p.name }}</td>
                  <td>
                    <span class="unit-badge" :class="`unit-${p.unit || 'pza'}`">
                      {{ unitLabel(p.unit) }}
                    </span>
                  </td>
                  <td class="td-price">${{ Number(p.price).toFixed(2) }}</td>
                  <td>
                    <span v-if="!p.unit || p.unit === 'pza'" class="stock-badge" :class="{ 'stock-low': Number(p.stock) < 10 }">
                      {{ p.stock }}
                    </span>
                    <span v-else class="stock-badge stock-na">—</span>
                  </td>
                  <td class="td-center">
                    <div class="action-btns">
                      <button class="btn-icon-act btn-edit" @click="editar(p)" title="Editar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button class="btn-icon-act btn-delete" @click="confirmarEliminar(p.barcode)" title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <BarcodeScanner
      :visible="mostrarScanner"
      @update:visible="mostrarScanner = $event"
      @detected="onBarcodeDetected"
    />

    <!-- Modal Confirmar Eliminar -->
    <Teleport to="body">
      <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
        <div class="modal-confirm">
          <div class="modal-confirm-header">
            <h3>¿Eliminar producto?</h3>
          </div>
          <p class="modal-confirm-body">
            Esta acción eliminará permanentemente el producto del catálogo. ¿Deseas continuar?
          </p>
          <div class="modal-confirm-footer">
            <button class="btn-cancelar" @click="modalEliminar = false">No, mantener</button>
            <button class="btn-confirmar-borrar" @click="eliminar">Sí, eliminar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import { useProductosStore } from '../stores/productos'

const store = useProductosStore()

const barcode = ref('')
const name    = ref('')
const price   = ref('')
const stock   = ref('')
const unit    = ref('pza')   // 'pza' | 'kg' | 'g'
const errorForm   = ref('')
const mostrarScanner = ref(false)
const filtroActivo   = ref('todos')
const windowWidth = ref(window.innerWidth)

// ── CRUD Estado ──────────────────────────────────────────
const isEditing = ref(false)
const modalEliminar = ref(false)
const barcodeAEliminar = ref(null)

const unidades = [
  { value: 'pza', label: 'Pieza', emoji: '📦' },
  { value: 'kg',  label: 'Kilogramo', emoji: '⚖️' },
]

const filtros = [
  { value: 'todos', label: 'Todos' },
  { value: 'pza',   label: 'Piezas' },
  { value: 'kg',    label: 'Por kg' },
]

const unidadHint = computed(() => ({
  pza: 'Productos con cantidad entera (refrescos, pan por pieza, jabón, etc.)',
  kg:  'Productos que se pesan en kilogramos (frutas, verduras, queso, jamón)',
})[unit.value])

const unidadLabel = computed(() => unitLabel(unit.value))

function unitLabel(u) {
  return { pza: 'pieza', kg: 'kg' }[u || 'pza'] ?? 'pieza'
}

const productos = computed(() => store.productos)
const isMobileCardsView = computed(() => windowWidth.value <= 820)

const productosFiltrados = computed(() => {
  if (filtroActivo.value === 'todos') return productos.value
  return productos.value.filter(p => (p.unit || 'pza') === filtroActivo.value)
})

function onBarcodeDetected(payload) {
  const detectedCode = typeof payload === 'string'
    ? payload
    : payload?.code || payload?.rawCode || ''

  barcode.value = detectedCode
  mostrarScanner.value = false
}

function handleResize() {
  windowWidth.value = window.innerWidth
}

// ── Acciones CRUD ────────────────────────────────────────

function editar(p) {
  isEditing.value = true
  barcode.value = p.barcode
  name.value    = p.name
  price.value   = p.price
  stock.value   = p.stock === '—' ? '' : p.stock
  unit.value    = p.unit || 'pza'
  errorForm.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelarEdicion() {
  isEditing.value = false
  limpiarForm()
}

function limpiarForm() {
  barcode.value = ''
  name.value    = ''
  price.value   = ''
  stock.value   = ''
  errorForm.value = ''
}

function confirmarEliminar(b) {
  barcodeAEliminar.value = b
  modalEliminar.value = true
}

async function eliminar() {
  if (!barcodeAEliminar.value) return
  try {
    await store.eliminarProducto(barcodeAEliminar.value)
    modalEliminar.value = false
    barcodeAEliminar.value = null
  } catch (e) {
    alert('Error al eliminar producto')
  }
}

async function guardar() {
  errorForm.value = ''

  if (!name.value.trim()) {
    errorForm.value = 'El nombre del producto es obligatorio.'
    return
  }
  if (!price.value || Number(price.value) <= 0) {
    errorForm.value = 'Ingresa un precio válido.'
    return
  }
  // Para pza, el barcode es obligatorio
  if (unit.value === 'pza' && !barcode.value.trim()) {
    errorForm.value = 'El código de barras es obligatorio para productos por pieza.'
    return
  }

  // Si kg/g y no tiene código, generamos uno interno
  const codigoFinal = barcode.value.trim() || `INT-${Date.now()}`

  try {
    await store.agregarProducto({
      barcode: codigoFinal,
      name:    name.value.trim(),
      price:   price.value,
      stock:   unit.value === 'pza' ? stock.value : '—',
      unit:    unit.value,
    })
    
    isEditing.value = false
    limpiarForm()
  } catch (e) {
    errorForm.value = 'Error al guardar el producto.'
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>


<style scoped>
.productos-page { padding: var(--space-8); }

.page-header { margin-bottom: var(--space-8); }
.page-header h1 { font-size: var(--text-2xl); font-weight: 700; margin-bottom: var(--space-1); }
.page-subtitle { color: var(--gray-500); font-size: var(--text-sm); }

.productos-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: var(--space-6);
  align-items: start;
}

/* Form */
.form-card { padding: var(--space-6); }
.form-title { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-lg); margin-bottom: var(--space-5); }
.form-grid { display: flex; flex-direction: column; gap: var(--space-4); }

/* Unit selector */
.unit-selector { display: flex; gap: var(--space-2); }
.unit-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px; border: 2px solid var(--gray-200); border-radius: var(--radius-md);
  background: var(--gray-50); color: var(--gray-600);
  font-size: var(--text-xs); font-weight: 600; font-family: var(--font-family);
  cursor: pointer; transition: all 0.15s;
}
.unit-btn:hover { border-color: var(--primary); color: var(--primary); background: var(--primary-light); }
.unit-btn--active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
.unit-emj { font-size: 1.25rem; }
.unit-hint { font-size: var(--text-xs); color: var(--gray-400); margin-top: 2px; line-height: 1.4; }

/* Labels */
.label-optional { font-size: var(--text-xs); color: var(--gray-400); font-weight: 400; margin-left: 4px; }
.label-unit { font-size: var(--text-xs); color: var(--primary); font-weight: 500; margin-left: 4px; }

/* Input group */
.input-group { display: flex; flex-direction: column; gap: var(--space-2); }
.input-group label { font-size: var(--text-sm); font-weight: 500; color: var(--gray-700); }
.input-group input {
  padding: 10px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-family: var(--font-family); color: var(--gray-800);
  background: var(--gray-50); outline: none; transition: all var(--transition-fast);
}
.input-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: #fff; }

.input-prefix { position: relative; display: flex; align-items: center; }
.prefix { position: absolute; left: 14px; color: var(--gray-500); font-weight: 500; pointer-events: none; }
.input-prefix input { padding-left: 28px; width: 100%; }

.input-with-action { display: flex; gap: var(--space-2); }
.input-with-action input { flex: 1; }

.btn-scan {
  display: flex; align-items: center; justify-content: center;
  width: 42px; min-width: 42px;
  border: 1px solid var(--primary); border-radius: var(--radius-md);
  background: var(--primary-light); color: var(--primary);
  cursor: pointer; transition: all var(--transition-fast);
}
.btn-scan:hover { background: var(--primary); color: #fff; }

/* Info box */
.info-box {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 14px; border-radius: var(--radius-md);
  background: #eff6ff; color: #1d4ed8;
  font-size: var(--text-xs); line-height: 1.5;
}

.form-error {
  padding: 8px 12px; border-radius: var(--radius-md);
  background: var(--danger-light); color: var(--danger); font-size: var(--text-sm);
}

.form-actions-stack { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-5); }

.btn-guardar {
  display: flex; align-items: center; justify-content: center; gap: var(--space-2);
  width: 100%; padding: 12px;
  background: var(--primary); color: #fff; border: none;
  border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600;
  font-family: var(--font-family); cursor: pointer; transition: all var(--transition-fast);
}
.btn-guardar:hover { background: var(--primary-dark); box-shadow: var(--shadow-md); }

.btn-cancelar-edit {
  background: transparent; border: 1px solid var(--gray-300); color: var(--gray-500);
  padding: 10px; border-radius: var(--radius-md); font-size: var(--text-xs);
  font-weight: 600; cursor: pointer; transition: all 0.15s;
}
.btn-cancelar-edit:hover { background: var(--gray-50); color: var(--gray-800); border-color: var(--gray-400); }

.input-readonly { background: var(--gray-200) !important; color: var(--gray-500); cursor: not-allowed; }

/* Product list */
.product-list { padding: var(--space-6); }

.list-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-4); }
.list-header .form-title { margin-bottom: 0; }

.filter-tabs { display: flex; gap: var(--space-1); }
.filter-tab {
  padding: 4px 12px; border: 1px solid var(--gray-200); border-radius: 999px;
  background: transparent; color: var(--gray-500); font-size: var(--text-xs);
  font-weight: 500; font-family: var(--font-family); cursor: pointer; transition: all 0.15s;
}
.filter-tab:hover { border-color: var(--primary); color: var(--primary); }
.filter-tab--active { background: var(--primary); border-color: var(--primary); color: #fff; }

.count-badge { background: var(--gray-200); color: var(--gray-600); font-size: var(--text-xs); font-weight: 600; padding: 2px 8px; border-radius: 999px; margin-left: auto; }

.mobile-products-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.product-mobile-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 20px;
  background: var(--surface-muted);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.product-mobile-card__head,
.product-mobile-card__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.product-mobile-card__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.product-mobile-card__copy strong {
  color: var(--gray-900);
  font-size: var(--text-base);
  line-height: 1.35;
}

.product-mobile-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mobile-meta-chip {
  padding: 12px 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.mobile-meta-chip span {
  display: block;
  color: var(--gray-500);
  font-size: var(--text-xs);
  font-weight: 700;
  margin-bottom: 4px;
}

.mobile-meta-chip strong {
  color: var(--gray-900);
  font-size: var(--text-base);
  font-weight: 800;
}

.product-mobile-card__actions {
  display: flex;
  gap: 8px;
}

.mobile-action-btn {
  border: none;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: var(--text-xs);
  font-weight: 800;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mobile-action-btn--edit {
  background: #dbeafe;
  color: #1d4ed8;
}

.mobile-action-btn--delete {
  background: #fee2e2;
  color: #dc2626;
}

/* Table */
.products-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.products-table thead th { text-align: left; font-size: var(--text-xs); font-weight: 600; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--gray-200); }
.products-table tbody tr { transition: background var(--transition-fast); }
.products-table tbody tr:hover { background: var(--gray-50); }
.products-table tbody td { padding: var(--space-3) var(--space-4); font-size: var(--text-sm); border-bottom: 1px solid var(--gray-100); color: var(--gray-700); }

.th-center { text-align: center !important; }
.td-center { text-align: center; }

.td-name  { font-weight: 500; color: var(--gray-800); }
.td-price { font-weight: 600; color: var(--success); }

.action-btns { display: flex; gap: 6px; justify-content: center; }
.btn-icon-act {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; border-radius: 6px;
  cursor: pointer; transition: all 0.15s;
}
.btn-edit { background: #dbeafe; color: #1d4ed8; }
.btn-edit:hover { background: #bfdbfe; }
.btn-delete { background: #fee2e2; color: #dc2626; }
.btn-delete:hover { background: #fecaca; }

code { background: var(--gray-100); padding: 2px 6px; border-radius: 4px; font-size: var(--text-xs); color: var(--gray-600); }
.code-internal { background: #fff7ed; color: #9a3412; }

.unit-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.unit-pza { background: #dbeafe; color: #1d4ed8; }
.unit-kg  { background: #dcfce7; color: #15803d; }
.unit-g   { background: #fef9c3; color: #854d0e; }

.stock-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: var(--text-xs); font-weight: 600; background: var(--success-light); color: var(--success-dark); }
.stock-low { background: var(--danger-light); color: var(--danger); }
.stock-na  { background: var(--gray-100); color: var(--gray-400); }

/* Empty state */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-8); color: var(--gray-400); gap: var(--space-2); text-align: center; }
.empty-state p { font-size: var(--text-lg); font-weight: 500; color: var(--gray-500); }
.empty-state span { font-size: var(--text-sm); }

/* Modales */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
.modal-confirm { background: #fff; border-radius: var(--radius-lg); width: 100%; max-width: 400px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: modalIn 0.2s ease; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

.modal-confirm-header h3 { font-size: var(--text-lg); font-weight: 700; color: var(--gray-800); margin-bottom: 12px; }
.modal-confirm-body { font-size: var(--text-sm); color: var(--gray-500); line-height: 1.6; margin-bottom: 24px; }
.modal-confirm-footer { display: flex; justify-content: flex-end; gap: var(--space-3); }

.btn-cancelar { padding: 9px 18px; border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: #fff; color: var(--gray-500); font-weight: 600; cursor: pointer; }
.btn-confirmar-borrar { padding: 9px 18px; border: none; border-radius: var(--radius-md); background: var(--danger); color: #fff; font-weight: 600; cursor: pointer; }
.btn-confirmar-borrar:hover { background: #dc2626; }

.table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }

@media (max-width: 1360px) {
  .productos-layout { grid-template-columns: 340px 1fr; }
}

@media (max-width: 1080px) {
  .productos-page { padding: var(--space-6); }
  .productos-layout { grid-template-columns: 1fr; }
}

@media (max-width: 820px) {
  .page-header {
    margin-bottom: var(--space-6);
  }

  .form-card,
  .product-list {
    padding: 18px;
    border-radius: 24px;
  }

  .form-title {
    font-size: var(--text-base);
    margin-bottom: var(--space-4);
  }

  .unit-selector {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .input-with-action {
    align-items: stretch;
  }

  .btn-scan {
    min-height: 44px;
  }

  .list-header {
    align-items: stretch;
  }

  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .filter-tab {
    white-space: nowrap;
  }

  .product-mobile-card__head,
  .product-mobile-card__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .product-mobile-card__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mobile-action-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .productos-page { padding: var(--space-4); }
  .productos-layout { grid-template-columns: 1fr; }
  .list-header { flex-direction: column; align-items: stretch; }
  .filter-tabs { overflow-x: auto; padding-bottom: 8px; }
  .filter-tab { white-space: nowrap; }
  .products-table { min-width: 700px; }
}

@media (max-width: 520px) {
  .product-mobile-card {
    padding: 14px;
  }

  .product-mobile-card__meta {
    grid-template-columns: 1fr;
  }

  .product-mobile-card__actions {
    grid-template-columns: 1fr;
  }
}
</style>
