import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../database/db'

export const useProductosStore = defineStore('productos', () => {
  const productos = ref([])

  // Cargar productos desde Dexie al iniciar
  async function cargarProductos() {
    productos.value = await db.productos.toArray()
  }

  const totalProductos = computed(() => productos.value.length)

  async function agregarProducto(producto) {
    const existe = productos.value.find(p => p.barcode === producto.barcode)
    
    if (existe) {
      Object.assign(existe, producto)
      // Actualizar en Dexie
      await db.productos.put(existe)
      return false
    }
    
    const nuevoProducto = { ...producto }
    productos.value.push(nuevoProducto)
    // Guardar nuevo en Dexie
    await db.productos.add(nuevoProducto)
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

  // Llamar al inicio
  cargarProductos()

  return { productos, totalProductos, agregarProducto, buscarPorCodigo, buscarPorNombre, cargarProductos }
})
