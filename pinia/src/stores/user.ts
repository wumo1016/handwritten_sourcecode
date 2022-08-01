
import { defineStore } from 'pinia'
// import { defineStore } from '@/pinia'
import { computed, reactive, toRefs } from 'vue'

export const useUserStore = defineStore('user', () => {
  const person = reactive({ name: 'zf', age: 18 })
  const doubleAge = computed(() => {
    return person.age * 2
  })
  const changeAge = payload => {
    person.age += payload;
  }
  return {
    ...toRefs(person),
    doubleAge,
    changeAge
  }
})
