import Vue from 'vue'
// import Vuex from 'vuex'
// import logger from 'vuex/dist/logger'
import Vuex from '@/vuex'

Vue.use(Vuex)

// function logger(){
//   return function(store){
//     let prevState = JSON.stringify(store.state)
//     store.subscribe((mutation, state) => {
//       console.log('prevState', prevState)
//       console.log('mutation', mutation);
//       console.log('currentState', JSON.stringify(state))
//       prevState = JSON.stringify(state)
//     })
//   }
// }

// 持久化
function persists(){
  return function(store){
    const localState = localStorage.getItem('VUEX:STATE')
    if(localState){
      store.replaceState(JSON.parse(localState))
    }
    store.subscribe((mutation, rootState) => {
      localStorage.setItem('VUEX:STATE', JSON.stringify(rootState))
    })
  }
}

const store =  new Vuex.Store({
  plugins: [
    // logger()
    persists()
  ],
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
  }
})

export default store
