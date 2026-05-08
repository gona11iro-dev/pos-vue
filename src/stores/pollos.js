import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../api/client'

export const usePollosStore = defineStore('pollos', () => {
  const pollos = ref([])

  async function cargarPollos() {
    try {
      pollos.value = await api.getPollos() || []
    } catch (e) {
      console.error('[Pollos] Error al cargar:', e)
    }
  }

  async function agregarPollo(pollo) {
    try {
      await api.savePollo(pollo)
      await cargarPollos()
      return true
    } catch (e) {
      console.error('[Pollos] Error al guardar:', e)
      throw e
    }
  }

  async function eliminarPollo(id) {
    try {
      await api.deletePollo(id)
      pollos.value = pollos.value.filter(p => p.id !== id)
    } catch (e) {
      console.error('[Pollos] Error al eliminar:', e)
      throw e
    }
  }

  cargarPollos()

  return { 
    pollos, 
    agregarPollo, 
    eliminarPollo, 
    cargarPollos 
  }
})
