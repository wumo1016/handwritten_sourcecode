import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '@/vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 1
  },
  getters: {
    myName(state){
      return state.name + 1
    }
  },
  mutations: {
    changeName(state, payload){
      state.name += payload
    }
  },
  actions: {
    changeName({ commit }, payload){
      setTimeout(() => {
        commit('changeName', payload)
      }, 1000)
    }
  },
  modules: {
  }
})
 