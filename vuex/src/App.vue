<template>
  <div id="app">
  
    {{ $store.state.name }}
    {{ $store.getters.myName }}
    {{ $store.getters.myName }}

    <button @click="$store.state.name++">increment1</button>
    <button @click="$store.commit('changeName', 10)">commit increment10</button>
    <button @click="$store.dispatch('changeName', 10)">dispatch increment10</button>

  </div>
</template>

<script>
export default {
  name: "App",
  methods: {}
}
</script>

<style>
</style>
