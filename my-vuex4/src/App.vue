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
// import { useStore } from 'vuex'
import { useStore } from '@/vuex'
export default {
  name: 'App',
  setup() {
    const store = useStore()
    console.log(store)
  }
}
</script>
