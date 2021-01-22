import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '@/vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 'wyb',
  },
  getters: {
    myName(state){
      return state.name + '-getter'
    }
  },
  mutations: {
    changeName(state, paylaod){
      state.name += paylaod
    }
  },
  actions: {
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        name: 'wyb-a'
      },
      getters: {
        myNamea(state){
          return state.name + '-getter'
        }
      },
      mutations: {
        changeName(state, paylaod){
          state.name += paylaod
        }
      },
      modules: {
        c: {
          namespaced: true,
          state: {
            name: 'wyb-c'
          },
          getters: {
            myNamea(state){
              return state.name + '-getter'
            }
          },
          mutations: {
            changeName(state, paylaod){
              state.name += paylaod
            }
          },
        },
      }
    },
    // b: {
    //   namespaced: true,
    //   state: {
    //     name: 'wyb-b'
    //   },
    //   getters: {
    //     myNameb(state){
    //       return state.name + '-getter'
    //     }
    //   },
    //   mutations: {
    //     changeName(state, paylaod){
    //       state.name += paylaod
    //     }
    //   },
    // }
  }
})
