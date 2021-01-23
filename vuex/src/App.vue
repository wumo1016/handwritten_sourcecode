<template>
  <div id="app">
    <!-- <h2>store</h2>
    {{ $store.state.name }}
    {{ $store.getters.myName }}
    
    <div>
      <button @click="$store.commit('changeName', 1)">commit</button>
      <button @click="$store.dispatch('changeNames', 1)">action</button>
    </div> -->

    <h2>store</h2>
    {{ name }}
    {{ myName }}
    
    <div>
      <button @click="changeName(1)">commit</button>
      <button @click="changeNames(1)">action</button>
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
// import { mapState, mapGetters } from 'vuex'
import { mapState, mapGetters, mapMutations, mapActions } from '@/vuex'
export default {
  name: "App",
  computed: {
    ...mapState(['name']),
    ...mapGetters(['myName']),
  },
  methods: {
    ...mapMutations(['changeName']),
    ...mapActions(['changeNames']),
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
