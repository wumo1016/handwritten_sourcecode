import { defineStore } from '../use-pinia'

export const useCounter = defineStore('base', {
  state: () => ({
    count: 0,
  }),
  getters: {
    doubleCount: state => state.count * 2
  }
})