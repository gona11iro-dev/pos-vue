<template>
  <AppLayout>
    <div class="ventas">
      <!-- Header -->
      <div class="ventas-header">
        <h1>Punto de Venta</h1>
        <div class="search-bar">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="buscar"
            placeholder="Buscar producto o código..."
            @keyup.enter="agregarRapido"
          />
        </div>
        <button class="btn-escanear" @click="mostrarScanner = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Escanear
        </button>
      </div>

      <!-- Scan feedback -->
      <div v-if="scanMsg" class="scan-feedback" :class="scanMsgType">
        <svg v-if="scanMsgType === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ scanMsg }}
      </div>

      <div class="ventas-body">
        <!-- Panel de productos rápidos -->
        <div class="panel-productos">
          <div class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>Productos rápidos</span>
          </div>

          <div class="product-grid">
            <button
              v-for="p in productos"
              :key="p.barcode"
              class="product-btn"
              :class="{ 'product-btn--peso': p.unit === 'kg' || p.unit === 'g' }"
              @click="agregar(p)"
            >
              <span class="product-unit-tag" :class="`utag-${p.unit || 'pza'}`">
                {{ { pza: 'PZA', kg: 'KG' }[p.unit || 'pza'] ?? 'PZA' }}
              </span>
              <span class="product-name">{{ p.name }}</span>
              <span class="product-price">${{ p.price.toFixed(2) }}<small>/{{ p.unit === 'kg' ? 'kg' : 'pza' }}</small></span>
            </button>
          </div>
        </div>

        <!-- Carrito -->
        <div class="panel-carrito">
          <div class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Venta actual</span>
            <span v-if="carrito.length" class="cart-badge">{{ carrito.length }}</span>
          </div>

          <div class="cart-items">
            <div v-if="!carrito.length" class="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Carrito vacío</p>
              <span>Selecciona productos para comenzar</span>
            </div>

            <div v-for="item in carrito" :key="item._uid" class="cart-item">
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <!-- Precio unitario según tipo -->
                <span class="item-unit-price" v-if="item.unit === 'kg' || item.unit === 'g'">
                  ${{ item.price.toFixed(2) }} / {{ item.unit }}
                </span>
                <span class="item-unit-price" v-else>
                  ${{ item.price.toFixed(2) }} c/u
                </span>
              </div>

              <!-- Controles según tipo -->
              <!-- Pieza: botones +/- -->
              <div v-if="!item.unit || item.unit === 'pza'" class="item-qty">
                <button class="qty-btn" @click="menos(item)">-</button>
                <span class="qty-value">{{ item.qty }}</span>
                <button class="qty-btn" @click="mas(item)">+</button>
              </div>

              <!-- Peso: chip editable -->
              <button v-else class="peso-chip" @click="editarPeso(item)" title="Toca para corregir el peso">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {{ formatPeso(item.qty, item.unit) }}
              </button>

              <span class="item-subtotal">${{ (item.qty * item.price).toFixed(2) }}</span>

              <button class="item-remove" @click="eliminar(item)" title="Quitar este producto">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Footer del carrito -->
          <div class="cart-footer">
            <div class="cart-total">
              <span class="total-label">Total</span>
              <span class="total-value">${{ total.toFixed(2) }}</span>
            </div>
            <div class="cart-actions">
              <button class="btn-cobrar" :disabled="!carrito.length" @click="abrirPagar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Cobrar
              </button>
              <button class="btn-cancelar" :disabled="!carrito.length" @click="cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Modal de Peso ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="modalPeso.visible" class="modal-overlay" @click.self="modalPeso.visible = false">
        <div class="modal-peso">
          <div class="peso-header">
            <div>
              <p class="peso-titulo">{{ modalPeso.producto?.name }}</p>
              <p class="peso-subtitulo">
                ${{ modalPeso.producto?.price.toFixed(2) }} por {{ modalPeso.producto?.unit }}
                · Ingresa la cantidad
              </p>
            </div>
            <button class="btn-close-modal" @click="modalPeso.visible = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Display del valor -->
          <div class="peso-display">
            <span class="peso-valor">{{ modalPeso.pesoStr || '0' }}</span>
            <span class="peso-unidad">{{ modalPeso.producto?.unit }}</span>
          </div>

          <!-- Precio calculado en tiempo real -->
          <div class="peso-preview" :class="{ 'peso-preview--ok': pesoCalculado > 0 }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Subtotal: <strong>${{ pesoCalculado.toFixed(2) }}</strong>
          </div>

          <!-- Teclado numérico -->
          <div class="numpad">
            <button v-for="k in ['7','8','9','4','5','6','1','2','3','.','0','⌫']" :key="k" class="numpad-key" :class="{ 'key-dot': k === '.', 'key-del': k === '⌫' }" @click="numpadPress(k)">
              {{ k }}
            </button>
          </div>

          <div class="peso-footer">
            <button class="btn-peso-cancel" @click="modalPeso.visible = false">Cancelar</button>
            <button class="btn-peso-ok" :disabled="pesoCalculado <= 0" @click="confirmarPeso">
              Agregar · ${{ pesoCalculado.toFixed(2) }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Modal de Pago ────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="mostrarPagar" class="modal-overlay">
        <div class="modal">
          <h2>Detalles de Cobro</h2>

          <div class="form-group">
            <label>Cliente (Opcional)</label>
            <input type="text" v-model="clienteNombre" placeholder="Público en general" class="input-modal" />
          </div>

          <div class="form-group">
            <label>Total a Cobrar</label>
            <div class="total-modal">${{ total.toFixed(2) }}</div>
          </div>

          <div class="form-group">
            <label>Método de Pago</label>
            <div class="method-buttons">
              <button :class="['btn-method', metodoPago === 'Efectivo' ? 'active' : '']" @click="metodoPago = 'Efectivo'">
                💵 Efectivo
              </button>
              <button :class="['btn-method', metodoPago === 'Tarjeta' ? 'active' : '']" @click="metodoPago = 'Tarjeta'">
                💳 Tarjeta
              </button>
            </div>
          </div>

          <div v-if="metodoPago === 'Efectivo'" class="efectivo-section">
            <label>Monto Recibido</label>
            <div class="input-received-wrapper">
              <span>$</span>
              <input type="number" v-model="montoPagado" class="input-modal input-large" />
              <button class="btn-clear" @click="montoPagado = 0">Borrar</button>
            </div>

            <div class="quick-cash">
              <button class="btn-cash exact" @click="montoPagado = total">Exacto</button>
              <button class="btn-cash" @click="sumarMonto(1000)">$1000</button>
              <button class="btn-cash" @click="sumarMonto(500)">$500</button>
              <button class="btn-cash" @click="sumarMonto(200)">$200</button>
              <button class="btn-cash" @click="sumarMonto(100)">$100</button>
              <button class="btn-cash" @click="sumarMonto(50)">$50</button>
              <button class="btn-cash" @click="sumarMonto(20)">$20</button>
              <button class="btn-cash coin" @click="sumarMonto(10)">$10</button>
              <button class="btn-cash coin" @click="sumarMonto(5)">$5</button>
              <button class="btn-cash coin" @click="sumarMonto(2)">$2</button>
              <button class="btn-cash coin" @click="sumarMonto(1)">$1</button>
            </div>

            <div class="cambio-box" :class="cambio < 0 ? 'cambio-falta' : 'cambio-ok'">
              <span class="cambio-label">{{ cambio < 0 ? 'Falta cobrar:' : 'Cambio a devolver:' }}</span>
              <span class="cambio-value">${{ Math.abs(cambio).toFixed(2) }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-cancelar" @click="mostrarPagar = false">Cerrar</button>
            <button class="btn-cobrar" :disabled="metodoPago === 'Efectivo' && cambio < 0" @click="cobrarFinal">
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <BarcodeScanner
      :visible="mostrarScanner"
      @update:visible="mostrarScanner = $event"
      @detected="onBarcodeDetected"
    />
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'

const productosStore = useProductosStore()
const ventasStore    = useVentasStore()

const buscar         = ref('')
const mostrarScanner = ref(false)
const scanMsg        = ref('')
const scanMsgType    = ref('success')
let scanMsgTimer     = null

// ── Productos mapeados ────────────────────────────────────
const productos = computed(() =>
  productosStore.productos.map(p => ({
    barcode: p.barcode,
    name:    p.name,
    price:   Number(p.price) || 0,
    unit:    p.unit || 'pza',
  }))
)

// ── Carrito ───────────────────────────────────────────────
const carrito = ref([])

function mostrarFeedback(msg, type) {
  scanMsg.value     = msg
  scanMsgType.value = type
  if (scanMsgTimer) clearTimeout(scanMsgTimer)
  scanMsgTimer = setTimeout(() => { scanMsg.value = '' }, 3000)
}

function onBarcodeDetected(code) {
  mostrarScanner.value = false
  const p = productosStore.buscarPorCodigo(code)
  if (p) {
    agregar({ barcode: p.barcode, name: p.name, price: Number(p.price) || 0, unit: p.unit || 'pza' })
    mostrarFeedback('Producto agregado: ' + p.name, 'success')
    return
  }
  mostrarFeedback('Código "' + code + '" no encontrado. Registra el producto primero.', 'error')
}

// ── Agregar al carrito ────────────────────────────────────
function agregar(producto) {
  if (producto.unit === 'kg') {
    // Abrir modal de peso
    const existente = carrito.value.find(i => i.barcode === producto.barcode)
    modalPeso.producto = producto
    modalPeso.pesoStr  = ''
    modalPeso.editUid  = existente ? existente._uid : null
    modalPeso.visible  = true
    return
  }
  // Pieza → flujo normal
  const existe = carrito.value.find(i => i.barcode === producto.barcode)
  if (existe) {
    existe.qty++
  } else {
    carrito.value.push({ ...producto, qty: 1, _uid: `${producto.barcode}-${Date.now()}` })
  }
}

function agregarRapido() {
  const q = buscar.value.toLowerCase()
  const p = productos.value.find(
    p => p.name.toLowerCase().includes(q) || p.barcode.includes(buscar.value)
  )
  if (p) agregar(p)
  buscar.value = ''
}

function mas(item)   { item.qty++ }
function menos(item) {
  item.qty--
  if (item.qty <= 0) eliminar(item)
}
function eliminar(item) {
  carrito.value = carrito.value.filter(i => i._uid !== item._uid)
}

// ── Modal de Peso ─────────────────────────────────────────
const modalPeso = reactive({
  visible:  false,
  producto: null,
  pesoStr:  '',
  editUid:  null,       // si está editando un item ya existente
})

const pesoCalculado = computed(() => {
  const n = parseFloat(modalPeso.pesoStr || '0')
  if (!modalPeso.producto || isNaN(n) || n <= 0) return 0
  return modalPeso.producto.price * n
})

function numpadPress(k) {
  if (k === '⌫') {
    modalPeso.pesoStr = modalPeso.pesoStr.slice(0, -1)
    return
  }
  if (k === '.' && modalPeso.pesoStr.includes('.')) return
  if (modalPeso.pesoStr.length >= 8) return
  modalPeso.pesoStr += k
}

function confirmarPeso() {
  const peso = parseFloat(modalPeso.pesoStr)
  if (!peso || peso <= 0) return

  if (modalPeso.editUid) {
    // Editar entrada existente
    const item = carrito.value.find(i => i._uid === modalPeso.editUid)
    if (item) item.qty = peso
  } else {
    // Nueva entrada (peso siempre crea línea nueva si no existe, o reemplaza)
    const existe = carrito.value.find(i => i.barcode === modalPeso.producto.barcode)
    if (existe) {
      existe.qty = peso
    } else {
      carrito.value.push({
        ...modalPeso.producto,
        qty:  peso,
        _uid: `${modalPeso.producto.barcode}-${Date.now()}`,
      })
    }
  }
  modalPeso.visible = false
}

function editarPeso(item) {
  modalPeso.producto = { barcode: item.barcode, name: item.name, price: item.price, unit: item.unit }
  modalPeso.pesoStr  = String(item.qty)
  modalPeso.editUid  = item._uid
  modalPeso.visible  = true
}

function formatPeso(qty, unit) {
  const n = Number(qty)
  return `${n % 1 === 0 ? n : n.toFixed(3)} kg`
}

// ── Total ─────────────────────────────────────────────────
const total = computed(() =>
  carrito.value.reduce((t, i) => t + i.price * i.qty, 0)
)

function cancelar() { carrito.value = [] }

// ── Modal de Pago ─────────────────────────────────────────
const mostrarPagar   = ref(false)
const clienteNombre  = ref('')
const metodoPago     = ref('Efectivo')
const montoPagado    = ref(0)

const cambio = computed(() => montoPagado.value - total.value)

function abrirPagar() {
  if (!carrito.value.length) return
  clienteNombre.value = ''
  metodoPago.value    = 'Efectivo'
  montoPagado.value   = total.value
  mostrarPagar.value  = true
}

function sumarMonto(cantidad) {
  if (montoPagado.value === total.value && cantidad !== 0) montoPagado.value = 0
  montoPagado.value += cantidad
}

async function cobrarFinal() {
  try {
    const saleTotal = total.value
    await ventasStore.registrarVenta(carrito.value, saleTotal, {
      client:     clienteNombre.value,
      method:     metodoPago.value,
      paidAmount: metodoPago.value === 'Efectivo' ? montoPagado.value : saleTotal,
      change:     metodoPago.value === 'Efectivo' ? cambio.value : 0,
    })
    mostrarFeedback(`Venta exitosa. Cambio: $${(metodoPago.value === 'Efectivo' ? cambio.value : 0).toFixed(2)}`, 'success')
    carrito.value     = []
    mostrarPagar.value = false
  } catch (err) {
    console.error(err)
    mostrarFeedback('Ocurrió un error al registrar la venta.', 'error')
  }
}
</script>

<style scoped>
.ventas { height: 100vh; display: flex; flex-direction: column; }

/* Header */
.ventas-header {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  background: var(--card-bg); border-bottom: 1px solid var(--gray-200);
}
.ventas-header h1 { font-size: var(--text-xl); white-space: nowrap; }

.btn-escanear {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 10px 16px; background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600; font-family: var(--font-family);
  cursor: pointer; transition: all var(--transition-fast); white-space: nowrap;
}
.btn-escanear:hover { background: var(--primary-dark); box-shadow: var(--shadow-md); }

.scan-feedback {
  display: flex; align-items: center; gap: var(--space-2);
  padding: 10px var(--space-6); font-size: var(--text-sm); font-weight: 500;
  animation: fadeIn 0.2s ease;
}
.scan-feedback.success { background: var(--success-light); color: var(--success-dark); }
.scan-feedback.error   { background: var(--danger-light); color: var(--danger); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.search-bar { position: relative; flex: 1; max-width: 400px; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); pointer-events: none; }
.search-bar input {
  width: 100%; padding: 10px 14px 10px 40px;
  border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-family: var(--font-family);
  color: var(--gray-800); background: var(--gray-50); outline: none;
  transition: all var(--transition-fast);
}
.search-bar input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: #fff; }

/* Body */
.ventas-body { flex: 1; display: flex; overflow: hidden; }

/* Products panel */
.panel-productos { width: 45%; padding: var(--space-5); overflow-y: auto; border-right: 1px solid var(--gray-200); background: var(--content-bg); }
.panel-title { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-4); }
.cart-badge { background: var(--primary); color: #fff; font-size: var(--text-xs); padding: 2px 8px; border-radius: 999px; margin-left: auto; }

.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-3); }

.product-btn {
  position: relative; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  background: var(--card-bg); border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg); cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family); box-shadow: var(--shadow-sm);
}
.product-btn:hover { border-color: var(--primary); background: var(--primary-light); box-shadow: var(--shadow-md); transform: translateY(-1px); }
.product-btn:active { transform: translateY(0); }
.product-btn--peso { border-style: dashed; border-color: #6d28d9; }
.product-btn--peso:hover { border-color: #6d28d9; background: #ede9fe; }

.product-unit-tag {
  position: absolute; top: 6px; right: 6px;
  font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.05em;
}
.utag-pza { background: #dbeafe; color: #1d4ed8; }
.utag-kg  { background: #dcfce7; color: #15803d; }

.product-name  { font-size: var(--text-base); font-weight: 600; color: var(--gray-800); text-align: center; line-height: 1.3; }
.product-price { font-size: var(--text-sm); font-weight: 500; color: var(--primary); }
.product-price small { font-size: 10px; color: var(--gray-400); margin-left: 2px; }

/* Cart panel */
.panel-carrito { width: 55%; display: flex; flex-direction: column; background: var(--card-bg); }
.panel-carrito > .panel-title { padding: var(--space-5) var(--space-5) 0; }

.cart-items { flex: 1; overflow-y: auto; padding: var(--space-4) var(--space-5); }
.cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--gray-400); gap: var(--space-2); text-align: center; }
.cart-empty p { font-size: var(--text-lg); font-weight: 500; color: var(--gray-500); }
.cart-empty span { font-size: var(--text-sm); }

.cart-item { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-4); background: var(--gray-50); border-radius: var(--radius-md); margin-bottom: var(--space-2); transition: background var(--transition-fast); }
.cart-item:hover { background: var(--gray-100); }

.item-info { flex: 1; min-width: 0; }
.item-name { display: block; font-weight: 600; font-size: var(--text-sm); color: var(--gray-800); }
.item-unit-price { font-size: var(--text-xs); color: var(--gray-500); }

.item-qty { display: flex; align-items: center; gap: var(--space-1); }
.qty-btn { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gray-300); border-radius: var(--radius-sm); background: var(--card-bg); color: var(--gray-700); cursor: pointer; font-size: var(--text-base); font-weight: 600; font-family: var(--font-family); transition: all var(--transition-fast); }
.qty-btn:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
.qty-value { min-width: 28px; text-align: center; font-weight: 600; font-size: var(--text-sm); }

/* Chip de peso editable */
.peso-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 999px;
  background: #ede9fe; color: #6d28d9;
  border: 1px dashed #8b5cf6;
  font-size: var(--text-sm); font-weight: 700;
  font-family: var(--font-family); cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.peso-chip:hover { background: #ddd6fe; box-shadow: 0 0 0 2px #8b5cf6; }

.item-subtotal { font-weight: 700; font-size: var(--text-sm); color: var(--gray-800); min-width: 70px; text-align: right; }
.item-remove { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; border-radius: var(--radius-sm); background: transparent; color: var(--gray-400); cursor: pointer; transition: all var(--transition-fast); }
.item-remove:hover { background: var(--danger-light); color: var(--danger); }

/* Cart footer */
.cart-footer { padding: var(--space-5); border-top: 1px solid var(--gray-200); background: var(--gray-50); }
.cart-total { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); }
.total-label { font-size: var(--text-lg); font-weight: 600; color: var(--gray-600); }
.total-value { font-size: var(--text-3xl); font-weight: 700; color: var(--gray-900); }
.cart-actions { display: flex; gap: var(--space-3); }

.btn-cobrar { flex: 1; display: flex; align-items: center; justify-content: center; gap: var(--space-2); padding: 14px var(--space-6); background: var(--success); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-lg); font-weight: 600; font-family: var(--font-family); cursor: pointer; transition: all var(--transition-fast); }
.btn-cobrar:hover:not(:disabled) { background: var(--success-dark); box-shadow: var(--shadow-md); }
.btn-cobrar:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancelar { padding: 14px var(--space-5); background: transparent; color: var(--danger); border: 1px solid var(--danger); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: 600; font-family: var(--font-family); cursor: pointer; transition: all var(--transition-fast); }
.btn-cancelar:hover:not(:disabled) { background: var(--danger-light); }
.btn-cancelar:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal de Peso ─────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); }

.modal-peso {
  background: #fff; border-radius: 20px;
  width: 100%; max-width: 340px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.25);
  overflow: hidden; animation: popIn 0.2s ease;
}
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

.peso-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 18px 20px 12px; background: #f8f5ff; }
.peso-titulo { font-size: var(--text-lg); font-weight: 700; color: #3b0764; }
.peso-subtitulo { font-size: var(--text-xs); color: #7c3aed; margin-top: 2px; }
.btn-close-modal { border: none; background: transparent; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 6px; }
.btn-close-modal:hover { background: #e5e7eb; color: #374151; }

.peso-display {
  display: flex; align-items: baseline; justify-content: center;
  gap: 8px; padding: 18px 20px 8px;
  font-family: 'Courier New', monospace;
}
.peso-valor { font-size: 2.5rem; font-weight: 800; color: #1f2937; letter-spacing: -1px; min-width: 80px; text-align: right; }
.peso-unidad { font-size: 1.2rem; font-weight: 600; color: #7c3aed; }

.peso-preview {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px 20px 12px; font-size: var(--text-sm); color: var(--gray-400);
  transition: color 0.2s;
}
.peso-preview--ok { color: #15803d; }
.peso-preview strong { font-size: var(--text-base); }

/* Numpad */
.numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e5e7eb; border-top: 1px solid #e5e7eb; }
.numpad-key {
  padding: 18px; font-size: 1.3rem; font-weight: 600;
  background: #fff; border: none; cursor: pointer;
  transition: background 0.1s; font-family: var(--font-family);
}
.numpad-key:hover { background: #f3f4f6; }
.numpad-key:active { background: #e5e7eb; }
.key-del { color: #dc2626; font-size: 1rem; }
.key-dot { font-size: 1.5rem; }

.peso-footer {
  display: flex; gap: var(--space-3);
  padding: 14px 20px; border-top: 1px solid #e5e7eb;
  background: #fafafa;
}
.btn-peso-cancel {
  flex: 1; padding: 12px; border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  background: transparent; color: var(--gray-600); font-size: var(--text-sm);
  font-weight: 600; font-family: var(--font-family); cursor: pointer;
}
.btn-peso-cancel:hover { background: var(--gray-100); }
.btn-peso-ok {
  flex: 2; padding: 12px; border: none; border-radius: var(--radius-md);
  background: #7c3aed; color: #fff; font-size: var(--text-sm);
  font-weight: 700; font-family: var(--font-family); cursor: pointer;
  transition: all 0.15s;
}
.btn-peso-ok:hover:not(:disabled) { background: #6d28d9; }
.btn-peso-ok:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Modal de Pago ──────────────────── */
.modal { background: #fff; padding: var(--space-6); border-radius: var(--radius-lg); width: 100%; max-width: 500px; box-shadow: var(--shadow-lg); }
.modal h2 { font-size: var(--text-xl); font-weight: 700; margin-bottom: var(--space-5); text-align: center; }
.form-group { margin-bottom: var(--space-4); }
.form-group label { display: block; font-size: var(--text-sm); font-weight: 600; margin-bottom: var(--space-2); color: var(--gray-700); }
.input-modal { width: 100%; padding: 10px 14px; border: 1px solid var(--gray-300); border-radius: var(--radius-md); font-size: var(--text-base); font-family: var(--font-family); }
.input-large { font-size: var(--text-xl); font-weight: bold; }
.total-modal { font-size: var(--text-3xl); font-weight: 800; color: var(--primary); text-align: center; padding: var(--space-2); background: var(--gray-50); border-radius: var(--radius-md); }
.method-buttons { display: flex; gap: var(--space-3); }
.btn-method { flex: 1; padding: 12px; border: 2px solid var(--gray-200); border-radius: var(--radius-md); background: var(--gray-50); font-size: var(--text-sm); font-weight: 600; font-family: var(--font-family); cursor: pointer; transition: all var(--transition-fast); }
.btn-method.active { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
.efectivo-section { margin-top: var(--space-4); }
.efectivo-section label { display: block; font-size: var(--text-sm); font-weight: 600; margin-bottom: var(--space-2); color: var(--gray-700); }
.input-received-wrapper { display: flex; align-items: center; gap: var(--space-2); }
.input-received-wrapper span { font-size: var(--text-xl); font-weight: 700; color: var(--gray-700); }
.btn-clear { padding: 8px 14px; border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: transparent; font-size: var(--text-sm); font-family: var(--font-family); cursor: pointer; }
.quick-cash { display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3); }
.btn-cash { padding: 8px 12px; border: 1px solid var(--gray-200); border-radius: var(--radius-md); background: var(--gray-50); font-size: var(--text-sm); font-weight: 600; font-family: var(--font-family); cursor: pointer; transition: all var(--transition-fast); }
.btn-cash:hover { background: var(--primary-light); border-color: var(--primary); color: var(--primary); }
.btn-cash.exact { background: var(--success-light); border-color: var(--success); color: var(--success-dark); }
.btn-cash.coin { background: var(--gray-100); }
.cambio-box { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); border-radius: var(--radius-md); margin-top: var(--space-4); }
.cambio-ok { background: var(--success-light); }
.cambio-falta { background: var(--danger-light); }
.cambio-label { font-size: var(--text-sm); font-weight: 600; color: var(--gray-700); }
.cambio-value { font-size: var(--text-2xl); font-weight: 800; color: var(--gray-900); }
.modal-actions { display: flex; gap: var(--space-3); margin-top: var(--space-5); }
</style>
