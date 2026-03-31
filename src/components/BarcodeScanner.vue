<template>
  <Teleport to="body">
    <div v-if="visible" class="scanner-overlay" @click.self="cerrar">
      <div class="scanner-modal">
        <div class="scanner-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Escanear codigo de barras
          </h3>
          <button class="btn-close" @click="cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="scanner-body">
          <div id="barcode-reader" ref="readerEl"></div>

          <p v-if="error" class="scanner-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ error }}
          </p>

          <p v-if="!error && !ultimoCodigo" class="scanner-hint">
            Apunta la camara al codigo de barras del producto
          </p>

          <div v-if="ultimoCodigo" class="scanner-result">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <span class="result-label">Codigo detectado:</span>
              <code class="result-code">{{ ultimoCodigo }}</code>
            </div>
          </div>
        </div>

        <div class="scanner-footer">
          <button class="btn-cancel" @click="cerrar">Cancelar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'detected'])

const readerEl = ref(null)
const error = ref('')
const ultimoCodigo = ref('')

let html5Qrcode = null

async function iniciarEscaner() {
  error.value = ''
  ultimoCodigo.value = ''

  await nextTick()

  try {
    html5Qrcode = new Html5Qrcode('barcode-reader')

    await html5Qrcode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.5,
        formatsToSupport: [
          0,  // QR_CODE
          1,  // AZTEC
          2,  // CODABAR
          3,  // CODE_39
          4,  // CODE_93
          5,  // CODE_128
          6,  // DATA_MATRIX
          7,  // MAXICODE
          8,  // ITF
          9,  // EAN_13
          10, // EAN_8
          11, // PDF_417
          12, // RSS_14
          13, // RSS_EXPANDED
          14, // UPC_A
          15, // UPC_E
          16, // UPC_EAN_EXTENSION
        ]
      },
      onCodigoDetectado,
      () => {}
    )
  } catch (err) {
    console.error('Error al iniciar escaner:', err)
    if (typeof err === 'string' && err.includes('Permission')) {
      error.value = 'Permiso de camara denegado. Permite el acceso a la camara en tu navegador.'
    } else if (typeof err === 'string' && err.includes('NotFoundError')) {
      error.value = 'No se encontro una camara disponible en este dispositivo.'
    } else {
      error.value = 'No se pudo acceder a la camara. Verifica que tu dispositivo tiene una camara disponible.'
    }
  }
}

function onCodigoDetectado(decodedText) {
  ultimoCodigo.value = decodedText
  emit('detected', decodedText)
  detenerEscaner()
}

async function detenerEscaner() {
  if (html5Qrcode) {
    try {
      const state = html5Qrcode.getState()
      if (state === 2) { // SCANNING
        await html5Qrcode.stop()
      }
    } catch (e) {
      // ignore stop errors
    }
    try {
      html5Qrcode.clear()
    } catch (e) {
      // ignore clear errors
    }
    html5Qrcode = null
  }
}

function cerrar() {
  detenerEscaner()
  ultimoCodigo.value = ''
  error.value = ''
  emit('update:visible', false)
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    iniciarEscaner()
  } else {
    detenerEscaner()
  }
})

onBeforeUnmount(() => {
  detenerEscaner()
})
</script>

<style scoped>
.scanner-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.scanner-modal {
  background: #fff;
  border-radius: var(--radius-xl, 16px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  animation: modalIn 0.2s ease;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.scanner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray-200, #e5e7eb);
}

.scanner-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800, #1f2937);
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--gray-500, #6b7280);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close:hover {
  background: var(--gray-100, #f3f4f6);
  color: var(--gray-800, #1f2937);
}

.scanner-body {
  padding: 20px;
}

#barcode-reader {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

:deep(#barcode-reader video) {
  border-radius: 12px;
}

:deep(#barcode-reader__scan_region) {
  min-height: 200px;
}

:deep(#barcode-reader__dashboard_section) {
  display: none !important;
}

:deep(#barcode-reader__header_message) {
  display: none !important;
}

.scanner-hint {
  text-align: center;
  color: var(--gray-500, #6b7280);
  font-size: 0.875rem;
  margin-top: 12px;
}

.scanner-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--danger-light, #fee2e2);
  color: var(--danger, #dc2626);
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 12px;
}

.scanner-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--success-light, #dcfce7);
  color: var(--success-dark, #15803d);
  border-radius: 8px;
  margin-top: 12px;
}

.result-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--success-dark, #15803d);
}

.result-code {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--success-dark, #15803d);
  background: rgba(255, 255, 255, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 2px;
}

.scanner-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--gray-200, #e5e7eb);
  display: flex;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 8px 20px;
  background: transparent;
  color: var(--gray-600, #4b5563);
  border: 1px solid var(--gray-300, #d1d5db);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-family, 'Inter', sans-serif);
}

.btn-cancel:hover {
  background: var(--gray-100, #f3f4f6);
}
</style>
