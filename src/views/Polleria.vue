<template>
  <AppLayout>
    <div class="ventas-wrapper" :class="{ 'is-mobile-ui': isMobileView }">
      
      <!-- Feedback Global -->
      <div v-if="scanMsg" class="scan-feedback" :class="scanMsgType">
        <span class="scan-feedback__text">{{ scanMsg }}</span>
      </div>

      <!-- ==========================================
           VISTA MÓVIL (APK / TABLET)
           ========================================== -->
      <div v-if="isMobileView" class="mobile-layout" :class="{ 'mobile-layout--ticket-open': carrito.length > 0 && currentRole !== 'admin' }">
        <div class="m-header">
          <div class="m-store-info">
            <span class="m-badge">Pollería</span>
            <h3>{{ currentRole === 'admin' ? 'Administración de Pollo' : 'Venta Rápida de Pollo' }}</h3>
          </div>
        </div>

        <div class="m-products">
          <button v-for="p in listaPollos" :key="p.id" class="m-p-card m-p-card--pollo" @click="handleCardClick(p)">
            <span class="m-p-name">{{ p.nombre }}</span>
            <div class="m-p-price-row">
              <span class="m-p-price">${{ p.precio.toFixed(0) }}</span>
            </div>
            <div class="m-p-action" v-if="currentRole === 'admin'">✎ Editar</div>
          </button>
          <div v-if="!listaPollos.length" class="empty-state">No hay opciones de pollo configuradas.</div>
        </div>

        <!-- Modo Venta Cajero (Móvil) -->
        <div v-if="carrito.length > 0 && currentRole !== 'admin'" class="m-ticket-panel">
          <div class="m-ticket-header">
            <h4>Ticket Pollería</h4>
          </div>
          <div class="m-ticket-items">
            <div v-for="item in carrito" :key="item._uid" class="m-ticket-item">
              <div class="m-item-details">
                <span class="m-item-qty">{{ item.qty }}x</span>
                <span class="m-item-name">{{ item.nombre }}</span>
              </div>
              <div class="m-item-right">
                <span class="m-item-price">${{ (item.qty * item.precio).toFixed(2) }}</span>
                <button class="m-item-del" @click="eliminarDeCarrito(item)">×</button>
              </div>
            </div>
          </div>
          <div class="m-ticket-summary">
            <strong>Total: ${{ totalCarrito.toFixed(2) }}</strong>
          </div>
          <div class="m-ticket-actions">
            <button class="m-btn-pay" @click="abrirPagar">Cobrar</button>
            <button class="m-btn-clear" @click="cancelarCarrito">Cancelar</button>
          </div>
        </div>

        <!-- Modo Edición Admin (Móvil) -->
        <div v-if="currentRole === 'admin'" class="m-ticket-panel m-admin-panel">
          <div class="m-ticket-header">
            <h4>{{ polloEditando.id ? 'Editar Pollo' : 'Nuevo Pollo' }}</h4>
            <button class="m-btn-new" @click="nuevoPollo" v-if="polloEditando.id">Añadir Nuevo</button>
          </div>
          <div class="admin-form">
            <label>Nombre:</label>
            <input type="text" v-model="polloEditando.nombre" class="admin-input" placeholder="Ej. Pierna y Muslo" />
            <label>Precio:</label>
            <input type="number" v-model.number="polloEditando.precio" class="admin-input" placeholder="0.00" />
            
            <div class="admin-actions">
              <button class="m-btn-save" @click="guardarPolloAdmin">Guardar</button>
              <button class="m-btn-del" v-if="polloEditando.id" @click="eliminarPolloAdmin">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================
           VISTA ESCRITORIO
           ========================================== -->
      <div v-else class="desktop-layout">
        <div class="pc-toolbar">
          <div class="pc-toolbar__copy">
            <span class="pc-kicker">{{ currentRole === 'admin' ? 'Administración' : 'Caja Separada' }}</span>
            <h1>{{ currentRole === 'admin' ? 'Catálogo de Pollería' : 'Venta de Pollo' }}</h1>
            <p>{{ currentRole === 'admin' ? 'Configura los precios y las opciones de pollo aquí.' : 'Selecciona las piezas o pollos enteros para cobrarlos independientemente.' }}</p>
          </div>
        </div>

        <div class="pc-body">
          <!-- Sección Izquierda: Catálogo -->
          <section class="pc-products-section">
            <div class="pc-section-header">
              <div class="pc-section-text">
                <div class="pc-section-title">Opciones de Pollo</div>
              </div>
            </div>

            <div v-if="listaPollos.length" class="pc-grid">
              <article v-for="p in listaPollos" :key="p.id" class="pc-p-card pc-p-card--pollo" @click="handleCardClick(p)">
                <div class="pc-p-top">
                  <span class="pc-p-unit">Pollo</span>
                </div>
                <span class="pc-p-name">{{ p.nombre }}</span>
                <div class="pc-p-footer">
                  <span class="pc-p-price">${{ p.precio.toFixed(2) }}</span>
                  <button v-if="currentRole !== 'admin'" class="pc-p-add-btn">Agregar</button>
                  <span v-else class="pc-p-edit-lbl">✎ Editar</span>
                </div>
              </article>
            </div>
            <div v-else class="pc-empty-state">
              No hay configuraciones de pollo disponibles.
            </div>
          </section>

          <!-- Sección Derecha: Ticket (Cajero) o Admin Form (Admin) -->
          <aside class="pc-cart-section">
            
            <!-- MODO CAJERO: TICKET -->
            <div v-if="currentRole !== 'admin'" class="pc-ticket-shell">
              <div class="pc-section-header pc-section-header--ticket">
                <div class="pc-section-text">
                  <div class="pc-section-title">Ticket Pollería</div>
                </div>
              </div>

              <div class="pc-cart-list">
                <div v-if="!carrito.length" class="pc-empty">
                  El carrito de pollo está vacío
                </div>
                <div v-for="item in carrito" :key="item._uid" class="pc-cart-item">
                  <div class="pc-item-info">
                    <strong>{{ item.nombre }}</strong>
                    <span>${{ item.precio.toFixed(2) }} c/u</span>
                  </div>
                  <div class="pc-item-qty">
                    <button @click="menos(item)">-</button>
                    <span>{{ item.qty }}</span>
                    <button @click="mas(item)">+</button>
                  </div>
                  <div class="pc-item-subtotal">${{ (item.qty * item.precio).toFixed(2) }}</div>
                  <button class="pc-item-del" @click="eliminarDeCarrito(item)">×</button>
                </div>
              </div>

              <div class="pc-cart-footer">
                <div class="pc-ticket-summary" v-if="carrito.length">
                  <div class="pc-summary-line pc-summary-line--total">
                    <span>Total a Pagar</span>
                    <strong>${{ totalCarrito.toFixed(2) }}</strong>
                  </div>
                </div>
                <div class="pc-actions">
                  <button class="pc-btn-pay" :disabled="!carrito.length" @click="abrirPagar">Cobrar Pollo</button>
                  <button class="pc-btn-cancel" @click="cancelarCarrito" :disabled="!carrito.length">Cancelar</button>
                </div>
              </div>
            </div>

            <!-- MODO ADMIN: FORMULARIO -->
            <div v-else class="pc-ticket-shell pc-admin-shell">
              <div class="pc-section-header pc-section-header--ticket" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="pc-section-text">
                  <div class="pc-section-title">{{ polloEditando.id ? 'Editar Pollo' : 'Nuevo Pollo' }}</div>
                </div>
                <button v-if="polloEditando.id" class="pc-btn-new-admin" @click="nuevoPollo">+ Nuevo</button>
              </div>

              <div class="admin-form-pc">
                <div class="form-group">
                  <label>Nombre del Producto</label>
                  <input type="text" v-model="polloEditando.nombre" placeholder="Ej. Medio Pollo" />
                </div>
                <div class="form-group">
                  <label>Precio de Venta ($)</label>
                  <input type="number" v-model.number="polloEditando.precio" placeholder="0.00" />
                </div>
              </div>

              <div class="pc-cart-footer" style="margin-top: auto;">
                <div class="pc-actions">
                  <button class="pc-btn-pay" @click="guardarPolloAdmin" :disabled="!polloEditando.nombre || polloEditando.precio <= 0">Guardar Cambios</button>
                  <button class="pc-btn-cancel" v-if="polloEditando.id" @click="eliminarPolloAdmin">Eliminar</button>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>

    </div>

    <!-- Modal Pago (Sólo Cajeros/Venta) -->
    <Teleport to="body">
      <div v-if="mostrarPagar" class="modal-overlay" @click.self="mostrarPagar = false">
        <div class="modal-card modal-pago">
          <h2>Cobrar Pollo</h2>

          <div class="modal-pago-body">
            <div class="p-total">${{ totalCarrito.toFixed(2) }}</div>

            <div class="p-form">
              <label>Efectivo Recibido:</label>
              <div class="input-received-wrapper">
                <span>$</span>
                <input type="number" v-model.number="montoRecibido" class="p-input" autofocus @keyup.enter="confirmarPago" />
              </div>
              <div class="quick-cash">
                <button class="btn-cash exact" @click="montoExacto">Exacto</button>
                <button class="btn-cash" @click="montoRecibido += 50">+$50</button>
                <button class="btn-cash" @click="montoRecibido += 100">+$100</button>
                <button class="btn-cash" @click="montoRecibido += 200">+$200</button>
                <button class="btn-cash" @click="montoRecibido += 500">+$500</button>
              </div>
            </div>

            <div class="modal-cambio" :class="{ 'error': montoRecibido < totalCarrito }">
              {{ montoRecibido < totalCarrito ? 'Falta:' : 'Cambio:' }} ${{ Math.abs(montoRecibido - totalCarrito).toFixed(2) }}
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-cancelar" @click="mostrarPagar = false">Cancelar</button>
            <button class="btn-success" :disabled="montoRecibido < totalCarrito" @click="confirmarPago">
              Completar Venta
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import { usePollosStore } from '../stores/pollos'
import { useVentasPolloStore } from '../stores/ventasPollo'

const auth = useAuthStore()
const pollosStore = usePollosStore()
const ventasPolloStore = useVentasPolloStore()

const currentRole = computed(() => auth.role)

const windowWidth = ref(window.innerWidth)
const isMobileView = computed(() => windowWidth.value <= 820)
function handleResize() { windowWidth.value = window.innerWidth }

// Feedback visual
const scanMsg = ref('')
const scanMsgType = ref('success')
let scanMsgTimer = null
function mostrarFeedback(msg, type = 'success') {
  scanMsg.value = msg
  scanMsgType.value = type
  if (scanMsgTimer) clearTimeout(scanMsgTimer)
  scanMsgTimer = setTimeout(() => { scanMsg.value = '' }, 3000)
}

const listaPollos = computed(() => pollosStore.pollos || [])

// ======= MODO CAJERO (VENTA) =======
const carrito = ref([])
const totalCarrito = computed(() => carrito.value.reduce((sum, i) => sum + (i.precio * i.qty), 0))
const mostrarPagar = ref(false)
const montoRecibido = ref(0)

function mas(item) { item.qty++ }
function menos(item) {
  item.qty--
  if (item.qty <= 0) eliminarDeCarrito(item)
}
function eliminarDeCarrito(item) {
  carrito.value = carrito.value.filter(i => i._uid !== item._uid)
}
function cancelarCarrito() {
  carrito.value = []
}
function abrirPagar() {
  montoRecibido.value = totalCarrito.value
  mostrarPagar.value = true
}
function montoExacto() { montoRecibido.value = totalCarrito.value }

async function confirmarPago() {
  if (montoRecibido.value < totalCarrito.value) return

  const change = montoRecibido.value - totalCarrito.value
  try {
    await ventasPolloStore.registrarVenta(carrito.value, totalCarrito.value, {
      method: 'Efectivo',
      paidAmount: montoRecibido.value,
      change
    })
    mostrarFeedback(`Venta exitosa. Cambio: $${change.toFixed(2)}`)
    carrito.value = []
    mostrarPagar.value = false
  } catch (e) {
    mostrarFeedback('Error al procesar la venta', 'error')
  }
}

// ======= MODO ADMIN (EDICIÓN) =======
const polloEditando = ref({ id: null, nombre: '', precio: 0 })

function nuevoPollo() {
  polloEditando.value = { id: null, nombre: '', precio: 0 }
}

async function guardarPolloAdmin() {
  try {
    await pollosStore.agregarPollo({ ...polloEditando.value })
    mostrarFeedback('Producto guardado correctamente')
    nuevoPollo()
  } catch (e) {
    mostrarFeedback('Error al guardar el producto', 'error')
  }
}

async function eliminarPolloAdmin() {
  if (!polloEditando.value.id) return
  if (!confirm(`¿Eliminar ${polloEditando.value.nombre}?`)) return
  try {
    await pollosStore.eliminarPollo(polloEditando.value.id)
    mostrarFeedback('Producto eliminado')
    nuevoPollo()
  } catch (e) {
    mostrarFeedback('Error al eliminar', 'error')
  }
}

// Handler centralizado de clic en la tarjeta de pollo
function handleCardClick(p) {
  if (currentRole.value === 'admin') {
    // Si es admin, cargar en el formulario
    polloEditando.value = { ...p }
  } else {
    // Si es cajero, agregar al carrito
    const existe = carrito.value.find(i => i.id === p.id)
    if (existe) {
      existe.qty++
    } else {
      carrito.value.push({ ...p, qty: 1, _uid: `${p.id}-${Date.now()}` })
    }
  }
}

// Inicio
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await pollosStore.cargarPollos()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* CSS Pollería */
.ventas-wrapper { min-height: 100%; background: #fffbeb; position: relative; }

.scan-feedback {
  position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 3000; display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 999px; color: #fff; font-weight: 600;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.scan-feedback.success { background: #f59e0b; }
.scan-feedback.error { background: #dc2626; }

/* PC Styles */
.desktop-layout { display: flex; flex-direction: column; gap: 18px; min-height: 100%; padding: 26px; }
.pc-toolbar, .pc-products-section, .pc-ticket-shell { border-radius: 28px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); }
.pc-toolbar { padding: 22px; border: 1px solid #fde68a; }
.pc-kicker { display: inline-flex; margin-bottom: 8px; color: #d97706; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
.pc-toolbar__copy h1 { font-size: 1.95rem; margin: 0; color: #1e293b; font-weight: 800; letter-spacing: -0.03em; }
.pc-toolbar__copy p { color: #64748b; margin-top: 6px; font-size: 1.05rem; }
.pc-body { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.85fr); gap: 18px; flex: 1; }
.pc-products-section { padding: 22px; }
.pc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 14px; }
.pc-p-card { display: flex; flex-direction: column; gap: 12px; padding: 18px; border-radius: 22px; background: #fff; border: 1px solid #fef3c7; cursor: pointer; transition: transform 0.1s; }
.pc-p-card:hover { transform: translateY(-2px); border-color: #fcd34d; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.1); }
.pc-p-top { display: flex; justify-content: space-between; }
.pc-p-unit { padding: 6px 10px; border-radius: 999px; background: #fef3c7; color: #b45309; font-size: 0.75rem; font-weight: 800; }
.pc-p-name { font-weight: 700; font-size: 0.96rem; color: #451a03; }
.pc-p-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.pc-p-price { color: #d97706; font-weight: 800; font-size: 1.05rem; }
.pc-p-add-btn { background: #f59e0b; color: #fff; border: none; padding: 8px 12px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.pc-p-edit-lbl { color: #8b5cf6; font-weight: 700; font-size: 0.85rem; }
.pc-empty-state { text-align: center; color: #94a3b8; padding: 40px; font-size: 1.1rem; }

/* Ticket / Admin Shell */
.pc-ticket-shell { height: 100%; padding: 22px; display: flex; flex-direction: column; }
.pc-admin-shell { background: #f8fafc; border: 1px solid #e2e8f0; }
.pc-section-header { margin-bottom: 18px; }
.pc-section-title { font-weight: 800; color: #b45309; text-transform: uppercase; }
.pc-admin-shell .pc-section-title { color: #334155; }

/* Admin Form */
.pc-btn-new-admin { background: transparent; border: 1px solid #94a3b8; color: #475569; padding: 6px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; }
.admin-form-pc { display: flex; flex-direction: column; gap: 20px; margin-top: 10px; }
.form-group label { display: block; font-weight: 700; color: #64748b; margin-bottom: 8px; font-size: 0.9rem; }
.form-group input { width: 100%; padding: 14px; border: 2px solid #e2e8f0; border-radius: 14px; font-size: 1.1rem; font-weight: 700; color: #1e293b; outline: none; transition: border-color 0.2s; }
.form-group input:focus { border-color: #8b5cf6; }

/* Cart List */
.pc-cart-list { flex: 1; overflow-y: auto; }
.pc-cart-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: #fff; border: 1px solid #fef3c7; border-radius: 18px; margin-bottom: 10px; }
.pc-item-info { flex: 1; display: flex; flex-direction: column; }
.pc-item-info strong { color: #451a03; font-weight: 700; }
.pc-item-info span { color: #b45309; font-size: 0.85rem; }
.pc-item-qty { display: flex; align-items: center; gap: 12px; background: #fffbeb; border-radius: 12px; padding: 2px; }
.pc-item-qty button { width: 32px; height: 32px; border: none; background: transparent; cursor: pointer; font-weight: 600; color: #b45309; }
.pc-item-subtotal { min-width: 80px; text-align: right; font-weight: 800; color: #451a03; }
.pc-item-del { border: none; background: transparent; color: #ef4444; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; }
.pc-item-del:hover { background: #fee2e2; }
.pc-empty { text-align: center; color: #94a3b8; padding: 40px 0; }

/* Actions */
.pc-cart-footer { padding-top: 18px; border-top: 1px solid #fde68a; margin-top: auto; }
.pc-admin-shell .pc-cart-footer { border-top: 1px solid #e2e8f0; }
.pc-summary-line { display: flex; justify-content: space-between; padding: 12px; background: #fffbeb; border-radius: 16px; margin-bottom: 16px; align-items: center;}
.pc-summary-line span { color: #b45309; font-weight: 700; }
.pc-summary-line strong { font-size: 1.4rem; font-weight: 800; color: #d97706; }
.pc-actions { display: flex; gap: 15px; }
.pc-btn-pay { flex: 2; background: #f59e0b; color: #fff; border: none; padding: 18px; border-radius: 18px; font-weight: 800; font-size: 1.15rem; cursor: pointer; transition: background 0.2s;}
.pc-btn-pay:hover:not(:disabled) { background: #d97706; }
.pc-admin-shell .pc-btn-pay { background: #8b5cf6; }
.pc-admin-shell .pc-btn-pay:hover:not(:disabled) { background: #7c3aed; }
.pc-btn-pay:disabled { opacity: 0.5; cursor: not-allowed; }
.pc-btn-cancel { flex: 1; background: #fff; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 18px; cursor: pointer; font-weight: 700; }
.pc-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

/* Mobile */
.mobile-layout { display: flex; flex-direction: column; padding-bottom: 24px; min-height: 100vh;}
.m-header { padding: 20px; background: #fff; border-bottom: 1px solid #fde68a; }
.m-badge { background: #fef3c7; color: #d97706; padding: 6px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; display: inline-block; margin-bottom: 8px;}
.m-store-info h3 { margin: 0; font-size: 1.5rem; color: #1e293b; font-weight: 800;}
.m-products { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; padding-bottom: 250px;}
.m-p-card { background: #fff; border: 1px solid #fef3c7; padding: 16px; border-radius: 16px; display: flex; flex-direction: column; gap: 8px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); cursor: pointer;}
.m-p-name { font-weight: 700; color: #451a03; }
.m-p-price { color: #d97706; font-weight: 800; font-size: 1.2rem; }
.m-p-action { font-size: 0.8rem; font-weight: 700; color: #8b5cf6; margin-top: 4px; }
.m-ticket-panel { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -10px 40px rgba(0,0,0,0.1); padding: 20px; z-index: 100; max-height: 60vh; display: flex; flex-direction: column; border-top: 1px solid #fde68a;}
.m-admin-panel { border-top: 1px solid #e2e8f0; }
.m-ticket-header { display: flex; justify-content: space-between; align-items: center; }
.m-ticket-header h4 { margin: 0; color: #b45309; font-weight: 800;}
.m-admin-panel .m-ticket-header h4 { color: #334155; }
.m-btn-new { background: transparent; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 8px; font-weight: 700; color: #475569; }
.m-ticket-items { flex: 1; overflow-y: auto; margin: 15px 0; display: flex; flex-direction: column; gap: 10px;}
.m-ticket-item { display: flex; justify-content: space-between; padding: 12px; border: 1px solid #fef3c7; border-radius: 12px; align-items: center;}
.m-item-details { display: flex; gap: 12px; align-items: center;}
.m-item-qty { font-weight: 800; color: #d97706; background: #fef3c7; padding: 4px 8px; border-radius: 8px;}
.m-item-name { font-weight: 600; color: #451a03;}
.m-item-right { display: flex; gap: 15px; align-items: center; }
.m-item-price { font-weight: 700; color: #451a03;}
.m-item-del { border: none; background: transparent; color: #ef4444; font-size: 1.5rem; padding: 0;}
.m-ticket-summary { font-size: 1.3rem; text-align: right; padding: 15px 0; color: #d97706; border-top: 1px dashed #fde68a;}
.m-ticket-actions { display: flex; gap: 12px; }
.m-btn-pay { flex: 2; background: #f59e0b; color: #fff; border: none; padding: 16px; border-radius: 16px; font-weight: 800; font-size: 1.1rem; }
.m-btn-clear { flex: 1; background: #fee2e2; color: #ef4444; border: none; padding: 16px; border-radius: 16px; font-weight: 700; }

/* Admin Mobile Form */
.admin-form { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.admin-form label { font-weight: 700; color: #64748b; font-size: 0.9rem; }
.admin-input { border: 2px solid #e2e8f0; border-radius: 12px; padding: 12px; font-size: 1.1rem; font-weight: 700; outline: none; }
.admin-actions { display: flex; gap: 10px; margin-top: 15px; }
.m-btn-save { flex: 2; background: #8b5cf6; color: white; border: none; padding: 14px; border-radius: 14px; font-weight: 800; }
.m-btn-del { flex: 1; background: #fee2e2; color: #ef4444; border: none; padding: 14px; border-radius: 14px; font-weight: 700; }

/* Modal Pago */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 20px;}
.modal-card { background: #fff; border-radius: 28px; padding: 30px; width: 100%; max-width: 420px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);}
.modal-card h2 { color: #b45309; margin-top: 0; margin-bottom: 20px; text-align: center; font-weight: 800;}
.p-total { font-size: 2.5rem; font-weight: 800; text-align: center; color: #451a03; margin-bottom: 24px; }
.p-form label { display: block; font-weight: 700; color: #64748b; margin-bottom: 10px;}
.input-received-wrapper { display: flex; align-items: center; border: 2px solid #fde68a; border-radius: 16px; padding: 16px; font-size: 1.8rem; margin-bottom: 16px; transition: border-color 0.2s;}
.input-received-wrapper:focus-within { border-color: #f59e0b;}
.input-received-wrapper span { color: #b45309; margin-right: 12px; font-weight: 800;}
.p-input { border: none; outline: none; width: 100%; font-size: 1.8rem; font-weight: 800; color: #451a03; background: transparent;}
.quick-cash { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
.btn-cash { background: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 12px; color: #b45309; font-weight: 700; cursor: pointer; transition: background 0.2s;}
.btn-cash:hover { background: #fef3c7; }
.btn-cash.exact { background: #d97706; color: #fff; border-color: #d97706; grid-column: span 3;}
.modal-cambio { padding: 18px; background: #ecfccb; color: #4d7c0f; font-weight: 800; font-size: 1.4rem; border-radius: 16px; text-align: center; }
.modal-cambio.error { background: #fee2e2; color: #b91c1c; }
.modal-footer { display: flex; gap: 12px; margin-top: 24px; }
.btn-cancelar { flex: 1; background: #f1f5f9; color: #64748b; border: none; padding: 16px; border-radius: 16px; font-weight: 700; cursor: pointer; }
.btn-success { flex: 2; background: #f59e0b; color: #fff; border: none; padding: 16px; border-radius: 16px; font-weight: 800; cursor: pointer; font-size: 1.1rem;}
.btn-success:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
