<script setup>
import { useMainStore } from './stores/main.ts'
import { useUserStore } from './stores/user.ts'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
const userStore = useUserStore()

userStore.$subscribe(state => {
  console.log(state, 'state变化啦')
})

mainStore.$onAction(({ after, onError }) => {
  after(resolveValue => {})
  onError(error => {})
})

// const { count, double } = storeToRefs(mainStore)
// const { age, doubleAge } = storeToRefs(userStore)
</script>

<template>
  <div>count: {{ mainStore.count }}</div>
  <div>double: {{ mainStore.double }}</div>
  <button @click="mainStore.count++">测试1-1</button>
  <button @click="mainStore.increment(2)">测试1-2</button>
  <button
    @click="
      mainStore.$patch({
        count: mainStore.count + 1
      })
    "
  >
    测试1-3
  </button>
  <button
    @click="
      mainStore.$patch(state => {
        mainStore.count = state.count + 1
      })
    "
  >
    测试1-4
  </button>
  <button @click="mainStore.$reset()">重置</button>

  <div>age: {{ userStore.age }}</div>
  <div>doubleAge: {{ userStore.doubleAge }}</div>
  <button @click="userStore.age++">测试3</button>
  <button @click="userStore.changeAge(2)">测试4</button>
</template>
