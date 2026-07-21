<template>
  <AppLayout>
    <div class="ventas-wrapper" :class="{ 'is-mobile-ui': isMobileView }">
      
      <!-- Scan feedback global -->
      <Transition name="notif">
        <div v-if="scanMsg" class="scan-feedback" :class="scanMsgType">
          <div class="scan-feedback__icon">
            <svg v-if="scanMsgType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <span class="scan-feedback__text">{{ scanMsg }}</span>
          <button
            v-if="scanMsgType === 'error'"
            class="scan-feedback__close"
            type="button"
            @click="cerrarFeedback"
            aria-label="Cerrar mensaje"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- ==========================================
           VISTA MÓVIL (APK / TABLET)
           ========================================== -->
      <div v-if="isMobileView" class="mobile-layout" :class="{ 'mobile-layout--ticket-open': carrito.length > 0 }">
        <!-- Header: Stats del día -->
        <div class="m-header">
          <div class="m-store-info">
            <span class="m-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Tiendita Gudi
            </span>
            <h3>Hola, {{ currentUsername }}</h3>
          </div>
          <div class="m-stats-row">
            <div class="m-stat m-stat--primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span class="m-stat-label">Ventas Hoy</span>
              <span class="m-stat-val">${{ totalVentasHoy.toFixed(0) }}</span>
            </div>
            <div class="m-stat m-stat--success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
              <span class="m-stat-label">Total en Caja</span>
              <span class="m-stat-val">${{ totalCajaHoy.toFixed(2) }}</span>
            </div>
            <div class="m-stat m-stat--warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span class="m-stat-label">Fiado Hoy</span>
              <span class="m-stat-val">${{ totalFiadoHoy.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Buscador y Scanner -->
        <div class="m-controls">
          <div class="m-search-box">
            <svg class="m-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="buscar" placeholder="Buscar producto..." @keyup.enter="agregarRapido" />
            <button class="m-scan-btn" @click="mostrarScanner = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h2v2H7zm0 8h2v2H7zm8-8h2v2h-2zm0 8h2v2h-2zm-4-4h2v2h-2z"/></svg>
            </button>
          </div>
        </div>

        <!-- Grid de Productos -->
        <div class="m-products">
          <button v-for="p in productosFiltrados" :key="p.barcode" class="m-p-card" @click="agregar(p)">
            <span class="m-p-badge" :class="{ 'm-p-badge--kg': p.unit === 'kg' }">{{ p.unit === 'kg' ? '⚖️' : '📦' }}</span>
            <span class="m-p-name">{{ p.name }}</span>
            <div class="m-p-price-row">
              <span class="m-p-price">${{ p.price.toFixed(0) }}</span>
              <span v-if="p.unit === 'kg'" class="m-p-unit">/kg</span>
            </div>
          </button>
          <div v-if="!productosFiltrados.length" class="empty-state">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            No se encontraron productos.
          </div>
        </div>

        <!-- Panel de Ticket (Flotante Expansivo) -->
        <Transition name="ticket-slide">
          <div v-if="carrito.length > 0" class="m-ticket-panel">
            <div class="m-ticket-header">
              <div class="m-ticket-header__left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <h4>Ticket de Venta</h4>
              </div>
              <span class="m-ticket-count">{{ carrito.length }}</span>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6L18.1 19.5c-.1 1.4-1.2 2.5-2.6 2.5H8.5c-1.4 0-2.5-1.1-2.6-2.5L5 6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="m-ticket-summary">
              <span>Total</span>
              <strong>${{ totalCarrito.toFixed(2) }}</strong>
            </div>
            <div class="m-ticket-actions">
              <button class="m-btn-pay" @click="abrirPagar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Cobrar
              </button>
              <button class="m-btn-clear" @click="cancelar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ==========================================
           VISTA ESCRITORIO (WINDOWS / WEB)
           ========================================== -->
      <div v-else class="desktop-layout">
        <div class="pc-toolbar">
          <div class="pc-toolbar__copy">
            <div class="pc-kicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
              Punto de Venta
            </div>
            <h1>Caja Registradora</h1>
            <p>Agrega productos al ticket y procesa el cobro rápidamente.</p>
          </div>
          <div class="pc-toolbar__actions">
            <div class="pc-search">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input v-model="buscar" placeholder="Buscar por nombre o código de barras..." @keyup.enter="agregarRapido" />
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
                <div class="pc-section-title">Catálogo</div>
                <p>Haz clic en cualquier producto para añadirlo al ticket.</p>
              </div>
              <span class="pc-product-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                {{ productosFiltrados.length }} productos
              </span>
            </div>

            <div v-if="productosFiltrados.length" class="pc-grid">
              <article v-for="p in productosFiltrados" :key="p.barcode" class="pc-p-card" @click="agregar(p)">
                <div class="pc-p-top">
                  <span class="pc-p-unit" :class="{ 'pc-p-unit--weight': p.unit === 'kg' }">
                    <svg v-if="p.unit === 'kg'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3a4 4 0 0 0-4 4c0 2 2 4 4 7 2-3 4-5 4-7a4 4 0 0 0-4-4z"/><path d="M5 21h14l-2-8H7l-2 8z"/></svg>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    {{ p.unit === 'kg' ? 'Peso' : 'Pieza' }}
                  </span>
                  <span class="pc-p-code">{{ String(p.barcode).startsWith('INT-') ? 'Interno' : String(p.barcode).slice(-4) }}</span>
                </div>
                <span class="pc-p-name">{{ p.name }}</span>
                <div class="pc-p-footer">
                  <span class="pc-p-price">${{ p.price.toFixed(2) }} <small v-if="p.unit === 'kg'">/kg</small></span>
                  <button class="pc-p-add-btn" @click.stop="agregar(p)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </article>
            </div>
            <div v-else class="pc-empty-state">
              <div class="pc-empty-state__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
              <strong>Sin resultados</strong>
              <span>No encontramos productos con esa búsqueda.</span>
            </div>
          </section>

          <aside class="pc-cart-section">
            <div class="pc-ticket-shell">
              <!-- Zigzag top -->
              <div class="pc-ticket-zigzag"></div>

              <div class="pc-ticket-inner">
                <div class="pc-section-header pc-section-header--ticket">
                  <div class="pc-section-text">
                    <div class="pc-section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      Venta actual
                    </div>
                    <p>Ticket en preparación</p>
                  </div>
                  <span class="pc-ticket-chip">{{ carrito.length }} items</span>
                </div>

                <div class="pc-cart-list">
                  <div v-if="!carrito.length" class="pc-empty">
                    <div class="pc-empty__icon-wrap">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <span>El carrito está vacío</span>
                    <small>Agrega productos desde el catálogo</small>
                  </div>
                  <TransitionGroup name="cart-item">
                    <div v-for="item in carrito" :key="item._uid" class="pc-cart-item">
                      <div class="pc-cart-item__indicator" :class="{ 'pc-cart-item__indicator--kg': item.unit === 'kg' }"></div>
                      <div class="pc-item-info">
                        <strong>{{ item.name }}</strong>
                        <span v-if="item.unit === 'kg'">${{ item.price.toFixed(2) }} /kg</span>
                        <span v-else>${{ item.price.toFixed(2) }} c/u</span>
                      </div>

                      <div v-if="item.unit === 'kg'" class="pc-item-weight">
                        <button class="peso-chip" @click="editarPeso(item)">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a4 4 0 0 0-4 4c0 2 2 4 4 7 2-3 4-5 4-7a4 4 0 0 0-4-4z"/><path d="M5 21h14l-2-8H7l-2 8z"/></svg>
                          {{ formatPeso(item.qty) }}
                        </button>
                      </div>
                      <div v-else class="pc-item-qty">
                        <button @click="menos(item)" aria-label="Menos">−</button>
                        <span>{{ item.qty }}</span>
                        <button @click="mas(item)" aria-label="Más">+</button>
                      </div>

                      <div class="pc-item-subtotal">${{ (item.qty * item.price).toFixed(2) }}</div>
                      <button class="pc-item-del" @click="eliminar(item)" aria-label="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6L18.1 19.5c-.1 1.4-1.2 2.5-2.6 2.5H8.5c-1.4 0-2.5-1.1-2.6-2.5L5 6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>
                      </button>
                    </div>
                  </TransitionGroup>
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
                    <div class="pc-summary-total">
                      <span>Total a cobrar</span>
                      <strong>${{ totalCarrito.toFixed(2) }}</strong>
                    </div>
                  </div>
                  <div class="pc-actions">
                    <button class="pc-btn-pay" :disabled="!carrito.length" @click="abrirPagar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Cobrar
                    </button>
                    <button class="pc-btn-cancel" @click="cancelar" :disabled="!carrito.length">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>

              <!-- Zigzag bottom -->
              <div class="pc-ticket-zigzag pc-ticket-zigzag--bottom"></div>
            </div>
          </aside>
        </div>
      </div>

    </div>

    <!-- Modales (Compartidos) -->
    <Teleport to="body">
      <!-- Modal Pago Completo -->
      <Transition name="modal-fade">
        <div v-if="mostrarPagar" class="modal-overlay" @click.self="mostrarPagar = false">
          <div class="modal-card modal-pago">
            <!-- Header del modal -->
            <div class="modal-pago__header">
              <div class="modal-pago__title-row">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
                <h2>Cobrar Venta</h2>
              </div>
              <button class="modal-close-btn" @click="mostrarPagar = false" aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-pago-body">
              <!-- Total destacado -->
              <div class="p-total">
                <span class="p-total__label">Total a cobrar</span>
                <span class="p-total__amount">${{ totalCarrito.toFixed(2) }}</span>
              </div>

              <!-- Métodos de pago -->
              <div class="payment-methods">
                <button
                  type="button"
                  class="payment-method"
                  :class="{ active: paymentMethod === PAYMENT_METHODS.CASH }"
                  @click="paymentMethod = PAYMENT_METHODS.CASH"
                >
                  <div class="payment-method__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M2 10h2m16 0h2M2 14h2m16 0h2"/></svg>
                  </div>
                  <span>Efectivo</span>
                </button>
                <button
                  type="button"
                  class="payment-method payment-method--card"
                  :class="{ active: paymentMethod === PAYMENT_METHODS.CARD }"
                  @click="paymentMethod = PAYMENT_METHODS.CARD"
                >
                  <div class="payment-method__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <span>Tarjeta</span>
                </button>
                <button
                  type="button"
                  class="payment-method payment-method--credit"
                  :class="{ active: paymentMethod === PAYMENT_METHODS.CREDIT }"
                  @click="paymentMethod = PAYMENT_METHODS.CREDIT"
                >
                  <div class="payment-method__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <span>Fiado</span>
                </button>
              </div>

              <!-- Cliente -->
              <div class="form-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ esPagoFiado ? 'Cliente para fiado' : 'Cliente (Opcional)' }}
                </label>
                <input
                  type="text"
                  v-model="clienteNombre"
                  :placeholder="esPagoFiado ? 'Nombre del cliente' : 'Público en general'"
                  class="input-modal"
                  :class="{ 'input-modal--error': esPagoFiado && !clienteFiadoValido }"
                  @keyup.enter="confirmarPago"
                />
              </div>
              
              <!-- Efectivo -->
              <div v-if="esPagoEfectivo" class="p-form">
                <label class="p-form__label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
                  Efectivo Recibido
                </label>
                <div class="input-received-wrapper">
                  <span class="input-currency">$</span>
                  <input type="number" v-model.number="montoRecibido" class="p-input" autofocus @keyup.enter="confirmarPago" />
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
              <div v-else-if="esPagoTarjeta" class="alt-pay-box card-box">
                <div class="alt-pay-box__icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <strong>Cobro con tarjeta</strong>
                <span>Se registra como pagado por tarjeta y no calcula cambio.</span>
              </div>

              <!-- Fiado -->
              <div v-else class="alt-pay-box fiado-box">
                <div class="alt-pay-box__icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <strong>Venta fiada</strong>
                <span>Se descuenta inventario y queda pendiente de cobro. No suma al total en caja.</span>
              </div>
              
              <!-- Indicador de cambio -->
              <div v-if="esPagoEfectivo" class="modal-cambio" :class="{ 'modal-cambio--error': montoRecibidoNumero < totalCarrito }">
                <div class="modal-cambio__label">{{ montoRecibidoNumero < totalCarrito ? 'Falta cobrar' : 'Cambio a devolver' }}</div>
                <div class="modal-cambio__amount">${{ Math.abs(montoRecibidoNumero - totalCarrito).toFixed(2) }}</div>
              </div>
              <div v-else-if="esPagoTarjeta" class="modal-cambio modal-cambio--card">
                <div class="modal-cambio__label">Cobro con tarjeta</div>
                <div class="modal-cambio__amount">${{ totalCarrito.toFixed(2) }}</div>
              </div>
              <div v-else class="modal-cambio modal-cambio--fiado">
                <div class="modal-cambio__label">Pendiente de cobro</div>
                <div class="modal-cambio__amount">${{ totalCarrito.toFixed(2) }}</div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-cancelar" @click="mostrarPagar = false">Cerrar</button>
              <button class="btn-success" :disabled="!puedeCompletarPago" @click="confirmarPago">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                {{ paymentButtonLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Modal Peso -->
      <Transition name="modal-fade">
        <div v-if="modalPeso.visible" class="modal-overlay" @click.self="modalPeso.visible = false">
          <div class="modal-card modal-peso-card">
            <div class="peso-header">
              <div class="peso-header__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3a4 4 0 0 0-4 4c0 2 2 4 4 7 2-3 4-5 4-7a4 4 0 0 0-4-4z"/><path d="M5 21h14l-2-8H7l-2 8z"/></svg>
              </div>
              <h3>{{ modalPeso.producto?.name }}</h3>
              <span class="peso-header__price">${{ modalPeso.producto?.price.toFixed(2) }} por {{ modalPeso.producto?.unit }}</span>
            </div>
            <div class="weight-display">
              <span class="w-val">{{ modalPeso.pesoStr || '0' }}</span>
              <span class="w-unit">{{ modalPeso.producto?.unit }}</span>
            </div>
            <div class="weight-preview" :class="{'weight-preview--ok': pesoCalculado > 0}">
              <span>Subtotal:</span>
              <strong>${{ pesoCalculado.toFixed(2) }}</strong>
            </div>
            <div class="numpad">
              <button v-for="k in ['7','8','9','4','5','6','1','2','3','.','0','⌫']" :key="k" @click="numpadPress(k)" :class="{'numpad__del': k === '⌫', 'numpad__dot': k === '.'}">
                <span v-if="k === '⌫'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>
                </span>
                <span v-else>{{ k }}</span>
              </button>
            </div>
            <div class="modal-footer">
              <button class="btn-cancelar" @click="modalPeso.visible = false">Cancelar</button>
              <button class="btn-primary" @click="confirmarPeso" :disabled="pesoCalculado <= 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </Transition>
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
import { sanitizeBarcode } from '../utils/barcode'
import { PAYMENT_METHODS, isSaleOnDate, saleCollectedAmount, saleCreditAmount, saleTotal } from '../utils/sales'

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
  if (scanMsgTimer) {
    clearTimeout(scanMsgTimer)
    scanMsgTimer = null
  }
  scanMsg.value = msg
  scanMsgType.value = type

  if (type !== 'error') {
    scanMsgTimer = setTimeout(() => {
      cerrarFeedback()
    }, 3000)
  }
}

function cerrarFeedback() {
  if (scanMsgTimer) {
    clearTimeout(scanMsgTimer)
    scanMsgTimer = null
  }
  scanMsg.value = ''
}

// Datos y Búsqueda

const ventasHoy = computed(() => {
  const lista = ventasStore.ventas || []
  return lista.filter(v => isSaleOnDate(v))
})
const totalVentasHoy = computed(() => ventasHoy.value.reduce((sum, v) => sum + saleTotal(v), 0))
const totalCajaHoy = computed(() => ventasHoy.value.reduce((sum, v) => sum + saleCollectedAmount(v), 0))
const totalFiadoHoy = computed(() => ventasHoy.value.reduce((sum, v) => sum + saleCreditAmount(v), 0))

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
  const textoBusqueda = buscar.value.trim()
  const q = textoBusqueda.toLowerCase()
  const barcodeQuery = sanitizeBarcode(textoBusqueda).toLowerCase()

  if (!q) return listaProductos.value

  return listaProductos.value.filter(p => {
    const barcode = sanitizeBarcode(p.barcode).toLowerCase()
    return p.name.toLowerCase().includes(q) || barcode.includes(barcodeQuery)
  })
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
const paymentMethod = ref(PAYMENT_METHODS.CASH)
const cashEntries = ref([])
const billetesMx = [1000, 500, 200, 100, 50, 20]
const monedasMx = [10, 5, 2, 1, 0.5]
const montoRecibidoNumero = computed(() => Number(montoRecibido.value) || 0)
const esPagoEfectivo = computed(() => paymentMethod.value === PAYMENT_METHODS.CASH)
const esPagoTarjeta = computed(() => paymentMethod.value === PAYMENT_METHODS.CARD)
const esPagoFiado = computed(() => paymentMethod.value === PAYMENT_METHODS.CREDIT)
const clienteFiadoValido = computed(() => clienteNombre.value.trim().length > 0)
const puedeCompletarPago = computed(() => {
  if (!carrito.value.length) return false
  if (esPagoTarjeta.value) return true
  if (esPagoFiado.value) return clienteFiadoValido.value
  return montoRecibidoNumero.value >= totalCarrito.value
})
const cashBreakdown = computed(() => {
  const counts = new Map()
  for (const amount of cashEntries.value) {
    counts.set(amount, (counts.get(amount) || 0) + 1)
  }
  return Array.from(counts, ([amount, count]) => ({ amount, count })).sort((a, b) => b.amount - a.amount)
})
const paymentButtonLabel = computed(() => {
  if (esPagoTarjeta.value) return 'Completar con Tarjeta'
  if (esPagoFiado.value) return 'Guardar Fiado'
  return 'Completar Venta'
})

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
  if (scanMsgTimer) {
    clearTimeout(scanMsgTimer)
    scanMsgTimer = null
  }
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
  const textoBusqueda = buscar.value.trim()
  const q = textoBusqueda.toLowerCase()
  const barcodeBuscado = sanitizeBarcode(textoBusqueda)

  if (!barcodeBuscado && !q) return

  const p = listaProductos.value.find(p =>
    sanitizeBarcode(p.barcode) === barcodeBuscado ||
    p.name.toLowerCase() === q
  )

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
function extraerCodigoDetectado(payload) {
  if (typeof payload === 'string') {
    return sanitizeBarcode(payload)
  }

  return sanitizeBarcode(payload?.code || payload?.rawCode)
}

function onBarcodeDetected(payload) {
  mostrarScanner.value = false
  const code = extraerCodigoDetectado(payload)
  if (!code) return

  const p = listaProductos.value.find(prod => sanitizeBarcode(prod.barcode) === code)

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
  paymentMethod.value = PAYMENT_METHODS.CASH
  cashEntries.value = []
  mostrarPagar.value = true
}

function sumarMonto(cantidad) {
  if (montoRecibidoNumero.value === totalCarrito.value && cantidad !== 0) montoRecibido.value = 0
  montoRecibido.value = montoRecibidoNumero.value + cantidad
  cashEntries.value.push(cantidad)
}

function quitarMonto(cantidad) {
  const index = cashEntries.value.findIndex(amount => amount === cantidad)
  if (index === -1) return
  cashEntries.value.splice(index, 1)
  montoRecibido.value = Math.max(montoRecibidoNumero.value - cantidad, 0)
}

function limpiarEfectivo() {
  montoRecibido.value = 0
  cashEntries.value = []
}

function montoExacto() {
  montoRecibido.value = totalCarrito.value
  cashEntries.value = []
}

async function confirmarPago() {
  if (!carrito.value.length) return
  if (!puedeCompletarPago.value) {
    if (esPagoFiado.value) mostrarFeedback('Escribe el nombre del cliente para fiado', 'error')
    return
  }

  const isCard = esPagoTarjeta.value
  const isCredit = esPagoFiado.value
  const paidAmount = isCard ? totalCarrito.value : (isCredit ? 0 : montoRecibidoNumero.value)
  const change = isCard || isCredit ? 0 : montoRecibidoNumero.value - totalCarrito.value

  try {
    await ventasStore.registrarVenta(carrito.value, totalCarrito.value, {
      client: clienteNombre.value.trim(),
      method: paymentMethod.value,
      paidAmount,
      change
    })
    if (isCredit) {
      mostrarFeedback(`Fiado guardado para ${clienteNombre.value.trim()}`)
    } else if (isCard) {
      mostrarFeedback('Venta con tarjeta registrada')
    } else {
      mostrarFeedback(`Venta exitosa. Cambio: $${change.toFixed(2)}`)
    }
    carrito.value = []
    buscar.value = ''
    clienteNombre.value = ''
    montoRecibido.value = 0
    cashEntries.value = []
    paymentMethod.value = PAYMENT_METHODS.CASH
    mostrarPagar.value = false
  } catch (error) {
    mostrarFeedback('Error al procesar la venta', 'error')
  }
}
</script>

<style scoped>
/* =============================================
   BASE & WRAPPER
   ============================================= */
.ventas-wrapper {
  min-height: 100%;
  background: linear-gradient(135deg, #f0f4f8 0%, #e8edf5 100%);
  position: relative;
}

/* =============================================
   NOTIFICACIONES
   ============================================= */
.scan-feedback {
  position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 3000; display: flex; align-items: center; gap: 10px;
  padding: 14px 24px; border-radius: 16px; color: #fff; font-weight: 700;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  max-width: min(92vw, 560px);
  backdrop-filter: blur(12px);
  font-size: 0.95rem;
}
.scan-feedback.success { background: linear-gradient(135deg, #16a34a, #059669); }
.scan-feedback.error { background: linear-gradient(135deg, #dc2626, #b91c1c); }
.scan-feedback__icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255,255,255,0.2); flex-shrink: 0;
}
.scan-feedback__text { min-width: 0; }
.scan-feedback__close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border: none; border-radius: 8px;
  background: rgba(255,255,255,0.16); color: inherit; cursor: pointer;
  flex-shrink: 0; transition: background 0.2s;
}
.scan-feedback__close:hover { background: rgba(255,255,255,0.3); }

/* Notification transitions */
.notif-enter-active { animation: notifIn 0.35s ease-out; }
.notif-leave-active { animation: notifOut 0.25s ease-in; }
@keyframes notifIn { from { transform: translateX(-50%) translateY(-30px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
@keyframes notifOut { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(-20px); opacity: 0; } }

/* =============================================
   VISTA DESKTOP
   ============================================= */
.desktop-layout { display: flex; flex-direction: column; gap: 20px; min-height: 100%; padding: 28px; }

/* Toolbar */
.pc-toolbar {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
  padding: 26px 28px; border-radius: 24px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
  border: 1px solid rgba(148,163,184,0.12);
  box-shadow: 0 4px 24px rgba(15,23,42,0.04);
}
.pc-kicker {
  display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 8px; color: var(--primary-ink);
  font-size: var(--text-xs); font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.pc-toolbar__copy h1 { font-size: 1.85rem; letter-spacing: -0.04em; color: #0f172a; }
.pc-toolbar__copy p { margin-top: 6px; color: var(--gray-500); line-height: 1.55; }
.pc-toolbar__actions { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; justify-content: flex-end; }
.pc-search { position: relative; flex: 1; max-width: 520px; display: flex; align-items: center; }
.search-icon { position: absolute; left: 16px; color: #94a3b8; transition: color 0.2s; }
.pc-search:focus-within .search-icon { color: var(--primary); }
.pc-search input {
  width: 100%; padding: 14px 16px 14px 44px;
  border: 1.5px solid rgba(148,163,184,0.2); border-radius: 16px;
  background: var(--surface-muted); font-size: 0.95rem; color: #334155;
  transition: all 0.25s ease;
}
.pc-search input:focus {
  outline: none; border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(30,94,184,0.1);
  background: #fff;
}
.pc-search input::placeholder { color: #94a3b8; }
.pc-scan-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 18px; border: none; border-radius: var(--radius-md);
  background: var(--primary);
  color: #fff; font-weight: 600; font-size: var(--text-sm); cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
}
.pc-scan-btn:hover { background: var(--primary-dark); transform: translateY(-1px); box-shadow: var(--shadow-md); }

/* Body Grid */
.pc-body { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.85fr); gap: 20px; flex: 1; min-height: 0; }

/* Products Section */
.pc-products-section {
  padding: 24px; overflow-y: auto; border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-sm);
}
.pc-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.pc-section-header--ticket { margin-bottom: 0; padding-bottom: 18px; border-bottom: 1px solid rgba(148,163,184,0.14); }
.pc-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.pc-section-text p { margin-top: 6px; color: var(--gray-500); font-size: var(--text-sm); }
.pc-product-count {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 12px;
  background: rgba(30,94,184,0.08); color: var(--primary-ink);
  font-size: var(--text-xs); font-weight: 800; white-space: nowrap;
}

/* Product Grid */
.pc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
.pc-p-card {
  display: flex; flex-direction: column; gap: 10px;
  padding: 18px; border-radius: 20px;
  background: #fff; border: 1.5px solid rgba(148,163,184,0.1);
  text-align: left; cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
}
.pc-p-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(30,94,184,0.04), rgba(30,94,184,0));
  opacity: 0; transition: opacity 0.22s;
}
.pc-p-card:hover {
  transform: translateY(-3px);
  border-color: rgba(30,94,184,0.2);
  box-shadow: 0 12px 32px rgba(15,23,42,0.08);
}
.pc-p-card:hover::before { opacity: 1; }
.pc-p-card:active { transform: translateY(-1px) scale(0.98); }
.pc-p-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; position: relative; z-index: 1; }
.pc-p-unit, .pc-p-code, .pc-ticket-chip {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 10px; font-size: 0.7rem; font-weight: 800;
}
.pc-p-unit { padding: 5px 10px; background: rgba(30,94,184,0.08); color: var(--primary-ink); }
.pc-p-unit--weight { background: rgba(15,118,110,0.08); color: var(--teal); }
.pc-p-code { padding: 5px 10px; background: rgba(51,65,85,0.06); color: #64748b; }
.pc-p-name {
  display: block; min-height: 2.4em; font-weight: 700;
  font-size: 0.93rem; color: #1e293b; line-height: 1.35;
  position: relative; z-index: 1;
}
.pc-p-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; position: relative; z-index: 1; }
.pc-p-price { color: var(--primary); font-weight: 800; font-size: 1.05rem; }
.pc-p-price small { color: #64748b; font-size: 0.72rem; font-weight: 600; }
.pc-p-add-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 12px rgba(22,163,74,0.25);
  transition: all 0.2s ease;
}
.pc-p-add-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(22,163,74,0.35); }
.pc-p-add-btn:active { transform: scale(0.95); }

/* Empty State */
.pc-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; min-height: 240px; border-radius: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  color: var(--gray-500); border: 2px dashed rgba(148,163,184,0.2);
}
.pc-empty-state__icon { color: #94a3b8; }
.pc-empty-state strong { color: #475569; font-size: 1rem; }
.pc-empty-state span { font-size: 0.9rem; }

/* =============================================
   TICKET / CART (Desktop)
   ============================================= */
.pc-cart-section { min-height: 0; }
.pc-ticket-shell {
  height: 100%; display: flex; flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.pc-ticket-zigzag {
  height: 0px; width: 100%; flex-shrink: 0;
  display: none;
}
.pc-ticket-zigzag--bottom {
  display: none;
}
.pc-ticket-inner { flex: 1; display: flex; flex-direction: column; padding: 22px; min-height: 0; }
.pc-ticket-chip { padding: 6px 12px; background: rgba(30,94,184,0.08); color: var(--primary-ink); border-radius: 10px; }

/* Cart List */
.pc-cart-list { flex: 1; padding: 16px 0; overflow-y: auto; }
.pc-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; gap: 8px;
}
.pc-empty__icon-wrap {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8; margin-bottom: 4px;
}
.pc-empty span { color: #64748b; font-weight: 700; font-size: 1rem; }
.pc-empty small { color: #94a3b8; font-size: 0.85rem; }

/* Cart Items */
.pc-cart-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: #fff;
  border: 1px solid rgba(148,163,184,0.1);
  border-radius: 16px; margin-bottom: 8px;
  transition: all 0.2s ease;
  position: relative;
}
.pc-cart-item:hover { border-color: rgba(30,94,184,0.15); box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
.pc-cart-item__indicator {
  width: 4px; height: 32px; border-radius: 4px;
  background: linear-gradient(180deg, var(--primary), var(--primary-dark));
  flex-shrink: 0;
}
.pc-cart-item__indicator--kg { background: linear-gradient(180deg, #7c3aed, #6d28d9); }
.pc-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pc-item-info strong { color: #0f172a; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-item-info span { color: #64748b; font-size: 0.78rem; }
.pc-item-qty {
  display: flex; align-items: center; gap: 2px;
  background: #f5f7fb; border: 1px solid rgba(148,163,184,0.15);
  border-radius: 12px; padding: 2px;
}
.pc-item-qty button {
  width: 32px; height: 32px; border: none; background: transparent;
  cursor: pointer; font-size: 1.1rem; font-weight: 700; color: #475569;
  border-radius: 10px; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.pc-item-qty button:hover { background: #e2e8f0; color: var(--primary); }
.pc-item-qty button:active { transform: scale(0.9); }
.pc-item-qty span { font-weight: 800; min-width: 24px; text-align: center; color: #0f172a; font-size: 0.95rem; }
.pc-item-subtotal { min-width: 80px; text-align: right; font-weight: 800; font-size: 1rem; color: #0f172a; }
.pc-item-del {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: none; background: transparent;
  color: #cbd5e1; cursor: pointer; border-radius: 10px;
  transition: all 0.2s;
}
.pc-item-del:hover { color: #ef4444; background: #fef2f2; }
.peso-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 12px;
  background: linear-gradient(135deg, #f3e8ff, #ede9fe);
  border: 1px dashed #a855f7; color: #7e22ce;
  font-weight: 700; cursor: pointer; font-size: 0.85rem;
  transition: all 0.2s;
}
.peso-chip:hover { background: linear-gradient(135deg, #ede9fe, #e8e0fc); border-style: solid; }

/* Cart Item Transitions */
.cart-item-enter-active { animation: cartItemIn 0.3s ease-out; }
.cart-item-leave-active { animation: cartItemOut 0.2s ease-in; }
@keyframes cartItemIn { from { opacity: 0; transform: translateX(-20px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes cartItemOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px) scale(0.95); } }

/* Cart Footer */
.pc-cart-footer { padding-top: 18px; border-top: 1px solid rgba(148,163,184,0.14); }
.pc-ticket-summary { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.pc-summary-line {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: 12px;
  background: #f8fafc; border: 1px solid rgba(148,163,184,0.1);
}
.pc-summary-line span { color: var(--gray-500); font-size: var(--text-sm); font-weight: 600; }
.pc-summary-line strong { color: var(--gray-900); font-size: 1rem; font-weight: 800; }
.pc-summary-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-radius: var(--radius-md);
  background: var(--primary);
  color: #fff;
}
.pc-summary-total span { font-size: 0.9rem; font-weight: 600; opacity: 0.8; }
.pc-summary-total strong { font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em; }

/* Action Buttons */
.pc-actions { display: flex; gap: 12px; }
.pc-btn-pay {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: #fff; border: none; padding: 18px;
  border-radius: 16px; font-weight: 800; font-size: 1.1rem; cursor: pointer;
  box-shadow: 0 8px 24px rgba(22,163,74,0.25);
  transition: all 0.22s ease;
}
.pc-btn-pay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(22,163,74,0.35); }
.pc-btn-pay:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.pc-btn-pay:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.pc-btn-cancel {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: #fff; color: #ef4444; border: 1.5px solid rgba(239,68,68,0.25);
  padding: 18px; border-radius: 16px; font-weight: 700; font-size: 0.95rem; cursor: pointer;
  transition: all 0.2s;
}
.pc-btn-cancel:hover:not(:disabled) { background: #fef2f2; border-color: rgba(239,68,68,0.4); }
.pc-btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; border-color: #e2e8f0; color: #94a3b8; }

/* =============================================
   VISTA MÓVIL
   ============================================= */
.mobile-layout {
  display: flex; flex-direction: column;
  min-height: 100%; overflow-y: auto;
  padding-bottom: 24px;
  background: linear-gradient(180deg, #f0f4f8, #e8edf5);
}
.mobile-layout--ticket-open { padding-bottom: calc(min(48dvh, 420px) + 28px); }

.m-header {
  padding: 20px; background: #fff;
  border-bottom: 1px solid rgba(148,163,184,0.12);
  box-shadow: 0 2px 12px rgba(15,23,42,0.03);
}
.m-badge {
  background: linear-gradient(135deg, #dbeafe, #c7d2fe);
  color: #1d4ed8; padding: 6px 14px; border-radius: 10px;
  font-size: 0.75rem; font-weight: 700;
  display: inline-flex; align-items: center; gap: 6px;
}
.m-header h3 { font-size: 1.45rem; font-weight: 800; color: #0f172a; margin-top: 10px; }
.m-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }
.m-stat {
  flex: 1; padding: 14px 16px; border-radius: 16px; color: #fff;
  display: flex; flex-direction: column; gap: 4px;
  position: relative; overflow: hidden;
}
.m-stat::after {
  content: ''; position: absolute; top: -20px; right: -20px;
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
}
.m-stat svg { opacity: 0.85; }
.m-stat--primary { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.m-stat--success { background: linear-gradient(135deg, #22c55e, #15803d); }
.m-stat--warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.m-stat-label { font-size: 0.72rem; font-weight: 600; opacity: 0.9; }
.m-stat-val { font-size: 1.2rem; font-weight: 800; }

/* Mobile Search */
.m-controls { padding: 14px 20px; background: #fff; }
.m-search-box {
  display: flex; align-items: center; gap: 8px;
  background: #f5f7fb; border-radius: 14px;
  padding: 4px 4px 4px 14px; border: 1.5px solid rgba(148,163,184,0.12);
  transition: border-color 0.2s;
}
.m-search-box:focus-within { border-color: var(--primary); }
.m-search-icon { color: #94a3b8; flex-shrink: 0; }
.m-search-box:focus-within .m-search-icon { color: var(--primary); }
.m-search-box input {
  flex: 1; border: none; background: transparent;
  padding: 12px 0; font-size: 0.95rem; font-weight: 600; outline: none; color: #334155;
}
.m-search-box input::placeholder { color: #94a3b8; font-weight: 500; }
.m-scan-btn {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border: none; border-radius: 12px; color: #fff; cursor: pointer;
  box-shadow: 0 4px 12px rgba(30,94,184,0.2);
}

/* Mobile Products */
.m-products { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; padding: 14px 20px; }
.m-p-card {
  background: #fff; border-radius: 16px; padding: 14px 10px;
  border: 1.5px solid rgba(148,163,184,0.08);
  box-shadow: 0 2px 8px rgba(15,23,42,0.03);
  text-align: center; display: flex; flex-direction: column;
  align-items: center; justify-content: center; min-height: 100px;
  transition: all 0.2s ease; position: relative; cursor: pointer;
}
.m-p-card:active { transform: scale(0.96); }
.m-p-badge {
  font-size: 0.7rem; margin-bottom: 4px;
  padding: 2px 8px; border-radius: 8px;
  background: rgba(30,94,184,0.06);
}
.m-p-badge--kg { background: rgba(15,118,110,0.06); }
.m-p-name { font-size: 0.82rem; font-weight: 700; color: #1e293b; line-height: 1.25; margin-bottom: 6px; }
.m-p-price-row { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.m-p-price { font-size: 0.95rem; font-weight: 800; color: var(--primary); }
.m-p-unit { font-size: 0.7rem; color: #64748b; font-weight: 600; }
.empty-state {
  grid-column: 1 / -1; text-align: center; padding: 40px 20px;
  color: #94a3b8; font-weight: 600; display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}

/* Mobile Ticket Panel */
.m-ticket-panel {
  position: fixed;
  left: calc(12px + var(--safe-area-left));
  right: calc(12px + var(--safe-area-right));
  bottom: calc(var(--mobile-nav-height) + 10px);
  background: #fff; border: 1px solid rgba(148,163,184,0.12);
  border-radius: 24px; padding: 0;
  box-shadow: 0 -4px 32px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.06);
  z-index: 900; max-height: min(48dvh, 420px);
  display: flex; flex-direction: column; overflow: hidden;
}
.m-ticket-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
}
.m-ticket-header__left { display: flex; align-items: center; gap: 10px; }
.m-ticket-header h4 { font-size: 1rem; font-weight: 700; color: #fff; }
.m-ticket-count {
  width: 28px; height: 28px; border-radius: 10px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.85rem;
}
.m-ticket-items { overflow-y: auto; flex: 1; padding: 12px 20px; }
.m-ticket-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid rgba(148,163,184,0.1);
}
.m-ticket-item:last-child { border-bottom: none; }
.m-item-details { display: flex; gap: 8px; align-items: center; font-weight: 600; color: #0f172a; font-size: 0.92rem; }
.m-item-qty { color: var(--primary); font-weight: 800; }
.m-item-right { display: flex; align-items: center; gap: 10px; }
.m-item-price { font-weight: 800; color: #0f172a; font-size: 0.92rem; }
.m-item-del {
  color: #94a3b8; background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px; transition: all 0.15s;
  display: flex; align-items: center;
}
.m-item-del:hover { color: #ef4444; background: #fef2f2; }
.m-ticket-summary {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; background: #f8fafc; border-top: 1px solid rgba(148,163,184,0.1);
}
.m-ticket-summary span { color: #64748b; font-weight: 700; font-size: 0.9rem; }
.m-ticket-summary strong { font-size: 1.2rem; font-weight: 800; color: #0f172a; }
.m-ticket-actions { display: flex; gap: 10px; padding: 14px 20px; }
.m-btn-pay {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: #fff; border: none; padding: 16px;
  border-radius: 14px; font-weight: 800; font-size: 1.05rem;
  box-shadow: 0 4px 16px rgba(22,163,74,0.25);
}
.m-btn-clear {
  width: 52px; display: flex; align-items: center; justify-content: center;
  background: #fef2f2; color: #ef4444; border: 1.5px solid rgba(239,68,68,0.2);
  border-radius: 14px; font-weight: 800; cursor: pointer;
}

/* Ticket slide transition */
.ticket-slide-enter-active { animation: ticketUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.ticket-slide-leave-active { animation: ticketDown 0.25s ease-in; }
@keyframes ticketUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes ticketDown { from { transform: translateY(0); opacity: 1; } to { transform: translateY(100%); opacity: 0; } }

/* =============================================
   MODALES
   ============================================= */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
  backdrop-filter: blur(8px);
}
.modal-card {
  background: #fff; border-radius: 24px; width: 100%; max-width: 450px;
  padding: 0; box-shadow: 0 32px 64px rgba(0,0,0,0.2);
  overflow: hidden;
}

/* Modal transitions */
.modal-fade-enter-active { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-leave-active { animation: modalOut 0.2s ease-in; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes modalOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95) translateY(10px); } }

/* Payment Modal */
.modal-pago {
  display: flex; flex-direction: column;
  width: min(94vw, 720px); max-width: 720px;
  max-height: min(90vh, 800px);
}
.modal-pago__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
}
.modal-pago__title-row { display: flex; align-items: center; gap: 12px; }
.modal-pago__title-row h2 { font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0; }
.modal-close-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 12px; border: none;
  background: rgba(255,255,255,0.1); color: #fff; cursor: pointer;
  transition: background 0.2s;
}
.modal-close-btn:hover { background: rgba(255,255,255,0.2); }

.modal-pago-body {
  flex: 1; overflow-y: auto; padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
}
.modal-pago-body::-webkit-scrollbar { width: 5px; }
.modal-pago-body::-webkit-scrollbar-track { background: transparent; }
.modal-pago-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

/* Total */
.p-total {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 20px; border-radius: 20px;
  background: linear-gradient(135deg, #1e293b, #334155);
  color: #fff;
}
.p-total__label { font-size: 0.8rem; font-weight: 600; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
.p-total__amount { font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; }

/* Payment Methods */
.payment-methods { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.payment-method {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 12px; border: 2px solid rgba(148,163,184,0.15);
  border-radius: 16px; background: #fff; color: #475569;
  font-weight: 700; cursor: pointer; transition: all 0.22s ease;
  font-size: 0.9rem;
}
.payment-method:hover { border-color: rgba(148,163,184,0.3); background: #f8fafc; }
.payment-method__icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: #f1f5f9; transition: all 0.22s;
}
.payment-method.active {
  border-color: var(--success); background: var(--success-light); color: var(--success-dark);
}
.payment-method.active .payment-method__icon { background: rgba(22,163,74,0.15); color: var(--success); }
.payment-method--card.active {
  border-color: var(--primary); background: var(--primary-light); color: var(--primary-dark);
}
.payment-method--card.active .payment-method__icon { background: rgba(30,94,184,0.12); color: var(--primary); }
.payment-method--credit.active {
  border-color: var(--warning); background: var(--warning-light); color: #92400e;
}
.payment-method--credit.active .payment-method__icon { background: rgba(245,158,11,0.12); color: var(--warning); }

/* Client input */
.form-group label {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: #475569; margin-bottom: 8px; font-size: 0.88rem;
}
.input-modal {
  width: 100%; padding: 14px 16px; border: 1.5px solid rgba(148,163,184,0.2);
  border-radius: 14px; font-size: 0.95rem; background: #f8fafc;
  transition: all 0.2s;
}
.input-modal:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(30,94,184,0.1); background: #fff; }
.input-modal--error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }

/* Cash Form */
.p-form__label {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: #475569; margin-bottom: 10px; font-size: 0.88rem;
}
.input-received-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.input-currency {
  font-size: 1.4rem; font-weight: 800; color: #94a3b8;
  width: 32px; text-align: center;
}
.p-input {
  flex: 1; padding: 14px 16px; border: 2px solid var(--primary);
  border-radius: 14px; font-size: 1.4rem; font-weight: 800;
  text-align: right; outline: none; color: #0f172a;
  transition: box-shadow 0.2s;
}
.p-input:focus { box-shadow: 0 0 0 4px rgba(30,94,184,0.1); }
.btn-clear-input {
  display: flex; align-items: center; gap: 6px;
  padding: 14px 18px; background: #f1f5f9; border: 1.5px solid rgba(148,163,184,0.15);
  border-radius: 14px; font-weight: 700; color: #64748b; cursor: pointer;
  transition: all 0.15s; font-size: 0.85rem;
}
.btn-clear-input:hover { background: #e2e8f0; }

/* Quick Cash */
.quick-cash-container { display: flex; flex-direction: column; gap: 12px; }
.btn-exact {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px; border-radius: 14px;
  background: linear-gradient(135deg, var(--success-light), #bbf7d0);
  border: 2px solid var(--success);
  color: var(--success-dark); font-weight: 800; font-size: 1rem; cursor: pointer;
  transition: all 0.2s;
}
.btn-exact:hover { background: linear-gradient(135deg, #bbf7d0, #86efac); transform: translateY(-1px); }
.subtitle-cash {
  font-size: 0.78rem; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.quick-cash { display: grid; gap: 8px; }
.quick-cash--bills { grid-template-columns: repeat(3, 1fr); }
.quick-cash--coins { grid-template-columns: repeat(6, 1fr); }

/* Bill buttons with Mexican currency colors */
.btn-bill {
  padding: 14px 8px; border: none; border-radius: 14px;
  font-weight: 800; font-size: 1rem; cursor: pointer;
  color: #fff; transition: all 0.2s ease;
  position: relative; overflow: hidden;
}
.btn-bill::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%);
  pointer-events: none;
}
.btn-bill:hover { transform: translateY(-2px); filter: brightness(1.1); }
.btn-bill:active { transform: translateY(0) scale(0.97); }
.btn-bill--1000 { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
.btn-bill--500 { background: linear-gradient(135deg, #2563eb, #1d4ed8); box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
.btn-bill--200 { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 4px 14px rgba(22,163,74,0.3); }
.btn-bill--100 { background: linear-gradient(135deg, #dc2626, #b91c1c); box-shadow: 0 4px 14px rgba(220,38,38,0.3); }
.btn-bill--50 { background: linear-gradient(135deg, #db2777, #be185d); box-shadow: 0 4px 14px rgba(219,39,119,0.3); }
.btn-bill--20 { background: linear-gradient(135deg, #0891b2, #0e7490); box-shadow: 0 4px 14px rgba(8,145,178,0.3); }
.btn-bill__value { position: relative; z-index: 1; }

/* Coin buttons */
.btn-coin {
  padding: 12px 4px; border: 2px solid #d4d4d8; border-radius: 50%;
  background: linear-gradient(145deg, #fafafa, #e4e4e7);
  font-weight: 800; font-size: 0.82rem; color: #3f3f46; cursor: pointer;
  transition: all 0.2s; aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.06);
}
.btn-coin:hover {
  transform: translateY(-2px) scale(1.05);
  border-color: #a1a1aa;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.1);
}
.btn-coin:active { transform: translateY(0) scale(0.95); }

/* Cash Breakdown */
.cash-breakdown {
  display: flex; flex-direction: column; gap: 10px;
  padding: 14px 16px; border-radius: 16px;
  background: #f8fafc; border: 1.5px solid rgba(148,163,184,0.12);
}
.cash-breakdown__header {
  display: flex; align-items: center; gap: 6px;
  color: #64748b; font-size: 0.78rem; font-weight: 800; text-transform: uppercase;
}
.cash-breakdown__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cash-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border: 1.5px solid #bbf7d0; border-radius: 12px;
  background: #dcfce7; color: #15803d; font-weight: 800; font-size: 0.85rem;
  cursor: pointer; transition: all 0.15s;
}
.cash-chip:hover { background: #bbf7d0; border-color: #86efac; }
.cash-chip svg { color: #22c55e; }

.breakdown-fade-enter-active { animation: fadeSlideIn 0.25s ease-out; }
.breakdown-fade-leave-active { animation: fadeSlideOut 0.2s ease-in; }
@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeSlideOut { from { opacity: 1; } to { opacity: 0; } }

/* Alt Payment Boxes */
.alt-pay-box {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 24px; border-radius: 20px; text-align: center;
}
.alt-pay-box__icon {
  width: 56px; height: 56px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.alt-pay-box strong { font-size: 1.05rem; }
.alt-pay-box span { font-size: 0.88rem; line-height: 1.5; opacity: 0.85; }
.card-box { background: linear-gradient(135deg, #eff6ff, #dbeafe); color: #1d4ed8; }
.card-box .alt-pay-box__icon { background: rgba(37,99,235,0.1); }
.fiado-box { background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #92400e; }
.fiado-box .alt-pay-box__icon { background: rgba(245,158,11,0.1); }

/* Change Indicator */
.modal-cambio {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  text-align: center; padding: 20px; border-radius: 20px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  transition: all 0.3s ease;
}
.modal-cambio__label { font-size: 0.82rem; font-weight: 700; color: inherit; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.04em; }
.modal-cambio__amount { font-size: 2rem; font-weight: 800; color: inherit; letter-spacing: -0.02em; }
.modal-cambio { color: var(--success-dark); }
.modal-cambio--error { background: linear-gradient(135deg, #fee2e2, #fecaca); color: var(--danger-dark); }
.modal-cambio--card { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: var(--primary-dark); }
.modal-cambio--fiado { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }

/* Modal Footer */
.modal-footer { display: flex; gap: 12px; padding: 20px 24px; border-top: 1px solid rgba(148,163,184,0.12); background: #fafbfc; }
.modal-pago .modal-footer { flex-shrink: 0; }
.btn-cancelar {
  flex: 1; padding: 16px; border: 1.5px solid rgba(148,163,184,0.2);
  border-radius: 14px; background: #fff; font-weight: 700; color: #64748b;
  cursor: pointer; transition: all 0.15s; font-size: 0.95rem;
}
.btn-cancelar:hover { background: #f1f5f9; border-color: rgba(148,163,184,0.3); }
.btn-success {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; border: none; border-radius: 14px;
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: #fff; font-weight: 800; font-size: 1.05rem; cursor: pointer;
  box-shadow: 0 6px 20px rgba(22,163,74,0.25);
  transition: all 0.2s;
}
.btn-success:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(22,163,74,0.3); }
.btn-success:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.btn-primary {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; border: none; border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff; font-weight: 800; cursor: pointer; font-size: 1.05rem;
  box-shadow: 0 6px 20px rgba(30,94,184,0.25);
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

/* =============================================
   MODAL PESO
   ============================================= */
.modal-peso-card { max-width: 420px; padding: 0; }
.peso-header {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 24px 24px 16px; text-align: center;
}
.peso-header__icon {
  width: 56px; height: 56px; border-radius: 18px;
  background: linear-gradient(135deg, #f3e8ff, #ede9fe);
  display: flex; align-items: center; justify-content: center;
  color: #7c3aed; margin-bottom: 4px;
}
.peso-header h3 { font-size: 1.35rem; font-weight: 800; color: #0f172a; }
.peso-header__price { color: #64748b; font-weight: 600; font-size: 0.9rem; }

.weight-display {
  margin: 0 24px; padding: 20px; border-radius: 20px;
  background: linear-gradient(135deg, #f3e8ff, #ede9fe);
  display: flex; align-items: baseline; justify-content: center; gap: 8px;
}
.w-val { font-size: 2.8rem; font-weight: 800; color: #7c3aed; letter-spacing: -2px; font-variant-numeric: tabular-nums; }
.w-unit { font-size: 1.3rem; color: #9333ea; font-weight: 700; }

.weight-preview {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  text-align: center; color: #94a3b8; font-weight: 600; font-size: 1.05rem;
  padding: 12px 24px; transition: color 0.2s;
}
.weight-preview span { font-weight: 600; }
.weight-preview strong { font-weight: 800; }
.weight-preview--ok { color: var(--success); }
.weight-preview--ok strong { color: var(--success-dark); }

.numpad {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; padding: 0 24px 8px;
}
.numpad button {
  padding: 18px; background: #f5f7fb; border: 1.5px solid rgba(148,163,184,0.1);
  border-radius: 16px; font-size: 1.4rem; font-weight: 700; color: #1e293b;
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.numpad button:hover { background: #e8edf5; border-color: rgba(148,163,184,0.2); }
.numpad button:active { transform: scale(0.94); background: #dde4ee; }
.numpad__del { color: #ef4444 !important; }
.numpad__del:hover { background: #fef2f2 !important; }
.numpad__dot { font-size: 1.8rem !important; }

.modal-peso-card .modal-footer { padding: 16px 24px 24px; border-top: none; background: transparent; }

/* =============================================
   RESPONSIVE
   ============================================= */
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
  .pc-ticket-shell { border-radius: 20px; }
  .pc-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .pc-cart-item { flex-wrap: wrap; }
  .pc-item-info { min-width: 160px; }
  .pc-item-subtotal { margin-left: auto; min-width: 0; }
  .pc-actions { flex-direction: column; }
}

@media (max-width: 960px) {
  .desktop-layout { padding: 16px; }
  .pc-toolbar__copy h1 { font-size: 1.6rem; }
  .pc-toolbar__actions > * { width: 100%; }
  .pc-scan-btn { justify-content: center; }
  .pc-section-header { flex-direction: column; align-items: stretch; }
  .pc-product-count, .pc-ticket-chip { justify-content: center; }
  .pc-cart-section { min-height: 460px; }
}

@media (max-width: 768px) {
  .modal-card {
    max-width: 100%; border-radius: 24px 24px 0 0;
    position: fixed; bottom: 0; margin: 0;
    padding: 0; max-height: 90vh; overflow-y: auto;
  }
  .modal-overlay { padding: 0; align-items: flex-end; }
  .modal-pago { max-height: min(88dvh, 800px); }
  .p-total { padding: 16px; }
  .p-total__amount { font-size: 2.2rem; }
  .payment-methods { grid-template-columns: 1fr; }
  .quick-cash--bills { grid-template-columns: repeat(3, 1fr); }
  .quick-cash--coins { grid-template-columns: repeat(3, 1fr); }
  .btn-coin { border-radius: 14px; aspect-ratio: auto; }
  .modal-pago .modal-footer { padding-bottom: calc(16px + var(--safe-area-bottom)); }
}

@media (max-width: 640px) {
  .m-stats-row { grid-template-columns: 1fr; }
  .m-ticket-actions { flex-direction: row; }

  .m-products {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    padding: 14px 16px;
  }

  .m-header,
  .m-controls { padding-left: 16px; padding-right: 16px; }

  .m-ticket-panel {
    left: calc(8px + var(--safe-area-left));
    right: calc(8px + var(--safe-area-right));
    bottom: calc(var(--mobile-nav-height) + 8px);
    max-height: min(52dvh, 430px);
  }

  .input-received-wrapper { flex-wrap: wrap; }
  .btn-clear-input { width: 100%; justify-content: center; }
  .quick-cash--bills { grid-template-columns: repeat(3, 1fr); }
  .btn-bill { padding: 12px 6px; font-size: 0.9rem; }
}

.modal-pago .quick-cash-container {
  overflow-y: auto;
  max-height: min(42vh, 380px);
  padding-right: 4px;
}
</style>
