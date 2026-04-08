<template>
  <AppLayout>
    <div class="ventas-wrapper" :class="{ 'is-mobile-ui': isMobileView }">
      
      <!-- Scan feedback global -->
      <div v-if="scanMsg" class="scan-feedback" :class="scanMsgType">
        <svg v-if="scanMsgType === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ scanMsg }}
      </div>

      <!-- ==========================================
           VISTA MÓVIL (APK / TABLET)
           ========================================== -->
      <div v-if="isMobileView" class="mobile-layout" :class="{ 'mobile-layout--ticket-open': carrito.length > 0 }">
        <!-- Header: Stats del día -->
        <div class="m-header">
          <div class="m-store-info">
            <span class="m-badge">Tiendita Gudi</span>
            <h3>Hola, {{ currentUsername }}</h3>
          </div>
          <div class="m-stats-row">
            <div class="m-stat m-stat--primary">
              <span class="m-stat-label">Ventas Hoy</span>
              <span class="m-stat-val">${{ totalVentasHoy.toFixed(0) }}</span>
            </div>
            <div class="m-stat m-stat--success">
              <span class="m-stat-label">Total en Caja</span>
              <span class="m-stat-val">${{ totalVentasHoy.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Buscador y Scanner -->
        <div class="m-controls">
          <div class="m-search-box">
            <input v-model="buscar" placeholder="Buscar producto..." @keyup.enter="agregarRapido" />
            <button class="m-scan-btn" @click="mostrarScanner = true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h2v2H7zm0 8h2v2H7zm8-8h2v2h-2zm0 8h2v2h-2zm-4-4h2v2h-2z"/></svg>
            </button>
          </div>
        </div>

        <!-- Grid de Productos -->
        <div class="m-products">
          <button v-for="p in productosFiltrados" :key="p.barcode" class="m-p-card" @click="agregar(p)">
            <span class="m-p-name">{{ p.name }}</span>
            <div class="m-p-price-row">
              <span class="m-p-price">${{ p.price.toFixed(0) }}</span>
              <span v-if="p.unit === 'kg'" class="m-p-unit">/kg</span>
            </div>
          </button>
          <div v-if="!productosFiltrados.length" class="empty-state">No se encontraron productos.</div>
        </div>

        <!-- Panel de Ticket (Flotante Expansivo) -->
        <div v-if="carrito.length > 0" class="m-ticket-panel">
          <div class="m-ticket-header">
            <h4>Agregar al Ticket</h4>
          </div>
          <div class="m-ticket-items">
            <div v-for="item in carrito" :key="item._uid" class="m-ticket-item">
              <div class="m-item-details">
                <span class="m-item-qty">{{ item.unit === 'kg' ? formatPeso(item.qty) : item.qty + 'x' }}</span>
                <span class="m-item-name">{{ item.name }}</span>
              </div>
              <div class="m-item-right">
                <span class="m-item-price">${{ (item.qty * item.price).toFixed(2) }}</span>
                <button class="m-item-del" @click="eliminar(item)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6L18.1 19.5c-.1 1.4-1.2 2.5-2.6 2.5H8.5c-1.4 0-2.5-1.1-2.6-2.5L5 6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="m-ticket-summary">
            <strong>Total: ${{ totalCarrito.toFixed(2) }}</strong>
          </div>
          <div class="m-ticket-actions">
            <button class="m-btn-pay" @click="abrirPagar">Cobrar</button>
            <button class="m-btn-clear" @click="cancelar">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- ==========================================
           VISTA ESCRITORIO (WINDOWS / WEB)
           ========================================== -->
      <div v-else class="desktop-layout">
        <div class="pc-toolbar">
          <div class="pc-toolbar__copy">
            <span class="pc-kicker">Caja</span>
            <h1>Caja Tiendita</h1>
            <p>Busca un producto y agrégalo al ticket sin pasos extra.</p>
          </div>
          <div class="pc-toolbar__actions">
            <div class="pc-search">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="buscar" placeholder="Buscar por nombre o código..." @keyup.enter="agregarRapido" />
            </div>
            <button class="pc-scan-btn" @click="mostrarScanner = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Escáner
            </button>
          </div>
        </div>

        <div class="pc-body">
          <section class="pc-products-section">
            <div class="pc-section-header">
              <div class="pc-section-text">
                <div class="pc-section-title">Catálogo disponible</div>
                <p>Haz clic sobre cualquier tarjeta para agregar al ticket.</p>
              </div>
              <span class="pc-product-count">{{ productosFiltrados.length }} productos</span>
            </div>

            <div v-if="productosFiltrados.length" class="pc-grid">
              <article v-for="p in productosFiltrados" :key="p.barcode" class="pc-p-card">
                <div class="pc-p-top">
                  <span class="pc-p-unit" :class="{ 'pc-p-unit--weight': p.unit === 'kg' }">{{ p.unit === 'kg' ? 'Peso' : 'Pieza' }}</span>
                  <span class="pc-p-code">{{ String(p.barcode).startsWith('INT-') ? 'Interno' : String(p.barcode).slice(-4) }}</span>
                </div>
                <span class="pc-p-name">{{ p.name }}</span>
                <div class="pc-p-footer">
                  <span class="pc-p-price">${{ p.price.toFixed(2) }} <small v-if="p.unit === 'kg'">/kg</small></span>
                  <button class="pc-p-add-btn" @click="agregar(p)">Agregar</button>
                </div>
              </article>
            </div>
            <div v-else class="pc-empty-state">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              No encontramos productos con esa búsqueda.
            </div>
          </section>

          <aside class="pc-cart-section">
            <div class="pc-ticket-shell">
              <div class="pc-section-header pc-section-header--ticket">
                <div class="pc-section-text">
                  <div class="pc-section-title">Venta actual</div>
                  <p>Ticket en preparación</p>
                </div>
                <span class="pc-ticket-chip">{{ carrito.length }} productos</span>
              </div>

              <div class="pc-cart-list">
                <div v-if="!carrito.length" class="pc-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  El carrito está vacío
                </div>
                <div v-for="item in carrito" :key="item._uid" class="pc-cart-item">
                  <div class="pc-item-info">
                    <strong>{{ item.name }}</strong>
                    <span v-if="item.unit === 'kg'">${{ item.price.toFixed(2) }} /kg</span>
                    <span v-else>${{ item.price.toFixed(2) }} c/u</span>
                  </div>

                  <div v-if="item.unit === 'kg'" class="pc-item-weight">
                    <button class="peso-chip" @click="editarPeso(item)">{{ formatPeso(item.qty) }}</button>
                  </div>
                  <div v-else class="pc-item-qty">
                    <button @click="menos(item)">-</button>
                    <span>{{ item.qty }}</span>
                    <button @click="mas(item)">+</button>
                  </div>

                  <div class="pc-item-subtotal">${{ (item.qty * item.price).toFixed(2) }}</div>
                  <button class="pc-item-del" @click="eliminar(item)">×</button>
                </div>
              </div>

              <div class="pc-cart-footer">
                <div class="pc-ticket-summary" v-if="carrito.length">
                  <div class="pc-summary-line">
                    <span>Artículos</span>
                    <strong>{{ totalArticulos }}</strong>
                  </div>
                  <div class="pc-summary-line">
                    <span>Productos distintos</span>
                    <strong>{{ carrito.length }}</strong>
                  </div>
                  <div class="pc-summary-line pc-summary-line--total">
                    <span>Total</span>
                    <strong>${{ totalCarrito.toFixed(2) }}</strong>
                  </div>
                </div>
                <div class="pc-actions">
                  <button class="pc-btn-pay" :disabled="!carrito.length" @click="abrirPagar">Cobrar</button>
                  <button class="pc-btn-cancel" @click="cancelar" :disabled="!carrito.length">Cancelar</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

    </div>

    <!-- Modales (Compartidos) -->
    <Teleport to="body">
      <!-- Modal Pago Completo -->
      <div v-if="mostrarPagar" class="modal-overlay" @click.self="mostrarPagar = false">
        <div class="modal-card modal-pago">
          <h2>Detalles de Cobro</h2>
          <div class="form-group">
            <label>Cliente (Opcional)</label>
            <input type="text" v-model="clienteNombre" placeholder="Público en general" class="input-modal" />
          </div>

          <div class="p-total">${{ totalCarrito.toFixed(2) }}</div>
          
          <div class="p-form">
            <label>Efectivo Recibido:</label>
            <div class="input-received-wrapper">
              <span>$</span>
              <input type="number" v-model.number="montoRecibido" class="p-input" autofocus @keyup.enter="confirmarPago" />
              <button class="btn-clear-input" @click="montoRecibido = 0">Limpiar</button>
            </div>
            
            <div class="quick-cash-container">
              <div class="subtitle-cash">Billetes</div>
              <div class="quick-cash">
                <button class="btn-cash" @click="sumarMonto(1000)">$1000</button>
                <button class="btn-cash" @click="sumarMonto(500)">$500</button>
                <button class="btn-cash" @click="sumarMonto(200)">$200</button>
                <button class="btn-cash" @click="sumarMonto(100)">$100</button>
                <button class="btn-cash" @click="sumarMonto(50)">$50</button>
                <button class="btn-cash" @click="sumarMonto(20)">$20</button>
              </div>

              <div class="subtitle-cash mt-2">Monedas / Exacto</div>
              <div class="quick-cash">
                <button class="btn-cash exact" @click="montoRecibido = totalCarrito">Exacto</button>
                <button class="btn-cash" @click="sumarMonto(10)">$10</button>
                <button class="btn-cash" @click="sumarMonto(5)">$5</button>
                <button class="btn-cash" @click="sumarMonto(2)">$2</button>
                <button class="btn-cash" @click="sumarMonto(1)">$1</button>
                <button class="btn-cash" @click="sumarMonto(0.50)">50¢</button>
              </div>
            </div>
          </div>
          
          <div class="modal-cambio" :class="{ 'error': montoRecibidoNumero < totalCarrito }">
            {{ montoRecibidoNumero < totalCarrito ? 'Falta cobrar:' : 'Cambio a devolver:' }} ${{ Math.abs(montoRecibidoNumero - totalCarrito).toFixed(2) }}
          </div>
          
          <div class="modal-footer">
            <button class="btn-cancelar" @click="mostrarPagar = false">Cerrar</button>
            <button class="btn-success" :disabled="montoRecibidoNumero < totalCarrito" @click="confirmarPago">Completar Venta</button>
          </div>
        </div>
      </div>

      <!-- Modal Peso -->
      <div v-if="modalPeso.visible" class="modal-overlay" @click.self="modalPeso.visible = false">
        <div class="modal-card modal-peso-card">
          <div class="peso-header">
            <div>
              <h3>{{ modalPeso.producto?.name }}</h3>
              <span>${{ modalPeso.producto?.price.toFixed(2) }} por {{ modalPeso.producto?.unit }}</span>
            </div>
          </div>
          <div class="weight-display">
            <span class="w-val">{{ modalPeso.pesoStr || '0' }}</span>
            <span class="w-unit">{{ modalPeso.producto?.unit }}</span>
          </div>
          <div class="weight-preview" :class="{'ok': pesoCalculado > 0}">Subtotal: ${{ pesoCalculado.toFixed(2) }}</div>
          <div class="numpad">
            <button v-for="k in ['7','8','9','4','5','6','1','2','3','.','0','⌫']" :key="k" @click="numpadPress(k)" :class="{'del-key': k === '⌫'}">{{ k }}</button>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar" @click="modalPeso.visible = false">Cancelar</button>
            <button class="btn-primary" @click="confirmarPeso" :disabled="pesoCalculado <= 0">Confirmar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <BarcodeScanner :visible="mostrarScanner" @update:visible="mostrarScanner = $event" @detected="onBarcodeDetected" />
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import BarcodeScanner from '../components/BarcodeScanner.vue'
import { useAuthStore } from '../stores/auth'
import { useProductosStore } from '../stores/productos'
import { useVentasStore } from '../stores/ventas'

const auth = useAuthStore()
const productosStore = useProductosStore()
const ventasStore = useVentasStore()

// Detección robusta de dispositivo
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)
const isMobileView = computed(() => windowWidth.value <= 820 || windowHeight.value <= 520)

function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const currentUsername = computed(() => auth.username)

// Feedback de Escaneo
const scanMsg = ref('')
const scanMsgType = ref('success')
let scanMsgTimer = null
function mostrarFeedback(msg, type = 'success') {
  scanMsg.value = msg
  scanMsgType.value = type
  if (scanMsgTimer) clearTimeout(scanMsgTimer)
  scanMsgTimer = setTimeout(() => { scanMsg.value = '' }, 3000)
}

// Datos y Búsqueda

const totalVentasHoy = computed(() => {
  const lista = ventasStore.ventas || []
  return lista.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
})

const listaProductos = computed(() => {
  const lista = productosStore.productos || []
  return lista.map(p => ({
    barcode: p.barcode,
    name: p.name,
    price: Number(p.price) || 0,
    unit: p.unit || 'pza'
  }))
})

const productosFiltrados = computed(() => {
  const q = buscar.value.trim().toLowerCase()
  if (!q) return listaProductos.value
  return listaProductos.value.filter(p => p.name.toLowerCase().includes(q) || String(p.barcode).includes(q))
})

// Carrito
const buscar = ref('')
const carrito = ref([])
const totalCarrito = computed(() => carrito.value.reduce((sum, i) => sum + (i.price * i.qty), 0))
const totalArticulos = computed(() => carrito.value.reduce((sum, i) => sum + (i.unit === 'kg' ? 1 : i.qty), 0))

const mostrarScanner = ref(false)
const mostrarPagar = ref(false)
const montoRecibido = ref(0)
const clienteNombre = ref('')
const montoRecibidoNumero = computed(() => Number(montoRecibido.value) || 0)

// Peso Modal Avanzado
const modalPeso = reactive({ visible: false, producto: null, pesoStr: '', editUid: null })
const pesoCalculado = computed(() => (parseFloat(modalPeso.pesoStr) || 0) * (modalPeso.producto?.price || 0))

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await productosStore.cargarProductos()
  await ventasStore.cargarVentas()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// ── Acciones de Venta ─────────────────────────────────
function agregar(p) {
  if (p.unit === 'kg') {
    modalPeso.producto = p
    modalPeso.pesoStr = ''
    modalPeso.editUid = null
    modalPeso.visible = true
    return
  }
  const existe = carrito.value.find(i => i.barcode === p.barcode)
  if (existe) {
    existe.qty++
  } else {
    carrito.value.push({ ...p, qty: 1, _uid: `${p.barcode}-${Date.now()}` })
  }
}

function agregarRapido() {
  const q = buscar.value.trim().toLowerCase()
  if (!q) return
  const p = listaProductos.value.find(p => String(p.barcode) === buscar.value || p.name.toLowerCase() === q)
  if (p) {
    agregar(p)
    buscar.value = ''
    mostrarFeedback(`Añadido: ${p.name}`)
  } else {
    mostrarFeedback('Producto no encontrado', 'error')
  }
}

function mas(item) { item.qty++ }
function menos(item) { 
  item.qty--
  if (item.qty <= 0) eliminar(item)
}
function eliminar(item) {
  carrito.value = carrito.value.filter(i => i._uid !== item._uid)
}
function cancelar() {
  carrito.value = []
  buscar.value = ''
}

// ── Modal de Peso ─────────────────────────────────
function formatPeso(qty) { return `${Number(qty).toFixed(3)} kg` }

function editarPeso(item) {
  modalPeso.producto = { ...item }
  modalPeso.pesoStr = String(item.qty)
  modalPeso.editUid = item._uid
  modalPeso.visible = true
}

function numpadPress(k) {
  if (k === '⌫') modalPeso.pesoStr = modalPeso.pesoStr.slice(0, -1)
  else if (k === '.' && modalPeso.pesoStr.includes('.')) return
  else modalPeso.pesoStr += k
}

function confirmarPeso() {
  const peso = parseFloat(modalPeso.pesoStr)
  if (peso > 0) {
    if (modalPeso.editUid) {
      const item = carrito.value.find(i => i._uid === modalPeso.editUid)
      if (item) item.qty = peso
    } else {
      const existe = carrito.value.find(i => i.barcode === modalPeso.producto.barcode)
      if (existe) existe.qty = peso
      else carrito.value.push({ ...modalPeso.producto, qty: peso, _uid: `${modalPeso.producto.barcode}-${Date.now()}` })
    }
    modalPeso.visible = false
  }
}

// ── Escáner y Pago ─────────────────────────────────
function onBarcodeDetected(code) {
  mostrarScanner.value = false
  if (!code) return
  const p = listaProductos.value.find(prod => String(prod.barcode).trim() === String(code).trim())
  if (p) {
    agregar(p)
    mostrarFeedback(`Escaneado: ${p.name}`)
  } else {
    mostrarFeedback(`Código "${code}" desconocido`, 'error')
  }
}

function abrirPagar() {
  clienteNombre.value = ''
  montoRecibido.value = totalCarrito.value
  mostrarPagar.value = true
}

function sumarMonto(cantidad) {
  if (montoRecibidoNumero.value === totalCarrito.value && cantidad !== 0) montoRecibido.value = 0
  montoRecibido.value = montoRecibidoNumero.value + cantidad
}

async function confirmarPago() {
  if (!carrito.value.length) return
  if (montoRecibidoNumero.value < totalCarrito.value) return

  try {
    await ventasStore.registrarVenta(carrito.value, totalCarrito.value, {
      client: clienteNombre.value,
      method: 'Efectivo',
      paidAmount: montoRecibidoNumero.value,
      change: montoRecibidoNumero.value - totalCarrito.value
    })
    mostrarFeedback(`Venta exitosa. Cambio: $${(montoRecibidoNumero.value - totalCarrito.value).toFixed(2)}`)
    carrito.value = []
    buscar.value = ''
    clienteNombre.value = ''
    montoRecibido.value = 0
    mostrarPagar.value = false
  } catch (error) {
    mostrarFeedback('Error al procesar la venta', 'error')
  }
}
</script>

<style scoped>
.ventas-wrapper { min-height: 100%; background: #f8fafc; position: relative; }

/* --- Notificaciones --- */
.scan-feedback {
  position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 3000; display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 999px; color: #fff; font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1); animation: slideDown 0.3s ease;
}
.scan-feedback.success { background: #16a34a; }
.scan-feedback.error { background: #dc2626; }
@keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }

/* --- VISTA PC --- */
.desktop-layout { display: flex; flex-direction: column; gap: 18px; min-height: 100%; padding: 26px; }
.pc-toolbar,
.pc-products-section,
.pc-ticket-shell { border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 28px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); }
.pc-kicker { display: inline-flex; margin-bottom: 8px; color: var(--primary-ink); font-size: var(--text-xs); font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.pc-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; padding: 22px; }
.pc-toolbar__copy h1 { font-size: 1.95rem; letter-spacing: -0.05em; }
.pc-toolbar__copy p { margin-top: 6px; color: var(--gray-500); line-height: 1.55; }
.pc-toolbar__actions { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; justify-content: flex-end; }
.pc-search { position: relative; flex: 1; max-width: 560px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 16px; color: #94a3b8; }
.pc-search input { width: 100%; padding: 14px 16px 14px 42px; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 18px; background: var(--surface-muted); font-size: 1rem; color: #334155; }
.pc-search input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
.pc-scan-btn { display: flex; align-items: center; gap: 8px; padding: 14px 18px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; border: none; border-radius: 18px; font-weight: 700; cursor: pointer; box-shadow: 0 18px 30px rgba(37, 99, 235, 0.22); }
.pc-scan-btn:hover { transform: translateY(-1px); }

.pc-body { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.85fr); gap: 18px; flex: 1; min-height: 0; }
.pc-products-section { padding: 22px; overflow-y: auto; }
.pc-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.pc-section-header--ticket { margin-bottom: 0; padding-bottom: 16px; border-bottom: 1px solid rgba(148, 163, 184, 0.16); }
.pc-section-title { font-size: 0.9rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; }
.pc-section-text p { margin-top: 6px; color: var(--gray-500); font-size: var(--text-sm); }
.pc-product-count { display: inline-flex; align-items: center; padding: 8px 12px; border-radius: 999px; background: rgba(37, 99, 235, 0.08); color: var(--primary-ink); font-size: var(--text-xs); font-weight: 800; white-space: nowrap; }

.pc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 14px; }
.pc-p-card { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 22px; background: var(--surface-muted); border: 1px solid rgba(148, 163, 184, 0.14); text-align: left; transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease; }
.pc-p-card:hover { transform: translateY(-2px); border-color: rgba(37, 99, 235, 0.24); box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08); }
.pc-p-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pc-p-unit,
.pc-p-code,
.pc-ticket-chip { display: inline-flex; align-items: center; border-radius: 999px; font-size: var(--text-xs); font-weight: 800; }
.pc-p-unit { padding: 6px 10px; background: rgba(37, 99, 235, 0.08); color: var(--primary-ink); }
.pc-p-unit--weight { background: rgba(15, 118, 110, 0.1); color: var(--teal); }
.pc-p-code { padding: 6px 10px; background: rgba(51, 65, 85, 0.08); color: #475569; }
.pc-p-name { display: block; min-height: 2.6em; font-weight: 700; font-size: 0.96rem; color: #1e293b; line-height: 1.35; }
.pc-p-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: auto; }
.pc-p-price { display: block; color: #2563eb; font-weight: 800; font-size: 1.05rem; }
.pc-p-price small { color: #64748b; font-size: 0.75rem; font-weight: 600; }
.pc-p-add-btn { border: none; border-radius: 14px; padding: 10px 14px; background: linear-gradient(135deg, #65a30d, #4d7c0f); color: #fff; font-weight: 800; cursor: pointer; box-shadow: 0 12px 24px rgba(101, 163, 13, 0.22); }
.pc-p-add-btn:hover { transform: translateY(-1px); }
.pc-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 220px; border-radius: 24px; background: var(--surface-muted); color: var(--gray-500); border: 1px dashed rgba(148, 163, 184, 0.22); }

.pc-cart-section { min-height: 0; }
.pc-ticket-shell { height: 100%; padding: 22px; display: flex; flex-direction: column; }
.pc-ticket-chip { padding: 8px 12px; background: rgba(37, 99, 235, 0.08); color: var(--primary-ink); }
.pc-cart-list { flex: 1; padding: 18px 0; overflow-y: auto; }
.pc-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 1.05rem; gap: 10px; font-weight: 600; }
.pc-cart-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: var(--surface-muted); border: 1px solid rgba(148, 163, 184, 0.12); border-radius: 18px; margin-bottom: 10px; }
.pc-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.pc-item-info strong { color: #0f172a; font-size: 0.95rem; }
.pc-item-info span { color: #64748b; font-size: 0.8rem; }
.pc-item-qty { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid rgba(148, 163, 184, 0.18); border-radius: 12px; padding: 2px; }
.pc-item-qty button { width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; font-size: 1.2rem; font-weight: 600; color: #475569; border-radius: 10px; }
.pc-item-qty button:hover { background: #f1f5f9; }
.pc-item-qty span { font-weight: 700; min-width: 20px; text-align: center; color: #0f172a; }
.pc-item-subtotal { min-width: 90px; text-align: right; font-weight: 800; font-size: 1.05rem; color: #0f172a; }
.pc-item-del { border: none; background: transparent; color: #94a3b8; font-size: 1.5rem; cursor: pointer; padding: 5px; }
.pc-item-del:hover { color: #ef4444; }
.peso-chip { padding: 8px 12px; border-radius: 12px; background: #f3e8ff; border: 1px dashed #a855f7; color: #7e22ce; font-weight: 700; cursor: pointer; }

.pc-cart-footer { padding-top: 18px; border-top: 1px solid rgba(148, 163, 184, 0.16); }
.pc-ticket-summary { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.pc-summary-line { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 16px; background: var(--surface-muted); border: 1px solid rgba(148, 163, 184, 0.14); }
.pc-summary-line span { color: var(--gray-500); font-size: var(--text-sm); font-weight: 700; }
.pc-summary-line strong { color: var(--gray-900); font-size: 1.05rem; font-weight: 800; }
.pc-summary-line--total strong { font-family: var(--font-display); font-size: 1.55rem; }
.pc-actions { display: flex; gap: 15px; }
.pc-btn-pay { flex: 2; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; border: none; padding: 18px; border-radius: 18px; font-weight: 800; font-size: 1.15rem; cursor: pointer; box-shadow: 0 18px 30px rgba(22, 163, 74, 0.2); }
.pc-btn-pay:hover:not(:disabled) { transform: translateY(-1px); }
.pc-btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }
.pc-btn-cancel { flex: 1; background: #fff; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 18px; border-radius: 18px; font-weight: 700; font-size: 1rem; cursor: pointer; }
.pc-btn-cancel:hover:not(:disabled) { background: #fef2f2; }
.pc-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; border-color: #cbd5e1; color: #94a3b8; }

/* --- VISTA MÓVIL --- */
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overflow-y: auto;
  padding-bottom: 24px;
  background: #f8fafc;
}

.mobile-layout--ticket-open {
  padding-bottom: calc(min(48dvh, 420px) + 28px);
}

.m-header { padding: 20px; background: #fff; border-bottom: 1px solid #e2e8f0; }
.m-badge { background: #dbeafe; color: #1d4ed8; padding: 6px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
.m-header h3 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-top: 10px; }
.m-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 15px; }
.m-stat { flex: 1; padding: 15px; border-radius: 16px; color: #fff; display: flex; flex-direction: column; gap: 5px; }
.m-stat--primary { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.m-stat--success { background: linear-gradient(135deg, #22c55e, #16a34a); }
.m-stat-label { font-size: 0.75rem; font-weight: 600; opacity: 0.9; }
.m-stat-val { font-size: 1.25rem; font-weight: 800; }

.m-controls { padding: 15px 20px; background: #fff; }
.m-search-box { display: flex; align-items: center; gap: 10px; background: #f1f5f9; border-radius: 12px; padding: 5px 5px 5px 15px; border: 1px solid #e2e8f0; }
.m-search-box input { flex: 1; border: none; background: transparent; padding: 12px 0; font-size: 1rem; font-weight: 600; outline: none; color: #334155; }
.m-search-box input::placeholder { color: #94a3b8; font-weight: 500; }
.m-scan-btn { background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; color: #334155; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

.m-cats { display: flex; gap: 8px; overflow-x: auto; margin-top: 15px; padding-bottom: 5px; scrollbar-width: none; }
.m-cat-pill { padding: 8px 16px; background: #f1f5f9; border: 1px solid transparent; border-radius: 20px; font-weight: 600; font-size: 0.85rem; color: #475569; white-space: nowrap; }
.m-cat-pill--active { background: #2563eb; color: #fff; }

.m-products { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; padding: 15px 20px; }
.m-p-card { background: #fff; border-radius: 12px; padding: 12px 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 90px; }
.m-p-name { font-size: 0.8rem; font-weight: 700; color: #1e293b; line-height: 1.2; margin-bottom: 6px; }
.m-p-price-row { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.m-p-price { font-size: 0.95rem; font-weight: 800; color: #2563eb; }
.m-p-unit { font-size: 0.7rem; color: #64748b; font-weight: 600; }
.empty-state { grid-column: 1 / -1; text-align: center; padding: 30px; color: #94a3b8; font-weight: 500; }

.m-ticket-panel {
  position: fixed;
  left: calc(12px + var(--safe-area-left));
  right: calc(12px + var(--safe-area-right));
  bottom: calc(var(--mobile-nav-height) + 10px);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 15px 20px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  z-index: 900;
  max-height: min(48dvh, 420px);
  display: flex;
  flex-direction: column;
}
.m-ticket-header { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px; text-align: center; }
.m-ticket-header h4 { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
.m-ticket-items { overflow-y: auto; flex: 1; margin-bottom: 15px; }
.m-ticket-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
.m-item-details { display: flex; gap: 8px; align-items: center; font-weight: 600; color: #0f172a; font-size: 0.95rem; }
.m-item-qty { color: #1e293b; }
.m-item-right { display: flex; align-items: center; gap: 12px; }
.m-item-price { font-weight: 700; color: #0f172a; font-size: 0.95rem; }
.m-item-del { color: #ef4444; background: transparent; border: none; font-size: 1rem; padding: 5px; cursor: pointer; }
.m-ticket-summary { display: flex; justify-content: flex-end; align-items: center; padding: 10px 0; border-top: 1px solid #e2e8f0; margin-bottom: 10px; }
.m-ticket-summary strong { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
.m-ticket-actions { display: flex; gap: 12px; }
.m-btn-pay { flex: 1; background: #16a34a; color: #fff; border: none; padding: 16px; border-radius: 12px; font-weight: 800; font-size: 1.1rem; }
.m-btn-clear { flex: 1; background: #dc2626; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 1.1rem; }

/* Modales Mejorados */
.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; backdrop-filter: blur(4px); }
.modal-card { background: #fff; border-radius: 20px; width: 100%; max-width: 450px; padding: 25px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); animation: popIn 0.2s ease-out; }
@keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-pago h2 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 20px; text-align: center; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: 600; color: #475569; margin-bottom: 8px; font-size: 0.9rem; }
.input-modal { width: 100%; padding: 12px 15px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 1rem; }

.p-total { font-size: 2.5rem; font-weight: 800; color: #2563eb; text-align: center; margin-bottom: 25px; background: #f1f5f9; padding: 15px; border-radius: 12px; }
.p-form label { font-weight: 700; color: #475569; display: block; margin-bottom: 10px; }
.input-received-wrapper { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.input-received-wrapper span { font-size: 1.5rem; font-weight: 700; color: #64748b; }
.p-input { flex: 1; padding: 15px; border: 2px solid #2563eb; border-radius: 12px; font-size: 1.5rem; font-weight: 800; text-align: right; outline: none; }
.btn-clear-input { padding: 15px 20px; background: #f1f5f9; border: none; border-radius: 12px; font-weight: 600; color: #475569; cursor: pointer; }

.quick-cash-container { margin-bottom: 20px; }
.subtitle-cash { font-size: 0.85rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
.mt-2 { margin-top: 10px; }
.quick-cash { display: grid; grid-template-columns: repeat(auto-fit, minmax(84px, 1fr)); gap: 8px; margin-bottom: 5px; }
.btn-cash { padding: 12px 5px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer; }
.btn-cash.exact { background: #dcfce7; border-color: #22c55e; color: #16a34a; }

.modal-cambio { text-align: center; padding: 15px; font-weight: 800; font-size: 1.3rem; color: #16a34a; background: #dcfce7; border-radius: 12px; margin-bottom: 20px; }
.modal-cambio.error { color: #dc2626; background: #fee2e2; }

/* Modal Peso */
.peso-header { text-align: center; margin-bottom: 20px; }
.peso-header h3 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
.peso-header span { color: #64748b; font-weight: 600; }
.weight-display { font-size: 3rem; font-weight: 800; text-align: center; padding: 15px; background: #f3e8ff; color: #7e22ce; border-radius: 16px; margin-bottom: 10px; display: flex; align-items: baseline; justify-content: center; gap: 8px; }
.w-val { letter-spacing: -2px; }
.w-unit { font-size: 1.5rem; color: #9333ea; }
.weight-preview { text-align: center; color: #94a3b8; font-weight: 600; font-size: 1.1rem; margin-bottom: 20px; }
.weight-preview.ok { color: #16a34a; font-weight: 800; }

.numpad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
.numpad button { padding: 20px; background: #f1f5f9; border: none; border-radius: 12px; font-size: 1.5rem; font-weight: 700; color: #1e293b; cursor: pointer; }
.numpad button:active { background: #e2e8f0; }
.del-key { color: #dc2626 !important; }

.modal-footer { display: flex; gap: 12px; }
.btn-cancelar { flex: 1; padding: 16px; border: 1px solid #cbd5e1; border-radius: 12px; background: #fff; font-weight: 700; color: #64748b; cursor: pointer; }
.btn-success { flex: 2; padding: 16px; background: #16a34a; color: #fff; border: none; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer; }
.btn-success:disabled, .btn-primary:disabled { opacity: 0.5; padding: 16px; border-radius: 12px; }
.btn-primary { flex: 2; padding: 16px; background: #2563eb; color: #fff; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 1.1rem; }

@media (max-width: 1400px) {
  .desktop-layout { padding: 20px; }
  .pc-toolbar { flex-direction: column; align-items: stretch; }
  .pc-toolbar__actions { justify-content: stretch; width: 100%; flex-wrap: wrap; }
  .pc-search { max-width: none; }
  .pc-body { grid-template-columns: 1fr; }
  .pc-cart-section { min-height: 520px; }
}

@media (max-width: 1180px) {
  .desktop-layout { padding: 18px; }
  .pc-toolbar,
  .pc-products-section,
  .pc-ticket-shell { border-radius: 24px; }
  .pc-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .pc-cart-item { flex-wrap: wrap; }
  .pc-item-info { min-width: 180px; }
  .pc-item-subtotal { margin-left: auto; min-width: 0; }
  .pc-actions { flex-direction: column; }
}

@media (max-width: 960px) {
  .desktop-layout { padding: 16px; }
  .pc-toolbar__copy h1 { font-size: 1.7rem; }
  .pc-toolbar__actions > * { width: 100%; }
  .pc-scan-btn { justify-content: center; }
  .pc-section-header { flex-direction: column; align-items: stretch; }
  .pc-product-count,
  .pc-ticket-chip { justify-content: center; }
  .pc-cart-section { min-height: 460px; }
  .pc-actions { flex-direction: column; }
}

@media (max-width: 640px) {
  .m-stats-row { grid-template-columns: 1fr; }
  .m-ticket-actions { flex-direction: column; }

  .m-products {
    grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
    padding: 14px 16px;
  }

  .m-header,
  .m-controls,
  .m-ticket-panel {
    padding-left: 16px;
    padding-right: 16px;
  }

  .m-ticket-panel {
    left: calc(8px + var(--safe-area-left));
    right: calc(8px + var(--safe-area-right));
    bottom: calc(var(--mobile-nav-height) + 8px);
    max-height: min(52dvh, 430px);
  }

  .input-received-wrapper {
    flex-wrap: wrap;
  }

  .btn-clear-input {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .modal-card { max-width: 100%; border-radius: 24px 24px 0 0; position: fixed; bottom: 0; margin: 0; padding: 20px 20px 30px; max-height: 90vh; overflow-y: auto;}
  .modal-overlay { padding: 0; align-items: flex-end; }
  .p-total { font-size: 2rem; margin-bottom: 15px; padding: 10px; }
  .quick-cash { gap: 6px; }
  .btn-cash { padding: 10px 5px; font-size: 0.95rem; }
  .mt-2 { margin-top: 5px; }
}
</style>
