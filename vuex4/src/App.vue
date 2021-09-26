<template>
  <div></div>
  <!-- <div>count - {{ count }}</div>
  <div>dounble - {{ double }}</div>
  <div>
    <button @click="add">add</button>
    <button @click="asyncAdd">asyncAdd</button>
  </div> -->
</template>

<script>
import { computed } from '@vue/reactivity'
// import { useStore } from 'vuex'
import { useStore } from '@/vuex'
export default {
  name: 'App',
  setup() {
    const store = useStore('wyb')
    console.log(store);
    // const add = () => store.commit('add', 2)
    // const asyncAdd = () => store.dispatch('asyncAdd', 2)

    return {
      // count: computed(() => store.state.count),
      // double: computed(() => store.getters.double),
      // add,
      // asyncAdd
    }
  }
}
</script>

<style>
</style>
