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

    <h3>b</h3>
    <button @click="regiterModule">动态注册</button>
    {{ $store.state.b && $store.state.b.name }}
    {{ $store.getters['b/myName'] }}

  </div>
</template>

<script>
import store from './store'
export default {
  name: "App",
  methods: {
    regiterModule(){
      store.registerModule('b', {
        namespaced: true,
        state: {
          name: 123
        },
        getters: {
          myName: (state) => state.name + 1
        }
      })
    }
  },
};
</script>

<style>
</style>
