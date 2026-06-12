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
                <span :class="['sale-method', methodClass(v.method)]">
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
              <!-- Info del Usuario (solo Admin) -->
              <div v-if="authStore.isAdmin && esFiado(v)" class="credit-info-box">
                <div class="credit-info-line">
                  <span class="label">Creado por:</span>
                  <strong>{{ getUsernameBuscado(v.usuario_id) }}</strong>
                </div>
              </div>

              <div class="items-table-wrap">
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
              </div>
              
              <div class="sale-actions">
                <!-- Botón Cobrar Fiado -->
                <button v-if="esFiado(v) && esFiadoPendiente(v)" class="btn-cobrar-fiado" @click="abrirCobranza(v)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                  Cobrar Fiado
                </button>
                
                <!-- Otros botones (solo admin) -->
                <div v-if="authStore.isAdmin" style="display: flex; gap: 8px; margin-left: auto;">
                  <div v-if="esFiado(v)" class="credit-note">
                    Pendiente: ${{ saleCreditAmount(v).toFixed(2) }}
                  </div>
                  <button class="btn-delete" @click="confirmDelete(v.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cobranza de Fiado -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="mostrarCobranza" class="modal-overlay" @click.self="mostrarCobranza = false">
          <div class="modal-card modal-pago">
            <!-- Header del modal -->
            <div class="modal-pago__header">
              <div class="modal-pago__title-row">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
                <h2>Cobrar Fiado</h2>
              </div>
              <button class="modal-close-btn" @click="mostrarCobranza = false" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-pago-body">
              <!-- Total destacado -->
              <div class="p-total" v-if="ventaCobranza">
                <span class="p-total__label">Saldo Pendiente</span>
                <span class="p-total__amount">${{ pendingAmount.toFixed(2) }}</span>
              </div>

              <!-- Métodos de pago -->
              <div class="payment-methods">
                <button
                  type="button"
                  class="payment-method"
                  :class="{ active: metodoCobranza === 'Efectivo' }"
                  @click="metodoCobranza = 'Efectivo'"
                >
                  <div class="payment-method__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 10h2m16 0h2M2 14h2m16 0h2"/></svg>
                  </div>
                  <span>Efectivo</span>
                </button>
                <button
                  type="button"
                  class="payment-method payment-method--card"
                  :class="{ active: metodoCobranza === 'Tarjeta' }"
                  @click="metodoCobranza = 'Tarjeta'"
                >
                  <div class="payment-method__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <span>Tarjeta</span>
                </button>
              </div>

              <!-- Efectivo -->
              <div v-if="metodoCobranza === 'Efectivo'" class="p-form">
                <label class="p-form__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
                  Efectivo Recibido
                </label>
                <div class="input-received-wrapper">
                  <span class="input-currency">$</span>
                  <input type="number" v-model.number="montoCobranza" class="p-input" autofocus @keyup.enter="confirmarCobranza" />
                  <button class="btn-clear-input" @click="limpiarEfectivo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>
                    Limpiar
                  </button>
                </div>

                <div class="quick-cash-container">
                  <!-- Botón Exacto -->
                  <button class="btn-exact" @click="montoExacto">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Monto Exacto
                  </button>

                  <div class="subtitle-cash">Billetes</div>
                  <div class="quick-cash quick-cash--bills">
                    <button v-for="cantidad in billetesMx" :key="`b-${cantidad}`" class="btn-bill" :class="`btn-bill--${cantidad}`" @click="sumarMonto(cantidad)">
                      <span class="btn-bill__value">${{ cantidad }}</span>
                    </button>
                  </div>

                  <div class="subtitle-cash">Monedas</div>
                  <div class="quick-cash quick-cash--coins">
                    <button v-for="cantidad in monedasMx" :key="`m-${cantidad}`" class="btn-coin" @click="sumarMonto(cantidad)">
                      {{ cantidad < 1 ? '50¢' : `$${cantidad}` }}
                    </button>
                  </div>
                </div>

                <Transition name="breakdown-fade">
                  <div v-if="cashBreakdown.length" class="cash-breakdown">
                    <div class="cash-breakdown__header">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <span>Desglose recibido</span>
                    </div>
                    <div class="cash-breakdown__chips">
                      <button v-for="entry in cashBreakdown" :key="entry.amount" type="button" class="cash-chip" @click="quitarMonto(entry.amount)">
                        {{ entry.count }}× {{ entry.amount < 1 ? '50¢' : `$${entry.amount}` }}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Tarjeta -->
              <div v-else class="alt-pay-box card-box">
                <div class="alt-pay-box__icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <strong>Cobro con tarjeta</strong>
                <span>Se registra el abono pagado por tarjeta y no calcula cambio.</span>
              </div>

              <!-- Indicador de cambio -->
              <div v-if="metodoCobranza === 'Efectivo'" class="modal-cambio" :class="{ 'modal-cambio--error': montoCobranzaNumero < pendingAmount }">
                <div class="modal-cambio__label">{{ montoCobranzaNumero < pendingAmount ? 'Abono Parcial' : 'Cambio a devolver' }}</div>
                <div class="modal-cambio__amount" v-if="montoCobranzaNumero < pendingAmount">${{ montoCobranzaNumero.toFixed(2) }}</div>
                <div class="modal-cambio__amount" v-else>${{ Math.abs(montoCobranzaNumero - pendingAmount).toFixed(2) }}</div>
              </div>
              <div v-else class="modal-cambio modal-cambio--card">
                <div class="modal-cambio__label">Cobro con tarjeta</div>
                <div class="modal-cambio__amount">${{ pendingAmount.toFixed(2) }}</div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancelar" @click="mostrarCobranza = false">Cerrar</button>
              <button class="btn-success" :disabled="!puedeCobrar" @click="confirmarCobranza">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                {{ metodoCobranza === 'Tarjeta' ? 'Cobrar con Tarjeta' : (montoCobranzaNumero < pendingAmount ? 'Registrar Abono' : 'Cobrar') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useVentasStore } from '../stores/ventas'
import { useAuthStore } from '../stores/auth'
import { getLocalDateKey, normalizePaymentMethod, saleCreditAmount } from '../utils/sales'
import { api } from '../api/client'

const ventasStore = useVentasStore()
const authStore = useAuthStore()

const expandedId = ref(null)
const filterActive = ref('today')

const filterOptions = [
  { id: 'today', label: 'Hoy' },
  { id: 'yesterday', label: 'Ayer' },
  { id: 'credit', label: 'Fiados' },
  { id: 'all', label: 'Todo' }
]

const usuarios = ref([])

onMounted(() => {
  ventasStore.cargarVentas()
  cargarUsuarios()
})

async function cargarUsuarios() {
  try {
    const data = await api.getUsuarios()
    usuarios.value = data || []
  } catch (e) {
    console.error('Error cargando usuarios:', e)
  }
}

const ventasFiltradas = computed(() => {
  if (filterActive.value === 'all') return ventasStore.ventas
  if (filterActive.value === 'credit') {
    return ventasStore.ventas.filter(v => normalizePaymentMethod(v.method) === 'fiado')
  }
  
  const now = new Date()
  const today = getLocalDateKey(now)
  
  const yesterdayDate = new Date()
  yesterdayDate.setDate(now.getDate() - 1)
  const yesterday = getLocalDateKey(yesterdayDate)

  return ventasStore.ventas.filter(v => {
    const vDate = getLocalDateKey(v.date)
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

function methodClass(method) {
  const normalized = normalizePaymentMethod(method)
  if (normalized === 'fiado') return 'm-credit'
  if (normalized === 'tarjeta') return 'm-card'
  return 'm-cash'
}

function esFiado(venta) {
  return normalizePaymentMethod(venta.method) === 'fiado'
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

function getUsernameBuscado(usuarioId) {
  if (!usuarioId) return 'Desconocido'
  const user = usuarios.value.find(u => u.id === usuarioId)
  return user ? user.username : 'Desconocido'
}

function esFiadoPendiente(venta) {
  return esFiado(venta) && saleCreditAmount(venta) > 0
}

// ==========================================
// Modal de cobranza de fiados
// ==========================================
const mostrarCobranza = ref(false)
const ventaCobranza = ref(null)
const metodoCobranza = ref('Efectivo')
const montoCobranza = ref(0)
const cashEntries = ref([])

const billetesMx = [1000, 500, 200, 100, 50, 20]
const monedasMx = [20, 10, 5, 2, 1, 0.5]

const pendingAmount = computed(() => ventaCobranza.value ? saleCreditAmount(ventaCobranza.value) : 0)
const montoCobranzaNumero = computed(() => Number(montoCobranza.value) || 0)
const puedeCobrar = computed(() => {
  if (metodoCobranza.value === 'Tarjeta') return true
  return montoCobranzaNumero.value > 0
})

const cashBreakdown = computed(() => {
  const counts = new Map()
  for (const amount of cashEntries.value) {
    counts.set(amount, (counts.get(amount) || 0) + 1)
  }
  return Array.from(counts, ([amount, count]) => ({ amount, count })).sort((a, b) => b.amount - a.amount)
})

function sumarMonto(cantidad) {
  if (montoCobranzaNumero.value === pendingAmount.value && cantidad !== 0) montoCobranza.value = 0
  montoCobranza.value = montoCobranzaNumero.value + cantidad
  cashEntries.value.push(cantidad)
}

function quitarMonto(cantidad) {
  const index = cashEntries.value.findIndex(amount => amount === cantidad)
  if (index === -1) return
  cashEntries.value.splice(index, 1)
  montoCobranza.value = Math.max(montoCobranzaNumero.value - cantidad, 0)
}

function limpiarEfectivo() {
  montoCobranza.value = 0
  cashEntries.value = []
}

function montoExacto() {
  montoCobranza.value = pendingAmount.value
  cashEntries.value = []
}

function abrirCobranza(venta) {
  ventaCobranza.value = venta
  montoCobranza.value = saleCreditAmount(venta)
  metodoCobranza.value = 'Efectivo'
  cashEntries.value = []
  mostrarCobranza.value = true
}

async function confirmarCobranza() {
  if (!ventaCobranza.value || (metodoCobranza.value === 'Efectivo' && montoCobranzaNumero.value <= 0)) return

  const v = ventaCobranza.value
  const isCard = metodoCobranza.value === 'Tarjeta'
  const amountPaying = isCard ? pendingAmount.value : Math.min(montoCobranzaNumero.value, pendingAmount.value)
  const change = isCard ? 0 : Math.max(montoCobranzaNumero.value - pendingAmount.value, 0)
  
  const previousPaid = Number(v.paidAmount) || 0
  const newPaidAmount = previousPaid + amountPaying
  
  const isFullyPaid = newPaidAmount >= v.total
  const methodToSave = isFullyPaid ? metodoCobranza.value : 'Fiado'

  try {
    await api.cobrarFiado(v.id, {
      method: methodToSave,
      paidAmount: newPaidAmount,
      change: change
    })

    const storeV = ventasStore.ventas.find(vt => vt.id === v.id)
    if (storeV) {
      storeV.method = methodToSave
      storeV.paidAmount = newPaidAmount
      storeV.change = change
    }

    mostrarCobranza.value = false
    alert(isFullyPaid ? 'Fiado cobrado completamente' : 'Abono registrado correctamente')
  } catch (e) {
    console.error('Error exacto:', e)
    alert('Error al procesar el cobro: ' + (e.message || JSON.stringify(e)))
  }
}
</script>

<style scoped>
.historial { padding: var(--space-6); background: var(--content-bg); min-height: 100%; }
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
.m-credit { background: #fef3c7; color: #b45309; }

.icon-chevron { transition: transform 0.2s; color: var(--gray-400); }
.icon-chevron.expanded { transform: rotate(180deg); }

.sale-details { padding: var(--space-5); background: #fafafa; border-top: 1px solid var(--gray-100); }
.items-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

.items-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.items-table th { text-align: left; color: var(--gray-500); font-weight: 600; padding-bottom: 8px; border-bottom: 1px solid var(--gray-200); }
.items-table td { padding: 8px 0; color: var(--gray-700); }
.text-right { text-align: right; }

.sale-actions { margin-top: var(--space-4); display: flex; justify-content: flex-end; }
.credit-note {
  margin-right: auto;
  align-self: center;
  color: #b45309;
  font-size: var(--text-sm);
  font-weight: 800;
}
.btn-delete { 
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: #fee2e2; color: #dc2626; border: none; 
  border-radius: var(--radius-md); font-weight: 700; font-size: var(--text-xs); cursor: pointer;
}
.btn-delete:hover { background: #fecaca; }

.credit-info-box {
  padding: 12px 16px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: var(--radius-md); margin-bottom: 16px;
}
.credit-info-line { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.credit-info-line .label { color: var(--gray-600); font-weight: 600; font-size: var(--text-sm); }
.credit-info-line strong { color: var(--gray-900); font-weight: 700; }

.btn-cobrar-fiado {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px; background: var(--primary); color: #fff; border: none;
  border-radius: var(--radius-md); font-weight: 700; font-size: var(--text-sm); cursor: pointer;
  transition: all 0.2s;
}
.btn-cobrar-fiado:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }

/* =============================================
   MODAL DE COBRANZA
   ============================================= */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center; z-index: 9999;
  padding: 16px;
}
.modal-card {
  background: #fff; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  width: 100%; max-width: 480px; overflow: hidden; display: flex; flex-direction: column;
  transform: scale(1); transition: transform 0.3s;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }

.modal-pago__header {
  padding: 20px 24px; background: #fafafa; border-bottom: 1px solid var(--gray-200);
  display: flex; justify-content: space-between; align-items: center;
}
.modal-pago__title-row { display: flex; align-items: center; gap: 10px; color: var(--gray-900); }
.modal-pago__title-row h2 { margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
.modal-close-btn {
  background: transparent; border: none; color: var(--gray-400); cursor: pointer;
  padding: 6px; border-radius: 50%; transition: all 0.2s; display: flex;
}
.modal-close-btn:hover { background: var(--gray-200); color: var(--gray-700); }

.modal-pago-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; max-height: calc(90vh - 140px); }

.p-total {
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(135deg, #1e40af, #1e3a8a); color: #fff;
  padding: 20px 24px; border-radius: 16px; box-shadow: 0 10px 20px rgba(30,58,138,0.2);
}
.p-total__label { font-size: 0.95rem; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em; }
.p-total__amount { font-size: 2rem; font-weight: 800; }

.payment-methods { display: flex; gap: 12px; }
.payment-method {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 8px; background: #fff; border: 2px solid var(--gray-200);
  border-radius: 16px; cursor: pointer; transition: all 0.2s; color: var(--gray-600);
  font-weight: 700; font-size: 0.9rem;
}
.payment-method__icon { display: flex; align-items: center; justify-content: center; height: 32px; color: var(--gray-400); transition: color 0.2s; }
.payment-method:hover { border-color: var(--primary-light); background: #f8fafc; }
.payment-method.active { border-color: var(--primary); background: #eff6ff; color: var(--primary); }
.payment-method.active .payment-method__icon { color: var(--primary); }

.p-form__label { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--gray-700); margin-bottom: 8px; font-size: 0.95rem; }
.input-received-wrapper { position: relative; display: flex; align-items: center; margin-bottom: 16px; }
.input-currency { position: absolute; left: 16px; font-size: 1.5rem; font-weight: 700; color: var(--gray-400); }
.p-input {
  width: 100%; padding: 16px 16px 16px 40px; font-size: 1.75rem; font-weight: 800;
  border: 2px solid var(--gray-200); border-radius: 16px; transition: all 0.2s; color: var(--gray-900);
  background: #fafafa;
}
.p-input:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 4px var(--primary-light); }
.btn-clear-input {
  position: absolute; right: 12px; padding: 8px 12px; background: #fee2e2; color: #dc2626;
  border: none; border-radius: 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; gap: 4px; transition: background 0.2s;
}
.btn-clear-input:hover { background: #fecaca; }

.quick-cash-container { background: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid var(--gray-100); }
.btn-exact {
  width: 100%; padding: 12px; background: #fff; border: 2px dashed var(--gray-300);
  border-radius: 12px; color: var(--gray-700); font-weight: 700; font-size: 0.95rem;
  display: flex; justify-content: center; align-items: center; gap: 8px;
  cursor: pointer; transition: all 0.2s; margin-bottom: 16px;
}
.btn-exact:hover { border-color: var(--primary); color: var(--primary); background: #eff6ff; }
.subtitle-cash { font-size: 0.75rem; font-weight: 800; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }

.quick-cash { display: grid; gap: 8px; margin-bottom: 16px; }
.quick-cash--bills { grid-template-columns: repeat(3, 1fr); }
.quick-cash--coins { grid-template-columns: repeat(6, 1fr); margin-bottom: 0; }

.btn-bill {
  background: #fff; border: 1px solid var(--gray-200); border-radius: 10px;
  padding: 10px 4px; cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
}
.btn-bill:active { transform: scale(0.95); }
.btn-bill__value { font-weight: 800; font-size: 1rem; color: var(--gray-700); }
.btn-bill--1000 { border-color: #fcd34d; background: #fffbeb; }
.btn-bill--500 { border-color: #bef264; background: #f7fee7; }
.btn-bill--200 { border-color: #86efac; background: #f0fdf4; }
.btn-bill--100 { border-color: #fca5a5; background: #fef2f2; }
.btn-bill--50 { border-color: #f9a8d4; background: #fdf2f8; }
.btn-bill--20 { border-color: #93c5fd; background: #eff6ff; }

.btn-coin {
  width: 100%; aspect-ratio: 1; border-radius: 50%; background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border: 1px solid #cbd5e1; font-weight: 800; font-size: 0.85rem; color: #475569;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05), inset 0 2px 4px rgba(255,255,255,0.5);
}
.btn-coin:active { transform: scale(0.9); box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }

.cash-breakdown { margin-top: 16px; background: #fff; border: 1px solid var(--gray-200); border-radius: 12px; padding: 12px; }
.cash-breakdown__header { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 700; color: var(--gray-500); margin-bottom: 10px; }
.cash-breakdown__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cash-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px;
  background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 8px;
  font-size: 0.85rem; font-weight: 600; color: var(--gray-700); cursor: pointer; transition: all 0.2s;
}
.cash-chip:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

.alt-pay-box {
  background: #f8fafc; border: 2px dashed var(--gray-300); border-radius: 16px;
  padding: 24px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.alt-pay-box__icon { width: 56px; height: 56px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.alt-pay-box strong { font-size: 1.1rem; color: var(--gray-800); }
.alt-pay-box span { font-size: 0.9rem; color: var(--gray-500); line-height: 1.4; }

.modal-cambio {
  display: flex; justify-content: space-between; align-items: center;
  background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px 20px; border-radius: 16px; color: #065f46;
}
.modal-cambio--error { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
.modal-cambio--card { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
.modal-cambio__label { font-size: 0.95rem; font-weight: 700; }
.modal-cambio__amount { font-size: 1.5rem; font-weight: 800; }

.modal-footer { padding: 20px 24px; background: #fafafa; border-top: 1px solid var(--gray-200); display: flex; gap: 12px; }
.btn-cancelar { flex: 1; padding: 14px; background: #fff; border: 2px solid var(--gray-200); border-radius: 12px; font-weight: 700; color: var(--gray-600); cursor: pointer; transition: all 0.2s; }
.btn-cancelar:hover { background: var(--gray-50); border-color: var(--gray-300); }
.btn-success {
  flex: 2; padding: 14px; background: var(--success); color: #fff; border: none; border-radius: 12px;
  font-weight: 800; font-size: 1.05rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px;
  transition: all 0.2s; box-shadow: 0 4px 12px rgba(22,163,74,0.2);
}
.btn-success:hover:not(:disabled) { background: var(--success-dark); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(22,163,74,0.3); }
.btn-success:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.empty-state { text-align: center; padding: 40px; color: var(--gray-400); }

@media (max-width: 1080px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-4);
  }

  .filters {
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .sale-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }

  .sale-main-info,
  .sale-sum-info {
    flex-wrap: wrap;
  }

  .sale-total {
    min-width: 0;
    text-align: left;
  }

  .items-table {
    min-width: 520px;
  }
}

@media (max-width: 640px) {
  .historial {
    padding: var(--space-4);
  }
}
</style>
