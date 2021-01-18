<template>
  <div id="app">
    {{ $store.state.name }}
    <button @click="$store.state.name++">increment</button>
  </div>
</template>

<script>
export default {
  name: "App",
}
</script>

<style>
</style>
