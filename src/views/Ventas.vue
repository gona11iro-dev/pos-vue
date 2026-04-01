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
            placeholder="Buscar producto o codigo..."
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
        <!-- Product grid -->
        <div class="panel-productos">
          <div class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <span>Productos rapidos</span>
          </div>

          <div class="product-grid">
            <button
              v-for="p in productos"
              :key="p.barcode"
              class="product-btn"
              @click="agregar(p)"
            >
              <span class="product-name">{{ p.name }}</span>
              <span class="product-price">${{ p.price.toFixed(2) }}</span>
            </button>
          </div>
        </div>

        <!-- Cart -->
        <div class="panel-carrito">
          <div class="panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Venta actual</span>
            <span v-if="carrito.length" class="cart-badge">{{ carrito.length }}</span>
          </div>

          <!-- Cart items -->
          <div class="cart-items">
            <div v-if="!carrito.length" class="cart-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p>Carrito vacio</p>
              <span>Selecciona productos para comenzar</span>
            </div>

            <div
              v-for="item in carrito"
              :key="item.barcode"
              class="cart-item"
            >
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-unit-price">${{ item.price.toFixed(2) }} c/u</span>
              </div>

              <div class="item-qty">
                <button class="qty-btn" @click="menos(item)">-</button>
                <span class="qty-value">{{ item.qty }}</span>
                <button class="qty-btn" @click="mas(item)">+</button>
              </div>

              <span class="item-subtotal">${{ (item.qty * item.price).toFixed(2) }}</span>

              <button class="item-remove" @click="eliminar(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Cart footer -->
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

    <!-- Modal Pago -->
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

    <BarcodeScanner
      :visible="mostrarScanner"
      @update:visible="mostrarScanner = $event"
      @detected="onBarcodeDetected"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'

const productosStore = useProductosStore()
const ventasStore = useVentasStore()

const buscar = ref('')
const mostrarScanner = ref(false)
const scanMsg = ref('')
const scanMsgType = ref('success')
let scanMsgTimer = null

const productos = computed(() => {
  return productosStore.productos.map(p => ({
    barcode: p.barcode,
    name: p.name,
    price: Number(p.price) || 0
  }))
})

const carrito = ref([])

function mostrarFeedback(msg, type) {
  scanMsg.value = msg
  scanMsgType.value = type
  if (scanMsgTimer) clearTimeout(scanMsgTimer)
  scanMsgTimer = setTimeout(() => { scanMsg.value = '' }, 3000)
}

function onBarcodeDetected(code) {
  mostrarScanner.value = false

  const productoStore = productosStore.buscarPorCodigo(code)
  if (productoStore) {
    agregar({
      barcode: productoStore.barcode,
      name: productoStore.name,
      price: Number(productoStore.price) || 0
    })
    mostrarFeedback('Producto agregado: ' + productoStore.name, 'success')
    return
  }

  mostrarFeedback('Codigo "' + code + '" no encontrado. Registra el producto primero en Productos.', 'error')
}

function agregar(producto) {
  const existe = carrito.value.find(i => i.barcode === producto.barcode)
  if (existe) {
    existe.qty++
  } else {
    carrito.value.push({ ...producto, qty: 1 })
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

function mas(item) {
  item.qty++
}

function menos(item) {
  item.qty--
  if (item.qty <= 0) eliminar(item)
}

function eliminar(item) {
  carrito.value = carrito.value.filter(i => i.barcode !== item.barcode)
}

const total = computed(() => {
  return carrito.value.reduce((t, i) => t + i.price * i.qty, 0)
})

function cancelar() {
  carrito.value = []
}

// Lógica de Cobro / Modal
const mostrarPagar = ref(false)
const clienteNombre = ref('')
const metodoPago = ref('Efectivo')
const montoPagado = ref(0)

const cambio = computed(() => {
  return montoPagado.value - total.value
})

function abrirPagar() {
  if (!carrito.value.length) return
  clienteNombre.value = ''
  metodoPago.value = 'Efectivo'
  montoPagado.value = total.value
  mostrarPagar.value = true
}

function sumarMonto(cantidad) {
  // Opcional: si el monto pagado actual fue el "exacto" default, al dar un botón lo reseteamos primero para facilitar.
  if (montoPagado.value === total.value && cantidad !== 0) {
    montoPagado.value = 0
  }
  montoPagado.value += cantidad
}

async function cobrarFinal() {
  try {
    const saleTotal = total.value
    
    await ventasStore.registrarVenta(carrito.value, saleTotal, {
      client: clienteNombre.value,
      method: metodoPago.value,
      paidAmount: metodoPago.value === 'Efectivo' ? montoPagado.value : saleTotal,
      change: metodoPago.value === 'Efectivo' ? cambio.value : 0
    })
    
    mostrarFeedback(`Venta exitosa. Cambio dado: $${(metodoPago.value === 'Efectivo' ? cambio.value : 0).toFixed(2)}`, 'success')
    carrito.value = []
    mostrarPagar.value = false
  } catch (err) {
    console.error(err)
    mostrarFeedback('Ocurrió un error al registrar la venta.', 'error')
  }
}
</script>

<style scoped>
.ventas {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.ventas-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  background: var(--card-bg);
  border-bottom: 1px solid var(--gray-200);
}

.btn-escanear {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 16px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-escanear:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
}

.scan-feedback {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px var(--space-6);
  font-size: var(--text-sm);
  font-weight: 500;
  animation: fadeIn 0.2s ease;
}

.scan-feedback.success {
  background: var(--success-light);
  color: var(--success-dark);
}

.scan-feedback.error {
  background: var(--danger-light);
  color: var(--danger);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.ventas-header h1 {
  font-size: var(--text-xl);
  white-space: nowrap;
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  color: var(--gray-800);
  background: var(--gray-50);
  outline: none;
  transition: all var(--transition-fast);
}

.search-bar input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

/* Body */
.ventas-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Products panel */
.panel-productos {
  width: 45%;
  padding: var(--space-5);
  overflow-y: auto;
  border-right: 1px solid var(--gray-200);
  background: var(--content-bg);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
}

.cart-badge {
  background: var(--primary);
  color: #fff;
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: auto;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-3);
}

.product-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-3);
  background: var(--card-bg);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-family);
  box-shadow: var(--shadow-sm);
}

.product-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.product-btn:active {
  transform: translateY(0);
}

.product-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-800);
}

.product-price {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--primary);
}

/* Cart panel */
.panel-carrito {
  width: 55%;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
}

.panel-carrito > .panel-title {
  padding: var(--space-5) var(--space-5) 0;
}

/* Cart items */
.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-5);
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray-400);
  gap: var(--space-2);
  text-align: center;
}

.cart-empty p {
  font-size: var(--text-lg);
  font-weight: 500;
  color: var(--gray-500);
}

.cart-empty span {
  font-size: var(--text-sm);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  transition: background var(--transition-fast);
}

.cart-item:hover {
  background: var(--gray-100);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--gray-800);
}

.item-unit-price {
  font-size: var(--text-xs);
  color: var(--gray-500);
}

.item-qty {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.qty-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  color: var(--gray-700);
  cursor: pointer;
  font-size: var(--text-base);
  font-weight: 600;
  font-family: var(--font-family);
  transition: all var(--transition-fast);
}

.qty-btn:hover {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

.qty-value {
  min-width: 28px;
  text-align: center;
  font-weight: 600;
  font-size: var(--text-sm);
}

.item-subtotal {
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--gray-800);
  min-width: 70px;
  text-align: right;
}

.item-remove {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--gray-400);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.item-remove:hover {
  background: var(--danger-light);
  color: var(--danger);
}

/* Cart footer */
.cart-footer {
  padding: var(--space-5);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.total-label {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-600);
}

.total-value {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--gray-900);
}

.cart-actions {
  display: flex;
  gap: var(--space-3);
}

.btn-cobrar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 14px var(--space-6);
  background: var(--success);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-lg);
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cobrar:hover:not(:disabled) {
  background: var(--success-dark);
  box-shadow: var(--shadow-md);
}

.btn-cobrar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancelar {
  padding: 14px var(--space-5);
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancelar:hover:not(:disabled) {
  background: var(--danger-light);
}

.btn-cancelar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
}

.modal h2 {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: var(--space-5);
  text-align: center;
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--gray-700);
}

.input-modal {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-family);
}

.input-large {
  font-size: var(--text-xl);
  font-weight: bold;
}

.total-modal {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--primary);
  text-align: center;
  padding: var(--space-2);
  background: var(--gray-50);
  border-radius: var(--radius-md);
}

.method-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.btn-method {
  padding: 12px;
  border: 1px solid var(--gray-300);
  background: #fff;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-method:hover {
  background: var(--gray-50);
}

.btn-method.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary-dark);
}

.efectivo-section {
  padding-top: var(--space-2);
  border-top: 1px solid var(--gray-200);
  margin-top: var(--space-4);
}

.input-received-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  margin-bottom: var(--space-4);
}

.input-received-wrapper span {
  position: absolute;
  left: 12px;
  font-size: var(--text-lg);
  font-weight: bold;
  color: var(--gray-500);
}

.input-received-wrapper input {
  padding-left: 30px;
}

.btn-clear {
  padding: 10px 16px;
  border: 1px solid var(--gray-300);
  background: var(--gray-100);
  border-radius: var(--radius-md);
  font-weight: bold;
  cursor: pointer;
}

.btn-clear:hover {
  background: var(--gray-200);
}

.quick-cash {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  justify-content: center;
}

.btn-cash {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  color: #2e7d32;
  font-weight: bold;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  flex: 1 1 calc(33% - 10px);
  max-width: 100px;
  min-width: 70px;
}

.btn-cash.coin {
  background: #fff3e0;
  border-color: #ffe0b2;
  color: #e65100;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  flex: none;
  min-width: auto;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cash.exact {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary-dark);
  flex: 1 1 100%;
  max-width: 100%;
}

.btn-cash:hover {
  filter: brightness(0.95);
}

.cambio-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.cambio-ok {
  background: var(--success-light);
  color: var(--success-dark);
  border: 1px solid var(--success);
}

.cambio-falta {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid var(--danger);
}

.cambio-label {
  font-size: var(--text-base);
  font-weight: 600;
}

.cambio-value {
  font-size: var(--text-2xl);
  font-weight: bold;
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
</style>
