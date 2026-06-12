<template>
  <AppLayout>
    <div class="ventas-wrapper" :class="{ 'is-mobile-ui': isMobileView }">
      
      <!-- Feedback Global -->
      <Transition name="notif">
        <div v-if="scanMsg" class="scan-feedback" :class="scanMsgType">
          <div class="scan-feedback__icon">
            <svg v-if="scanMsgType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <span class="scan-feedback__text">{{ scanMsg }}</span>
        </div>
      </Transition>

      <!-- ==========================================
           VISTA MÓVIL (APK / TABLET)
           ========================================== -->
      <div v-if="isMobileView" class="mobile-layout" :class="{ 'mobile-layout--ticket-open': carrito.length > 0 && currentRole !== 'admin' }">
        <div class="m-header">
          <div class="m-store-info">
            <span class="m-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Pollería
            </span>
            <h3>{{ currentRole === 'admin' ? 'Administración de Pollo' : 'Venta Rápida' }}</h3>
          </div>
        </div>

        <div class="m-products">
          <button v-for="p in listaPollos" :key="p.id" class="m-p-card" @click="handleCardClick(p)">
            <span class="m-p-badge">🍗</span>
            <span class="m-p-name">{{ p.nombre }}</span>
            <div class="m-p-price-row">
              <span class="m-p-price">${{ p.precio.toFixed(0) }}</span>
            </div>
            <div class="m-p-action" v-if="currentRole === 'admin'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </div>
          </button>
          <div v-if="!listaPollos.length" class="empty-state">
            <div class="pc-empty-state__icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
            No hay opciones configuradas.
          </div>
        </div>

        <!-- Modo Venta Cajero (Móvil) -->
        <Transition name="ticket-slide">
          <div v-if="carrito.length > 0 && currentRole !== 'admin'" class="m-ticket-panel">
            <div class="m-ticket-header">
              <div class="m-ticket-header__left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <h4>Ticket Pollería</h4>
              </div>
              <span class="m-ticket-count">{{ carrito.length }}</span>
            </div>
            <div class="m-ticket-items">
              <div v-for="item in carrito" :key="item._uid" class="m-ticket-item">
                <div class="m-item-details">
                  <span class="m-item-qty">{{ item.qty }}x</span>
                  <span class="m-item-name">{{ item.nombre }}</span>
                </div>
                <div class="m-item-right">
                  <span class="m-item-price">${{ (item.qty * item.precio).toFixed(2) }}</span>
                  <button class="m-item-del" @click="eliminarDeCarrito(item)">
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
              <button class="m-btn-clear" @click="cancelarCarrito">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Modo Edición Admin (Móvil) -->
        <Transition name="ticket-slide">
          <div v-if="currentRole === 'admin'" class="m-ticket-panel m-admin-panel">
            <div class="m-ticket-header">
              <div class="m-ticket-header__left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <h4>{{ polloEditando.id ? 'Editar Pollo' : 'Nuevo Pollo' }}</h4>
              </div>
              <button class="m-btn-new" @click="nuevoPollo" v-if="polloEditando.id">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nuevo
              </button>
            </div>
            <div class="admin-form">
              <label>Nombre:</label>
              <input type="text" v-model="polloEditando.nombre" class="admin-input" placeholder="Ej. Pierna y Muslo" />
              <label>Precio:</label>
              <input type="number" v-model.number="polloEditando.precio" class="admin-input" placeholder="0.00" />
              
              <div class="admin-actions">
                <button class="m-btn-save" @click="guardarPolloAdmin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Guardar
                </button>
                <button class="m-btn-del" v-if="polloEditando.id" @click="eliminarPolloAdmin">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ==========================================
           VISTA ESCRITORIO
           ========================================== -->
      <div v-else class="desktop-layout">
        <div class="pc-toolbar">
          <div class="pc-toolbar__copy">
            <div class="pc-kicker">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {{ currentRole === 'admin' ? 'Administración' : 'Caja Separada' }}
            </div>
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
              <article v-for="p in listaPollos" :key="p.id" class="pc-p-card" @click="handleCardClick(p)">
                <div class="pc-p-top">
                  <span class="pc-p-unit">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Pollo
                  </span>
                </div>
                <span class="pc-p-name">{{ p.nombre }}</span>
                <div class="pc-p-footer">
                  <span class="pc-p-price">${{ p.precio.toFixed(2) }}</span>
                  <button v-if="currentRole !== 'admin'" class="pc-p-add-btn" @click.stop="handleCardClick(p)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span v-else class="pc-p-edit-lbl">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </span>
                </div>
              </article>
            </div>
            <div v-else class="pc-empty-state">
              <div class="pc-empty-state__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
              <strong>Sin opciones</strong>
              <span>No hay configuraciones de pollo disponibles.</span>
            </div>
          </section>

          <!-- Sección Derecha: Ticket (Cajero) o Admin Form (Admin) -->
          <aside class="pc-cart-section">
            
            <!-- MODO CAJERO: TICKET -->
            <div v-if="currentRole !== 'admin'" class="pc-ticket-shell">
              <div class="pc-ticket-zigzag"></div>

              <div class="pc-ticket-inner">
                <div class="pc-section-header pc-section-header--ticket">
                  <div class="pc-section-text">
                    <div class="pc-section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      Ticket Pollería
                    </div>
                  </div>
                  <span class="pc-ticket-chip">{{ carrito.length }} items</span>
                </div>

                <div class="pc-cart-list">
                  <div v-if="!carrito.length" class="pc-empty">
                    <div class="pc-empty__icon-wrap">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </div>
                    <span>El carrito de pollo está vacío</span>
                  </div>
                  <TransitionGroup name="cart-item">
                    <div v-for="item in carrito" :key="item._uid" class="pc-cart-item">
                      <div class="pc-cart-item__indicator"></div>
                      <div class="pc-item-info">
                        <strong>{{ item.nombre }}</strong>
                        <span>${{ item.precio.toFixed(2) }} c/u</span>
                      </div>
                      <div class="pc-item-qty">
                        <button @click="menos(item)" aria-label="Menos">−</button>
                        <span>{{ item.qty }}</span>
                        <button @click="mas(item)" aria-label="Más">+</button>
                      </div>
                      <div class="pc-item-subtotal">${{ (item.qty * item.precio).toFixed(2) }}</div>
                      <button class="pc-item-del" @click="eliminarDeCarrito(item)" aria-label="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6L18.1 19.5c-.1 1.4-1.2 2.5-2.6 2.5H8.5c-1.4 0-2.5-1.1-2.6-2.5L5 6"/><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"/></svg>
                      </button>
                    </div>
                  </TransitionGroup>
                </div>

                <div class="pc-cart-footer">
                  <div class="pc-ticket-summary" v-if="carrito.length">
                    <div class="pc-summary-total">
                      <span>Total a Pagar</span>
                      <strong>${{ totalCarrito.toFixed(2) }}</strong>
                    </div>
                  </div>
                  <div class="pc-actions">
                    <button class="pc-btn-pay" :disabled="!carrito.length" @click="abrirPagar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      Cobrar Pollo
                    </button>
                    <button class="pc-btn-cancel" @click="cancelarCarrito" :disabled="!carrito.length">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
              <div class="pc-ticket-zigzag pc-ticket-zigzag--bottom"></div>
            </div>

            <!-- MODO ADMIN: FORMULARIO -->
            <div v-else class="pc-ticket-shell pc-admin-shell">
              <div class="pc-ticket-inner">
                <div class="pc-section-header pc-section-header--ticket" style="display: flex; justify-content: space-between; align-items: center;">
                  <div class="pc-section-text">
                    <div class="pc-section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      {{ polloEditando.id ? 'Editar Pollo' : 'Nuevo Pollo' }}
                    </div>
                  </div>
                  <button v-if="polloEditando.id" class="pc-btn-new-admin" @click="nuevoPollo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Nuevo
                  </button>
                </div>

                <div class="admin-form-pc">
                  <div class="form-group">
                    <label>Nombre del Producto</label>
                    <input type="text" v-model="polloEditando.nombre" class="input-modal" placeholder="Ej. Medio Pollo" />
                  </div>
                  <div class="form-group">
                    <label>Precio de Venta ($)</label>
                    <input type="number" v-model.number="polloEditando.precio" class="input-modal" placeholder="0.00" />
                  </div>
                </div>

                <div class="pc-cart-footer" style="margin-top: auto;">
                  <div class="pc-actions">
                    <button class="pc-btn-pay pc-btn-save-admin" @click="guardarPolloAdmin" :disabled="!polloEditando.nombre || polloEditando.precio <= 0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Guardar Cambios
                    </button>
                    <button class="pc-btn-cancel" v-if="polloEditando.id" @click="eliminarPolloAdmin">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>

    <!-- Modal Pago (Sólo Cajeros/Venta) -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="mostrarPagar" class="modal-overlay" @click.self="mostrarPagar = false">
          <div class="modal-card modal-pago">
            <!-- Header del modal -->
            <div class="modal-pago__header">
              <div class="modal-pago__title-row">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/></svg>
                <h2>Cobrar Pollo</h2>
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
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import { usePollosStore } from '../stores/pollos'
import { useVentasPolloStore } from '../stores/ventasPollo'
import { PAYMENT_METHODS } from '../utils/sales'

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
const clienteNombre = ref('')
const paymentMethod = ref(PAYMENT_METHODS.CASH)
const cashEntries = ref([])

const billetesMx = [1000, 500, 200, 100, 50, 20]
const monedasMx = [20, 10, 5, 2, 1, 0.5]
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
    await ventasPolloStore.registrarVenta(carrito.value, totalCarrito.value, {
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
    clienteNombre.value = ''
    montoRecibido.value = 0
    cashEntries.value = []
    paymentMethod.value = PAYMENT_METHODS.CASH
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
/* =============================================
   BASE & WRAPPER (TEMA ÁMBAR)
   ============================================= */
.ventas-wrapper {
  min-height: 100%;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
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
.scan-feedback.success { background: linear-gradient(135deg, #d97706, #b45309); }
.scan-feedback.error { background: linear-gradient(135deg, #dc2626, #b91c1c); }
.scan-feedback__icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(255,255,255,0.2); flex-shrink: 0;
}
.scan-feedback__text { min-width: 0; }

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
  border: 1px solid rgba(245,158,11,0.2);
  box-shadow: 0 4px 24px rgba(217,119,6,0.06);
}
.pc-kicker {
  display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 8px; color: #d97706;
  font-size: var(--text-xs); font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.pc-toolbar__copy h1 { font-size: 1.85rem; letter-spacing: -0.04em; color: #451a03; }
.pc-toolbar__copy p { margin-top: 6px; color: #78350f; opacity: 0.8; line-height: 1.55; }

/* Body Grid */
.pc-body { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.85fr); gap: 20px; flex: 1; min-height: 0; }

/* Products Section */
.pc-products-section {
  padding: 24px; overflow-y: auto; border-radius: 24px;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(16px);
  border: 1px solid rgba(245,158,11,0.2);
  box-shadow: 0 4px 24px rgba(217,119,6,0.06);
}
.pc-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.pc-section-header--ticket { margin-bottom: 0; padding-bottom: 18px; border-bottom: 1px solid rgba(245,158,11,0.2); }
.pc-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.85rem; font-weight: 800; color: #b45309;
  text-transform: uppercase; letter-spacing: 0.08em;
}

/* Product Grid */
.pc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
.pc-p-card {
  display: flex; flex-direction: column; gap: 10px;
  padding: 18px; border-radius: 20px;
  background: #fff; border: 1.5px solid rgba(245,158,11,0.15);
  text-align: left; cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
  position: relative; overflow: hidden;
}
.pc-p-card::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0));
  opacity: 0; transition: opacity 0.22s;
}
.pc-p-card:hover {
  transform: translateY(-3px);
  border-color: rgba(245,158,11,0.4);
  box-shadow: 0 12px 32px rgba(217,119,6,0.12);
}
.pc-p-card:hover::before { opacity: 1; }
.pc-p-card:active { transform: translateY(-1px) scale(0.98); }
.pc-p-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; position: relative; z-index: 1; }
.pc-p-unit, .pc-ticket-chip {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 10px; font-size: 0.7rem; font-weight: 800;
}
.pc-p-unit { padding: 5px 10px; background: rgba(245,158,11,0.12); color: #b45309; }
.pc-p-name {
  display: block; min-height: 2.4em; font-weight: 700;
  font-size: 0.93rem; color: #451a03; line-height: 1.35;
  position: relative; z-index: 1;
}
.pc-p-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; position: relative; z-index: 1; }
.pc-p-price { color: #d97706; font-weight: 800; font-size: 1.05rem; }
.pc-p-add-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 12px rgba(217,119,6,0.25);
  transition: all 0.2s ease;
}
.pc-p-add-btn:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(217,119,6,0.35); }
.pc-p-add-btn:active { transform: scale(0.95); }
.pc-p-edit-lbl {
  display: inline-flex; align-items: center; gap: 4px;
  color: #8b5cf6; font-weight: 700; font-size: 0.85rem;
}

/* Empty State */
.pc-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; min-height: 240px; border-radius: 20px;
  background: linear-gradient(135deg, #fef3c7, #fffbeb);
  color: #b45309; border: 2px dashed rgba(245,158,11,0.3);
}
.pc-empty-state__icon { color: #d97706; }
.pc-empty-state strong { color: #92400e; font-size: 1rem; }
.pc-empty-state span { font-size: 0.9rem; }

/* =============================================
   TICKET / CART (Desktop)
   ============================================= */
.pc-cart-section { min-height: 0; }
.pc-ticket-shell {
  height: 100%; display: flex; flex-direction: column;
  position: relative;
  background: #fefefe;
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(217,119,6,0.08);
  overflow: hidden;
}
.pc-ticket-zigzag {
  height: 12px; width: 100%; flex-shrink: 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  clip-path: polygon(0% 0%, 100% 0%, 100% 40%, 97.5% 100%, 92.5% 40%, 87.5% 100%, 82.5% 40%, 77.5% 100%, 72.5% 40%, 67.5% 100%, 62.5% 40%, 57.5% 100%, 52.5% 40%, 47.5% 100%, 42.5% 40%, 37.5% 100%, 32.5% 40%, 27.5% 100%, 22.5% 40%, 17.5% 100%, 12.5% 40%, 7.5% 100%, 2.5% 40%, 0% 100%);
}
.pc-ticket-zigzag--bottom {
  transform: rotate(180deg);
  background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
}
.pc-ticket-inner { flex: 1; display: flex; flex-direction: column; padding: 22px; min-height: 0; }
.pc-ticket-chip { padding: 6px 12px; background: rgba(245,158,11,0.12); color: #b45309; border-radius: 10px; }

/* Admin shell overrides */
.pc-admin-shell .pc-ticket-zigzag { background: linear-gradient(135deg, #64748b 0%, #475569 100%); }
.pc-admin-shell .pc-section-title { color: #334155; }
.pc-admin-shell .pc-section-header--ticket { border-bottom-color: rgba(148,163,184,0.2); }
.pc-btn-new-admin {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569;
  padding: 8px 14px; border-radius: 10px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.pc-btn-new-admin:hover { background: #e2e8f0; }

.admin-form-pc { display: flex; flex-direction: column; gap: 16px; margin-top: 10px; }
.form-group label {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: #64748b; margin-bottom: 8px; font-size: 0.88rem;
}
.input-modal {
  width: 100%; padding: 14px 16px; border: 1.5px solid rgba(148,163,184,0.2);
  border-radius: 14px; font-size: 0.95rem; background: #f8fafc;
  transition: all 0.2s; color: #1e293b; font-weight: 600;
}
.input-modal:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); background: #fff; }
.input-modal--error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.1); }

/* Cart List */
.pc-cart-list { flex: 1; padding: 16px 0; overflow-y: auto; }
.pc-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; gap: 8px;
}
.pc-empty__icon-wrap {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  display: flex; align-items: center; justify-content: center;
  color: #d97706; margin-bottom: 4px;
}
.pc-empty span { color: #b45309; font-weight: 700; font-size: 1rem; }

/* Cart Items */
.pc-cart-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; background: #fff;
  border: 1px solid rgba(245,158,11,0.15);
  border-radius: 16px; margin-bottom: 8px;
  transition: all 0.2s ease;
  position: relative;
}
.pc-cart-item:hover { border-color: rgba(245,158,11,0.3); box-shadow: 0 4px 12px rgba(217,119,6,0.06); }
.pc-cart-item__indicator {
  width: 4px; height: 32px; border-radius: 4px;
  background: linear-gradient(180deg, #f59e0b, #d97706);
  flex-shrink: 0;
}
.pc-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pc-item-info strong { color: #451a03; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-item-info span { color: #b45309; font-size: 0.78rem; }
.pc-item-qty {
  display: flex; align-items: center; gap: 2px;
  background: #fffbeb; border: 1px solid rgba(245,158,11,0.15);
  border-radius: 12px; padding: 2px;
}
.pc-item-qty button {
  width: 32px; height: 32px; border: none; background: transparent;
  cursor: pointer; font-size: 1.1rem; font-weight: 700; color: #b45309;
  border-radius: 10px; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.pc-item-qty button:hover { background: #fef3c7; color: #d97706; }
.pc-item-qty button:active { transform: scale(0.9); }
.pc-item-qty span { font-weight: 800; min-width: 24px; text-align: center; color: #451a03; font-size: 0.95rem; }
.pc-item-subtotal { min-width: 80px; text-align: right; font-weight: 800; font-size: 1rem; color: #451a03; }
.pc-item-del {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border: none; background: transparent;
  color: #fca5a5; cursor: pointer; border-radius: 10px;
  transition: all 0.2s;
}
.pc-item-del:hover { color: #ef4444; background: #fef2f2; }

/* Cart Item Transitions */
.cart-item-enter-active { animation: cartItemIn 0.3s ease-out; }
.cart-item-leave-active { animation: cartItemOut 0.2s ease-in; }

/* Cart Footer */
.pc-cart-footer { padding-top: 18px; border-top: 1px solid rgba(245,158,11,0.2); }
.pc-admin-shell .pc-cart-footer { border-top-color: rgba(148,163,184,0.2); }
.pc-ticket-summary { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.pc-summary-total {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-radius: 16px;
  background: linear-gradient(135deg, #451a03, #78350f);
  color: #fff;
}
.pc-summary-total span { font-size: 0.9rem; font-weight: 600; opacity: 0.9; color: #fde68a; }
.pc-summary-total strong { font-size: 1.55rem; font-weight: 800; letter-spacing: -0.02em; }

/* Action Buttons */
.pc-actions { display: flex; gap: 12px; }
.pc-btn-pay {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 10px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff; border: none; padding: 18px;
  border-radius: 16px; font-weight: 800; font-size: 1.1rem; cursor: pointer;
  box-shadow: 0 8px 24px rgba(217,119,6,0.25);
  transition: all 0.22s ease;
}
.pc-btn-pay:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(217,119,6,0.35); }
.pc-btn-pay:active:not(:disabled) { transform: translateY(0) scale(0.98); }
.pc-btn-pay:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.pc-btn-save-admin { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 8px 24px rgba(139,92,246,0.25); }
.pc-btn-save-admin:hover:not(:disabled) { box-shadow: 0 12px 32px rgba(139,92,246,0.35); }

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
  background: linear-gradient(180deg, #fffbeb, #fef3c7);
}
.mobile-layout--ticket-open { padding-bottom: calc(min(48dvh, 420px) + 28px); }

.m-header {
  padding: 20px; background: #fff;
  border-bottom: 1px solid rgba(245,158,11,0.2);
  box-shadow: 0 2px 12px rgba(217,119,6,0.04);
}
.m-badge {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #b45309; padding: 6px 14px; border-radius: 10px;
  font-size: 0.75rem; font-weight: 700;
  display: inline-flex; align-items: center; gap: 6px;
}
.m-header h3 { font-size: 1.45rem; font-weight: 800; color: #451a03; margin-top: 10px; }

/* Mobile Products */
.m-products { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 16px 20px; }
.m-p-card {
  background: #fff; border-radius: 16px; padding: 16px 10px;
  border: 1.5px solid rgba(245,158,11,0.15);
  box-shadow: 0 2px 8px rgba(217,119,6,0.04);
  text-align: center; display: flex; flex-direction: column;
  align-items: center; justify-content: center; min-height: 110px;
  transition: all 0.2s ease; position: relative; cursor: pointer;
}
.m-p-card:active { transform: scale(0.96); }
.m-p-badge { font-size: 1.2rem; margin-bottom: 6px; }
.m-p-name { font-size: 0.85rem; font-weight: 700; color: #451a03; line-height: 1.25; margin-bottom: 6px; }
.m-p-price-row { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.m-p-price { font-size: 1.05rem; font-weight: 800; color: #d97706; }
.m-p-action {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 0.8rem; font-weight: 700; color: #8b5cf6; margin-top: 6px;
}
.empty-state {
  grid-column: 1 / -1; text-align: center; padding: 40px 20px;
  color: #b45309; font-weight: 600; display: flex; flex-direction: column;
  align-items: center; gap: 10px;
}

/* Mobile Ticket Panel */
.m-ticket-panel {
  position: fixed;
  left: calc(12px + var(--safe-area-left));
  right: calc(12px + var(--safe-area-right));
  bottom: calc(var(--mobile-nav-height) + 10px);
  background: #fff; border: 1px solid rgba(245,158,11,0.2);
  border-radius: 24px; padding: 0;
  box-shadow: 0 -4px 32px rgba(217,119,6,0.15), 0 0 0 1px rgba(245,158,11,0.1);
  z-index: 900; max-height: min(48dvh, 420px);
  display: flex; flex-direction: column; overflow: hidden;
}
.m-admin-panel { border-color: rgba(148,163,184,0.2); box-shadow: 0 -4px 32px rgba(15,23,42,0.12); }
.m-ticket-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #451a03, #78350f);
  color: #fff;
}
.m-admin-panel .m-ticket-header { background: linear-gradient(135deg, #0f172a, #1e293b); }
.m-ticket-header__left { display: flex; align-items: center; gap: 10px; }
.m-ticket-header h4 { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }
.m-ticket-count {
  width: 28px; height: 28px; border-radius: 10px;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.85rem;
}
.m-btn-new {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.15); border: none; color: #fff;
  padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.85rem;
}
.m-ticket-items { overflow-y: auto; flex: 1; padding: 12px 20px; }
.m-ticket-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid rgba(245,158,11,0.15);
}
.m-ticket-item:last-child { border-bottom: none; }
.m-item-details { display: flex; gap: 8px; align-items: center; font-weight: 600; color: #451a03; font-size: 0.92rem; }
.m-item-qty { color: #d97706; font-weight: 800; background: #fffbeb; padding: 2px 6px; border-radius: 6px; }
.m-item-right { display: flex; align-items: center; gap: 10px; }
.m-item-price { font-weight: 800; color: #451a03; font-size: 0.92rem; }
.m-item-del {
  color: #fca5a5; background: transparent; border: none; padding: 6px;
  cursor: pointer; border-radius: 8px; transition: all 0.15s;
  display: flex; align-items: center;
}
.m-item-del:hover { color: #ef4444; background: #fef2f2; }
.m-ticket-summary {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; background: #fffbeb; border-top: 1px solid rgba(245,158,11,0.2);
}
.m-ticket-summary span { color: #b45309; font-weight: 700; font-size: 0.9rem; }
.m-ticket-summary strong { font-size: 1.2rem; font-weight: 800; color: #d97706; }
.m-ticket-actions { display: flex; gap: 10px; padding: 14px 20px; }
.m-btn-pay {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff; border: none; padding: 16px;
  border-radius: 14px; font-weight: 800; font-size: 1.05rem;
  box-shadow: 0 4px 16px rgba(217,119,6,0.25);
}
.m-btn-clear {
  width: 52px; display: flex; align-items: center; justify-content: center;
  background: #fef2f2; color: #ef4444; border: 1.5px solid rgba(239,68,68,0.2);
  border-radius: 14px; font-weight: 800; cursor: pointer;
}

/* Admin Mobile Form */
.admin-form { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
.admin-input {
  border: 1.5px solid rgba(148,163,184,0.3); border-radius: 12px;
  padding: 14px; font-size: 1.05rem; font-weight: 600; outline: none;
  transition: border-color 0.2s;
}
.admin-input:focus { border-color: #8b5cf6; }
.admin-actions { display: flex; gap: 10px; margin-top: 10px; }
.m-btn-save {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none;
  padding: 14px; border-radius: 14px; font-weight: 800;
  box-shadow: 0 4px 16px rgba(139,92,246,0.25);
}
.m-btn-del {
  flex: 1; display: flex; align-items: center; justify-content: center;
  background: #fef2f2; color: #ef4444; border: 1.5px solid rgba(239,68,68,0.2);
  padding: 14px; border-radius: 14px; font-weight: 700;
}

/* Ticket slide transition */
.ticket-slide-enter-active { animation: ticketUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.ticket-slide-leave-active { animation: ticketDown 0.25s ease-in; }

/* =============================================
   MODALES
   ============================================= */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(69,26,3,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
  backdrop-filter: blur(8px);
}
.modal-card {
  background: #fff; border-radius: 24px; width: 100%; max-width: 450px;
  padding: 0; box-shadow: 0 32px 64px rgba(69,26,3,0.2);
  overflow: hidden;
}

/* Modal transitions */
.modal-fade-enter-active { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fade-leave-active { animation: modalOut 0.2s ease-in; }

/* Payment Modal */
.modal-pago {
  display: flex; flex-direction: column;
  width: min(94vw, 720px); max-width: 720px;
  max-height: min(90vh, 800px);
}
.modal-pago__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #451a03, #78350f);
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
.modal-pago-body::-webkit-scrollbar-thumb { background: #fde68a; border-radius: 10px; }

/* Total */
.p-total {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 20px; border-radius: 20px;
  background: linear-gradient(135deg, #78350f, #b45309);
  color: #fff;
}
.p-total__label { font-size: 0.8rem; font-weight: 600; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; color: #fde68a;}
.p-total__amount { font-size: 2.8rem; font-weight: 800; letter-spacing: -0.03em; }

/* Payment Methods */
.payment-methods { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.payment-method {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 16px 12px; border: 2px solid rgba(245,158,11,0.15);
  border-radius: 16px; background: #fff; color: #78350f;
  font-weight: 700; cursor: pointer; transition: all 0.22s ease;
  font-size: 0.9rem;
}
.payment-method:hover { border-color: rgba(245,158,11,0.3); background: #fffbeb; }
.payment-method__icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: #fffbeb; transition: all 0.22s;
}
.payment-method.active {
  border-color: #d97706; background: #fef3c7; color: #92400e;
}
.payment-method.active .payment-method__icon { background: rgba(217,119,6,0.15); color: #d97706; }

/* Client input */
.form-group label {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: #78350f; margin-bottom: 8px; font-size: 0.88rem;
}

/* Cash Form */
.p-form__label {
  display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: #78350f; margin-bottom: 10px; font-size: 0.88rem;
}
.input-received-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.input-currency {
  font-size: 1.4rem; font-weight: 800; color: #b45309;
  width: 32px; text-align: center;
}
.p-input {
  flex: 1; padding: 14px 16px; border: 2px solid #d97706;
  border-radius: 14px; font-size: 1.4rem; font-weight: 800;
  text-align: right; outline: none; color: #451a03;
  transition: box-shadow 0.2s;
}
.p-input:focus { box-shadow: 0 0 0 4px rgba(217,119,6,0.1); }
.btn-clear-input {
  display: flex; align-items: center; gap: 6px;
  padding: 14px 18px; background: #fffbeb; border: 1.5px solid rgba(245,158,11,0.2);
  border-radius: 14px; font-weight: 700; color: #b45309; cursor: pointer;
  transition: all 0.15s; font-size: 0.85rem;
}
.btn-clear-input:hover { background: #fef3c7; }

/* Quick Cash */
.quick-cash-container { display: flex; flex-direction: column; gap: 12px; }
.btn-exact {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 14px; border-radius: 14px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #d97706;
  color: #92400e; font-weight: 800; font-size: 1rem; cursor: pointer;
  transition: all 0.2s;
}
.btn-exact:hover { background: linear-gradient(135deg, #fde68a, #fcd34d); transform: translateY(-1px); }
.subtitle-cash {
  font-size: 0.78rem; font-weight: 800; color: #b45309;
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
  background: #fffbeb; border: 1.5px solid rgba(245,158,11,0.15);
}
.cash-breakdown__header {
  display: flex; align-items: center; gap: 6px;
  color: #b45309; font-size: 0.78rem; font-weight: 800; text-transform: uppercase;
}
.cash-breakdown__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.cash-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border: 1.5px solid #fde68a; border-radius: 12px;
  background: #fef3c7; color: #b45309; font-weight: 800; font-size: 0.85rem;
  cursor: pointer; transition: all 0.15s;
}
.cash-chip:hover { background: #fde68a; border-color: #fcd34d; }

.breakdown-fade-enter-active { animation: fadeSlideIn 0.25s ease-out; }
.breakdown-fade-leave-active { animation: fadeSlideOut 0.2s ease-in; }

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
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  transition: all 0.3s ease;
  color: #b45309;
}
.modal-cambio__label { font-size: 0.82rem; font-weight: 700; color: inherit; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.04em; }
.modal-cambio__amount { font-size: 2rem; font-weight: 800; color: inherit; letter-spacing: -0.02em; }
.modal-cambio--error { background: linear-gradient(135deg, #fee2e2, #fecaca); color: var(--danger-dark); }
.modal-cambio--card { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: var(--primary-dark); }
.modal-cambio--fiado { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }

/* Modal Footer */
.modal-footer { display: flex; gap: 12px; padding: 20px 24px; border-top: 1px solid rgba(245,158,11,0.2); background: #fffbeb; }
.modal-pago .modal-footer { flex-shrink: 0; }
.btn-cancelar {
  flex: 1; padding: 16px; border: 1.5px solid rgba(245,158,11,0.2);
  border-radius: 14px; background: #fff; font-weight: 700; color: #b45309;
  cursor: pointer; transition: all 0.15s; font-size: 0.95rem;
}
.btn-cancelar:hover { background: #fef3c7; border-color: rgba(245,158,11,0.3); }
.btn-success {
  flex: 2; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 16px; border: none; border-radius: 14px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff; font-weight: 800; font-size: 1.05rem; cursor: pointer;
  box-shadow: 0 6px 20px rgba(217,119,6,0.25);
  transition: all 0.2s;
}
.btn-success:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(217,119,6,0.3); }
.btn-success:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

/* =============================================
   RESPONSIVE
   ============================================= */
@media (max-width: 1400px) {
  .desktop-layout { padding: 20px; }
  .pc-toolbar { flex-direction: column; align-items: stretch; }
  .pc-toolbar__actions { justify-content: stretch; width: 100%; flex-wrap: wrap; }
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
  .pc-section-header { flex-direction: column; align-items: stretch; }
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
