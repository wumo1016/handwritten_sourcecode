<template>
  <div>
    <div>count - {{ count }}</div>
    <button @click="$store.state.count++">直接+1</button>
    <div>dounble - {{ double }}</div>
    <div>
      <button @click="add">add</button>
      <button @click="asyncAdd">asyncAdd</button>
    </div>
    <h6>a模块</h6>
    <div>{{ $store.state.aCount.count }}</div>
    <button @click="$store.commit('aCount/add', 2)">add</button>
    <h6>b模块</h6>
    <div>{{ $store.state.bCount.count }}</div>
    <button @click="$store.commit('bCount/add', 2)">add</button>
    <h6>c模块</h6>
    <div>{{ $store.state.aCount.cCount.count }}</div>
    <button @click="$store.commit('aCount/cCount/add', 2)">add</button>
  </div>
</template>

<script>
import { computed } from '@vue/reactivity'
// import { useStore } from 'vuex'
import { useStore } from '@/vuex'
export default {
  name: 'App',
  setup() {
    const store = useStore('wyb')
    // console.log(store)
    const add = () => store.commit('add', 2)
    const asyncAdd = () => {
      store.dispatch('asyncAdd', 2).then(res => {
        console.log('ok')
      })
    }

    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      add,
      asyncAdd
    }
  }
}
</script>

<style>
</style>
