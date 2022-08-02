<script setup>
import { useMainStore } from './stores/main.ts'
// import { useUserStore } from './stores/user.ts'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()

// console.log(mainStore);

// const userStore = useUserStore()

// const { count, double } = storeToRefs(mainStore)
// const { age, doubleAge } = storeToRefs(userStore)
</script>

<template>
  <div>count: {{ mainStore.count }}</div>
  <div>double: {{ mainStore.double }}</div>
  <button @click="mainStore.count++">测试1</button>
  <button @click="mainStore.increment(2)">测试2</button>

  <!-- <div>age: {{ age }}</div>
  <div>doubleAge: {{ doubleAge }}</div>
  <button @click="age++">测试3</button>
  <button @click="userStore.changeAge(2)">测试4</button> -->
</template>
