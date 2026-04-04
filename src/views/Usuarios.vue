<template>
  <AppLayout>
    <div class="usuarios-page">
      <div class="page-header">
        <div>
          <h1>Usuarios</h1>
          <p class="page-subtitle">Administra los accesos al sistema {{ brandName }}</p>
        </div>
        <button class="btn-nuevo" @click="abrirModalCrear">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo cajero
        </button>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon stat-icon--blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p class="stat-value">{{ cajeros.length }}</p>
            <p class="stat-label">Cajeros activos</p>
          </div>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="card tabla-card">
        <div class="tabla-header">
          <h2 class="tabla-titulo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Lista de cajeros
          </h2>
          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input v-model="busqueda" id="buscar-usuario" type="text" placeholder="Buscar cajero..." class="search-input" />
          </div>
        </div>

        <div v-if="!cajerosFiltrados.length" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <p>{{ busqueda ? 'No se encontraron cajeros' : 'Sin cajeros registrados' }}</p>
          <span>{{ busqueda ? 'Prueba con otro nombre' : 'Crea el primer cajero con el botón superior' }}</span>
        </div>

        <table v-else class="usuarios-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in cajerosFiltrados" :key="u.id">
              <td class="td-num">{{ i + 1 }}</td>
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ u.username.charAt(0).toUpperCase() }}</div>
                  <span class="user-name">{{ u.username }}</span>
                </div>
              </td>
              <td>
                <span class="role-badge role-cajero">Cajero</span>
              </td>
              <td>
                <div class="acciones">
                  <button class="btn-accion btn-edit" @click="abrirModalEditar(u)" title="Editar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>
                  <button class="btn-accion btn-delete" @click="confirmarEliminar(u)" title="Eliminar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <Teleport to="body">
      <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ editando ? 'Editar cajero' : 'Nuevo cajero' }}</h3>
            <button class="btn-close-modal" @click="cerrarModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="input-group">
              <label for="modal-username">Nombre de usuario</label>
              <input
                id="modal-username"
                v-model="form.username"
                type="text"
                placeholder="Ej: cajero1"
                :readonly="editando"
                :class="{ 'input-readonly': editando }"
              />
              <span v-if="editando" class="input-hint">El nombre de usuario no se puede cambiar</span>
            </div>

            <div class="input-group">
              <label for="modal-password">
                {{ editando ? 'Nueva contraseña' : 'Contraseña' }}
              </label>
              <div class="password-wrapper">
                <input
                  id="modal-password"
                  v-model="form.password"
                  :type="mostrarPass ? 'text' : 'password'"
                  :placeholder="editando ? 'Dejar vacío para no cambiar' : 'Mínimo 4 caracteres'"
                />
                <button class="toggle-pass" type="button" @click="mostrarPass = !mostrarPass">
                  <svg v-if="!mostrarPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <p v-if="errorModal" class="modal-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {{ errorModal }}
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-cancelar" @click="cerrarModal">Cancelar</button>
            <button class="btn-guardar" @click="guardarUsuario" :disabled="guardando">
              <svg v-if="guardando" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {{ guardando ? 'Guardando...' : (editando ? 'Guardar cambios' : 'Crear cajero') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Eliminar -->
    <Teleport to="body">
      <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
        <div class="modal-card modal-card--sm">
          <div class="modal-header modal-header--danger">
            <h3>¿Eliminar cajero?</h3>
          </div>
          <div class="modal-body">
            <p class="confirm-text">
              Estás a punto de eliminar al cajero <strong>{{ usuarioAEliminar?.username }}</strong>. Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancelar" @click="modalEliminar = false">Cancelar</button>
            <button class="btn-eliminar" @click="eliminarUsuario" :disabled="guardando">
              {{ guardando ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../layouts/AppLayout.vue'
import { api } from '../api/client'
import { Capacitor } from '@capacitor/core'

// ── Estado ──────────────────────────────────────────────
const cajeros        = ref([])
const busqueda       = ref('')
const modalVisible   = ref(false)
const modalEliminar  = ref(false)
const editando       = ref(false)
const guardando      = ref(false)
const errorModal     = ref('')
const mostrarPass    = ref(false)
const usuarioAEliminar = ref(null)
const brandName      = computed(() => Capacitor.getPlatform() === 'android' ? 'Gudi' : 'Surtiprais')

const form = ref({ username: '', password: '' })

// ── Computed ─────────────────────────────────────────────
const cajerosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  if (!q) return cajeros.value
  return cajeros.value.filter(u => u.username.toLowerCase().includes(q))
})

// ── Cargar datos ──────────────────────────────────────────
async function cargarCajeros() {
  try {
    const all = await api.getUsuarios()
    cajeros.value = all.filter(u => u.role === 'cajero')
  } catch (e) {
    console.error('Error al cargar cajeros:', e)
  }
}

onMounted(cargarCajeros)

// ── Modal crear ───────────────────────────────────────────
function abrirModalCrear() {
  editando.value   = false
  form.value       = { username: '', password: '' }
  errorModal.value = ''
  mostrarPass.value = false
  modalVisible.value = true
}

// ── Modal editar ──────────────────────────────────────────
function abrirModalEditar(usuario) {
  editando.value   = true
  form.value       = { id: usuario.id, username: usuario.username, password: '' }
  errorModal.value = ''
  mostrarPass.value = false
  modalVisible.value = true
}

function cerrarModal() {
  modalVisible.value = false
}

// ── Guardar (crear o editar) ──────────────────────────────
async function guardarUsuario() {
  errorModal.value = ''
  const username = form.value.username.trim().toLowerCase()
  const password = form.value.password

  if (!editando.value) {
    // Crear
    if (!username) { errorModal.value = 'El nombre de usuario es obligatorio.'; return }
    if (!password || password.length < 4) { errorModal.value = 'La contraseña debe tener al menos 4 caracteres.'; return }

    guardando.value = true
    try {
      await api.saveUsuario({ username, password, role: 'cajero' })
      await cargarCajeros()
      cerrarModal()
    } catch (e) {
      errorModal.value = e.message || 'Error al crear el cajero.'
    } finally {
      guardando.value = false
    }
  } else {
    // Editar: El backend actualiza si ya existe por el campo ID o lógica de upsert
    // Por ahora el backend solo soporta crear, deberíamos añadir update pero
    // para cumplir con el POS inicial, lo crearemos si no existe.
    errorModal.value = 'La edición de cajeros está limitada en esta versión.'
  }
}

// ── Eliminar ──────────────────────────────────────────────
function confirmarEliminar(usuario) {
  usuarioAEliminar.value = usuario
  modalEliminar.value    = true
}

async function eliminarUsuario() {
  if (!usuarioAEliminar.value) return
  guardando.value = true
  try {
    await api.deleteUsuario(usuarioAEliminar.value.id)
    await cargarCajeros()
    modalEliminar.value = false
  } catch (e) {
    console.error('Error al eliminar:', e)
  } finally {
    guardando.value = false
  }
}

</script>

<style scoped>
/* ── Page ───────────────────────────────── */
.usuarios-page {
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

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-1);
}

.page-subtitle {
  color: var(--gray-500);
  font-size: var(--text-sm);
}

/* ── Botón Nuevo ────────────────────────── */
.btn-nuevo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 20px;
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
.btn-nuevo:hover {
  background: var(--primary-dark);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* ── Stats ──────────────────────────────── */
.stats-row {
  display: flex;
  gap: var(--space-4);
}

.stat-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-5) var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 160px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon--blue { background: #dbeafe; color: #2563eb; }

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1;
  margin-bottom: 2px;
}
.stat-label {
  font-size: var(--text-xs);
  color: var(--gray-500);
  font-weight: 500;
}

/* ── Tabla card ─────────────────────────── */
.tabla-card {
  padding: 0;
  overflow: hidden;
}

.tabla-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--gray-100);
}

.tabla-titulo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--gray-800);
  margin: 0;
}

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--gray-400);
  pointer-events: none;
}
.search-input {
  padding: 8px 14px 8px 36px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-family);
  outline: none;
  background: var(--gray-50);
  color: var(--gray-800);
  transition: all var(--transition-fast);
  width: 220px;
}
.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: #fff;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-8);
  color: var(--gray-400);
  gap: var(--space-2);
  text-align: center;
}
.empty-state p { font-size: var(--text-base); font-weight: 500; color: var(--gray-500); }
.empty-state span { font-size: var(--text-sm); }

/* Table */
.usuarios-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.usuarios-table thead th {
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}
.usuarios-table tbody tr { transition: background var(--transition-fast); }
.usuarios-table tbody tr:hover { background: var(--gray-50); }
.usuarios-table tbody td {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-700);
}
.td-num { color: var(--gray-400); font-size: var(--text-xs); width: 40px; }

/* User cell */
.user-cell { display: flex; align-items: center; gap: var(--space-3); }
.user-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-weight: 700;
  font-size: var(--text-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.user-name { font-weight: 500; color: var(--gray-800); }

/* Role badge */
.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
}
.role-cajero { background: #dbeafe; color: #1d4ed8; }

/* Actions */
.acciones { display: flex; gap: var(--space-2); }
.btn-accion {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border: none; border-radius: var(--radius-md);
  font-size: var(--text-xs); font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer; transition: all var(--transition-fast);
}
.btn-edit { background: #dbeafe; color: #1d4ed8; }
.btn-edit:hover { background: #bfdbfe; }
.btn-delete { background: var(--danger-light); color: var(--danger); }
.btn-delete:hover { background: #fecaca; }

/* ── Modal ──────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
  padding: var(--space-4);
}
.modal-card {
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: 0 25px 60px rgba(0,0,0,0.25);
  width: 100%; max-width: 440px;
  animation: modalIn 0.2s ease;
}
.modal-card--sm { max-width: 380px; }

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1)  translateY(0);      }
}

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gray-100);
}
.modal-header h3 { font-size: var(--text-lg); font-weight: 700; color: var(--gray-800); }
.modal-header--danger h3 { color: var(--danger); }

.btn-close-modal {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 8px;
  background: transparent; color: var(--gray-400);
  cursor: pointer; transition: all 0.15s;
}
.btn-close-modal:hover { background: var(--gray-100); color: var(--gray-700); }

.modal-body {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: var(--space-4);
}

.confirm-text { font-size: var(--text-sm); color: var(--gray-600); line-height: 1.6; }
.confirm-text strong { color: var(--gray-900); }

.input-group { display: flex; flex-direction: column; gap: var(--space-2); }
.input-group label { font-size: var(--text-sm); font-weight: 500; color: var(--gray-700); }
.input-group input {
  padding: 10px 14px;
  border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  font-size: var(--text-sm); font-family: var(--font-family);
  color: var(--gray-800); background: var(--gray-50);
  outline: none; transition: all var(--transition-fast);
}
.input-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background: #fff; }
.input-readonly { background: var(--gray-100) !important; cursor: not-allowed; }
.input-hint { font-size: var(--text-xs); color: var(--gray-400); }

.password-wrapper { position: relative; }
.password-wrapper input { width: 100%; padding-right: 44px; }
.toggle-pass {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--gray-400); display: flex; align-items: center;
  transition: color 0.15s;
}
.toggle-pass:hover { color: var(--gray-700); }

.modal-error {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: var(--danger-light); color: var(--danger);
  border-radius: var(--radius-md); font-size: var(--text-sm);
}

.modal-footer {
  display: flex; justify-content: flex-end; gap: var(--space-3);
  padding: 16px 24px;
  border-top: 1px solid var(--gray-100);
}
.btn-cancelar {
  padding: 9px 20px;
  border: 1px solid var(--gray-300); border-radius: var(--radius-md);
  background: transparent; color: var(--gray-600);
  font-size: var(--text-sm); font-weight: 500;
  font-family: var(--font-family); cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-cancelar:hover { background: var(--gray-100); }
.btn-guardar {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 20px;
  background: var(--primary); color: #fff;
  border: none; border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600;
  font-family: var(--font-family); cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-guardar:hover:not(:disabled) { background: var(--primary-dark); }
.btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-eliminar {
  padding: 9px 20px;
  background: var(--danger); color: #fff;
  border: none; border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: 600;
  font-family: var(--font-family); cursor: pointer;
  transition: all var(--transition-fast);
}
.btn-eliminar:hover:not(:disabled) { background: #b91c1c; }
.btn-eliminar:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
</style>