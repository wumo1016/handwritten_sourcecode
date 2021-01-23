<template>
  <div id="app">
    <h2>store</h2>
    {{ $store.state.name }}
    {{ $store.getters.myName }}
    <div>
      <button @click="$store.commit('changeName', 1)">commit</button>
    </div>

    <h2>a</h2>

    {{ $store.state.a.name }}
    {{ $store.getters['a/myNamea'] }}
    <div>
      <button @click="$store.commit('a/changeName', 1)">commit</button>
    </div>

  </div>
</template>

<script>
export default {
  name: "App",
  methods: {},
};
</script>

<style>
</style>
