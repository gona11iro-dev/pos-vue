import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'
import { useProductosStore } from './productos'

export const useVentasStore = defineStore('ventas', () => {
  const ventas = ref([])
  const productosStore = useProductosStore()

  // Cargar las ventas al iniciar
  async function cargarVentas() {
    try {
      ventas.value = await api.getVentas()
    } catch (e) {
      console.error('[Ventas] Error al cargar:', e)
    }
  }

  // Registrar una nueva venta
  async function registrarVenta(carrito, total, cobroData = {}) {
    if (!carrito.length) return false

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

    try {
      // El backend procesa la venta y el stock en una transacción SQL
      const result = await api.registerVenta(ticket)
      ticket.id = result.id

      // Actualizar stock local en el store de productos para reflejar cambios sin recargar
      for (const item of carrito) {
        const piniaProd = productosStore.productos.find(p => p.barcode === item.barcode)
        if (piniaProd) {
          piniaProd.stock = Number(piniaProd.stock) - Number(item.qty)
        }
      }

      ventas.value.unshift(ticket)
      return ticket
    } catch (e) {
      console.error('[Ventas] Error al registrar:', e)
      throw e
    }
  }

  // El corte de caja ahora debería ser una función del backend si se desea persistir
  async function vaciarVentas() {
    // Por ahora lo dejamos local o podrías añadir un endpoint en el API
    ventas.value = []
  }

  // Llamar al inicio
  cargarVentas()

  return { ventas, registrarVenta, cargarVentas, vaciarVentas }
})

