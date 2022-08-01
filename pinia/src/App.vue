<script setup>
import { useMainStore } from './stores/main.ts'
// import { useUserStore } from './stores/user.ts'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
// const userStore = useUserStore()

// const { count, double } = storeToRefs(mainStore)
// const { age, doubleAge } = storeToRefs(userStore)
</script>

<template>
  <div>count: {{ count }}</div>
  <div>double: {{ double }}</div>
  <button @click="count++">测试1</button>
  <button @click="mainStore.increment(2)">测试2</button>

  <!-- <div>age: {{ age }}</div>
  <div>doubleAge: {{ doubleAge }}</div>
  <button @click="age++">测试3</button>
  <button @click="userStore.changeAge(2)">测试4</button> -->
</template>
