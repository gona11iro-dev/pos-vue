import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'
import { sanitizeBarcode } from '../utils/barcode'

export const useProductosStore = defineStore('productos', () => {
  const productos = ref([])

  // Cargar productos desde el Servidor SQL
  async function cargarProductos() {
    try {
      productos.value = await api.getProductos() || []
    } catch (e) {
      console.error('[Productos] Error al cargar:', e)
    }
  }

  const totalProductos = computed(() => productos.value.length)

  async function agregarProducto(producto) {
    const barcode = sanitizeBarcode(producto.barcode)
    const existeIdx = productos.value.findIndex(p => sanitizeBarcode(p.barcode) === barcode)
    
    try {
      await api.saveProducto({ ...producto, barcode })
      
      if (existeIdx !== -1) {
        productos.value[existeIdx] = { ...producto, barcode }
        return false
      } else {
        productos.value.push({ ...producto, barcode })
        return true
      }
    } catch (e) {
      console.error('[Productos] Error al guardar:', e)
      throw e
    }
  }

  function buscarPorCodigo(barcode) {
    const barcodeBuscado = sanitizeBarcode(barcode)
    if (!barcodeBuscado) return null
    return productos.value.find(p => sanitizeBarcode(p.barcode) === barcodeBuscado) || null
  }

  function buscarPorNombre(query) {
    const q = query.toLowerCase()
    return productos.value.filter(
      p => p.name.toLowerCase().includes(q) || sanitizeBarcode(p.barcode).includes(q)
    )
  }

  async function eliminarProducto(barcode) {
    try {
      const producto = buscarPorCodigo(barcode)
      const barcodeToDelete = sanitizeBarcode(producto?.barcode || barcode)
      await api.deleteProducto(barcodeToDelete)
      productos.value = productos.value.filter(p => sanitizeBarcode(p.barcode) !== barcodeToDelete)
    } catch (e) {
      console.error('[Productos] Error al eliminar:', e)
      throw e
    }
  }

  // Llamar al inicio
  cargarProductos()

  return { 
    productos, totalProductos, 
    agregarProducto, eliminarProducto, 
    buscarPorCodigo, buscarPorNombre, 
    cargarProductos 
  }
})

