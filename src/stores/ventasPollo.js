import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'
import { usePollosStore } from './pollos'

export const useVentasPolloStore = defineStore('ventasPollo', () => {
  const ventas = ref([])
  const pollosStore = usePollosStore()

  async function cargarVentas() {
    try {
      ventas.value = await api.getVentasPollo() || []
    } catch (e) {
      console.error('[VentasPollo] Error al cargar:', e)
    }
  }

  async function registrarVenta(carrito, total, cobroData = {}) {
    if (!carrito.length) return false

    const ticket = {
      date: new Date().toISOString(),
      total: total,
      client: cobroData.client || '',
      method: cobroData.method || 'Efectivo',
      paidAmount: cobroData.paidAmount ?? total,
      change: cobroData.change ?? 0,
      items: carrito.map(item => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        qty: item.qty
      }))
    }

    try {
      const result = await api.registerVentaPollo(ticket)
      ticket.id = result.id
      ventas.value.unshift(ticket)
      return ticket
    } catch (e) {
      console.error('[VentasPollo] Error al registrar:', e)
      throw e
    }
  }

  async function eliminarVenta(id) {
    try {
      await api.deleteVentaPollo(id)
      ventas.value = ventas.value.filter(v => v.id !== id)
      return true
    } catch (e) {
      console.error('[VentasPollo] Error al eliminar:', e)
      throw e
    }
  }

  function vaciarVentas() {
    ventas.value = []
  }

  cargarVentas()

  return { ventas, registrarVenta, cargarVentas, vaciarVentas, eliminarVenta }
})
