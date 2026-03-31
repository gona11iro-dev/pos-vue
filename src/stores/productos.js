import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useProductosStore = defineStore('productos', () => {
  const productos = ref([])

  const totalProductos = computed(() => productos.value.length)

  function agregarProducto(producto) {
    const existe = productos.value.find(p => p.barcode === producto.barcode)
    if (existe) {
      Object.assign(existe, producto)
      return false
    }
    productos.value.push({ ...producto })
    return true
  }

  function buscarPorCodigo(barcode) {
    return productos.value.find(p => p.barcode === barcode) || null
  }

  function buscarPorNombre(query) {
    const q = query.toLowerCase()
    return productos.value.filter(
      p => p.name.toLowerCase().includes(q) || p.barcode.includes(q)
    )
  }

  return { productos, totalProductos, agregarProducto, buscarPorCodigo, buscarPorNombre }
})
