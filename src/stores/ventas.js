import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { db } from '../database/db'
import { useProductosStore } from './productos'

export const useVentasStore = defineStore('ventas', () => {
  const ventas = ref([])
  const productosStore = useProductosStore()

  // Cargar las ventas al iniciar
  async function cargarVentas() {
    ventas.value = await db.ventas.orderBy('date').reverse().toArray()
  }

  // Registrar una nueva venta
  async function registrarVenta(carrito, total, cobroData = {}) {
    if (!carrito.length) return false

    // 1. Crear el objeto ticket
    const ticket = {
      date: new Date().toISOString(),
      total: total,
      client: cobroData.client || '',
      method: cobroData.method || 'Efectivo',
      paidAmount: cobroData.paidAmount || total,
      change: cobroData.change || 0,
      items: carrito.map(item => ({
        barcode: item.barcode,
        name: item.name,
        price: item.price,
        qty: item.qty
      }))
    }

    // 2. Transacción Dexie
    await db.transaction('rw', db.ventas, db.productos, async () => {
      // Guardar ticket en la tabla ventas
      const id = await db.ventas.add(ticket)
      ticket.id = id // guardar el id asignado
      
      // Restar stock solo en productos tipo 'pza'; los kg/g no llevan stock digital
      for (const item of carrito) {
        if (item.unit && item.unit !== 'pza') continue  // <- frutas, verduras, etc.
        const prod = await db.productos.get({ barcode: item.barcode })
        if (prod) {
          const nuevoStock = Number(prod.stock) - Number(item.qty)
          prod.stock = isNaN(nuevoStock) ? prod.stock : nuevoStock
          await db.productos.put(prod)
          const piniaProd = productosStore.productos.find(p => p.barcode === item.barcode)
          if (piniaProd) piniaProd.stock = prod.stock
        }
      }
    })

    // 3. Agregar a memoria en las ventas para verlo reflejado en UI temporal si existe
    ventas.value.unshift(ticket)

    return ticket
  }

  // Realizar corte de caja (vaciar ventas actuales)
  async function vaciarVentas() {
    await db.ventas.clear()
    ventas.value = []
  }

  // Llamar al inicio
  cargarVentas()

  return { ventas, registrarVenta, cargarVentas, vaciarVentas }
})
