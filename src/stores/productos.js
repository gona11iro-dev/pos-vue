import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'

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
    const existeIdx = productos.value.findIndex(p => p.barcode === producto.barcode)
    
    try {
      await api.saveProducto(producto)
      
      if (existeIdx !== -1) {
        productos.value[existeIdx] = { ...producto }
        return false
      } else {
        productos.value.push({ ...producto })
        return true
      }
    } catch (e) {
      console.error('[Productos] Error al guardar:', e)
      throw e
    }
  }

  function buscarPorCodigo(barcode) {
    if (!barcode) return null
    const codeStr = String(barcode).trim()
    return productos.value.find(p => String(p.barcode).trim() === codeStr) || null
  }

  function buscarPorNombre(query) {
    const q = query.toLowerCase()
    return productos.value.filter(
      p => p.name.toLowerCase().includes(q) || p.barcode.includes(q)
    )
  }

  async function eliminarProducto(barcode) {
    try {
      await api.deleteProducto(barcode)
      productos.value = productos.value.filter(p => p.barcode !== barcode)
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

