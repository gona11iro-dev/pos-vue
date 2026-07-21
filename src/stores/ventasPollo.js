import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'
import { usePollosStore } from './pollos'
import { useAuthStore } from './auth'

export const useVentasPolloStore = defineStore('ventasPollo', () => {
  const ventas = ref([])
  const pollosStore = usePollosStore()
  const authStore = useAuthStore()

  async function cargarVentas() {
    try {
      const data = await api.getVentasPollo() || []
      ventas.value = data.map(v => ({
        ...v,
        tipo: 'polleria',
        items: (v.items || []).map(i => ({
          ...i,
          name: i.nombre || i.name,
          price: Number(i.precio || i.price || 0)
        }))
      }))
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
      usuario_id: authStore.userId,
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
      ticket.tipo = 'polleria'
      ticket.items = ticket.items.map(i => ({
        ...i,
        name: i.nombre,
        price: Number(i.precio)
      }))
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
