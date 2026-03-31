<template>
  <div>
    <h1>Productos</h1>

    <input v-model="barcode" type="text" placeholder="Código de barras">
    <input v-model="name" type="text" placeholder="Nombre">
    <input v-model="price" type="text" placeholder="Precio">
    <input v-model="stock" type="text" placeholder="Stock">

    <button @click="guardar">Guardar Producto</button>

    <hr>

    <div v-for="p in productos" :key="p.barcode">
      {{ p.barcode }} - {{ p.name }} - {{ p.price }} - Stock: {{ p.stock }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const barcode = ref('')
const name = ref('')
const price = ref('')
const stock = ref('')
const productos = ref([])

function guardar() {
  productos.value.push({
    barcode: barcode.value.trim(),
    name: name.value.trim(),
    price: price.value.trim(),
    stock: stock.value.trim()
  })

  barcode.value = ''
  name.value = ''
  price.value = ''
  stock.value = ''
}
</script>