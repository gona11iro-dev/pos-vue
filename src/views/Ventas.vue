<template>

<div class="ventas">

<div class="top">

<h1>Ventas</h1>

<input 
v-model="buscar" 
placeholder="Buscar producto o código"
@keyup.enter="agregarRapido"
/>

</div>


<div class="contenedor">

<!-- Productos -->
<div class="productos">

<h2>Productos rápidos</h2>

<button 
v-for="p in productos"
:key="p.barcode"
@click="agregar(p)"
>

{{p.name}}
$ {{p.price}}

</button>

</div>


<!-- Carrito -->
<div class="carrito">

<h2>Venta actual</h2>

<div 
v-for="item in carrito"
:key="item.barcode"
class="item"
>

{{item.name}}

<button @click="menos(item)">-</button>

{{item.qty}}

<button @click="mas(item)">+</button>

$ {{item.qty * item.price}}

<button @click="eliminar(item)">
X
</button>

</div>


<h2>Total</h2>

<h1 class="total">
$ {{total}}
</h1>


<button 
class="cobrar"
@click="cobrar"
>

Cobrar

</button>


<button 
class="cancelar"
@click="cancelar"
>

Cancelar

</button>


</div>

</div>

</div>

</template>


<script setup>

import { ref, computed } from 'vue'

const buscar = ref('')

const productos = ref([
{ barcode:'1', name:'Coca', price:18 },
{ barcode:'2', name:'Sabritas', price:16 },
{ barcode:'3', name:'Pan', price:22 },
{ barcode:'4', name:'Leche', price:25 },
{ barcode:'5', name:'Agua', price:12 }
])

const carrito = ref([])


function agregar(producto){

const existe = carrito.value.find(
i => i.barcode === producto.barcode
)

if(existe){
existe.qty++
}else{
carrito.value.push({
...producto,
qty:1
})
}

}


function agregarRapido(){

const p = productos.value.find(
p => p.name.toLowerCase().includes(
buscar.value.toLowerCase()
)
)

if(p) agregar(p)

buscar.value=''

}


function mas(item){
item.qty++
}

function menos(item){

item.qty--

if(item.qty <= 0){
eliminar(item)
}

}

function eliminar(item){

carrito.value = carrito.value.filter(
i => i.barcode !== item.barcode
)

}


const total = computed(()=>{

return carrito.value.reduce(
(t,i)=> t + i.price * i.qty
,0)

})


function cobrar(){

alert("Venta realizada")

carrito.value = []

}

function cancelar(){

carrito.value = []

}

</script>


<style scoped>

.ventas{
padding:20px;
}

.top{
display:flex;
gap:20px;
margin-bottom:20px;
}

.contenedor{
display:flex;
gap:20px;
}

.productos{
width:40%;
}

.productos button{
display:block;
width:100%;
margin-bottom:10px;
padding:15px;
font-size:16px;
}

.carrito{
width:60%;
}

.item{
display:flex;
gap:10px;
margin-bottom:10px;
}

.total{
font-size:40px;
}

.cobrar{
background:green;
color:white;
padding:20px;
width:100%;
font-size:20px;
}

.cancelar{
background:red;
color:white;
padding:10px;
width:100%;
margin-top:10px;
}

</style>