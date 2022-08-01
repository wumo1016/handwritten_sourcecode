// import { defineStore } from "@/pinia";
import { defineStore } from "pinia";

export const useMainStore = defineStore('main', {
  state: () => ({
    count: 0
  }),
  getters: {
    double() {
      return this.count * 2
    }
  },
  actions: {
    async increment(payload) {
      this.count += payload;

      return this.count
    },
    decrement() {
      this.count--;
    }
  }
}) 