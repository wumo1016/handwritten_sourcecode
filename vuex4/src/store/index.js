// import { createStore } from 'vuex'
import { createStore } from '@/vuex'

export default createStore({
  state: {
    count: 0
  },
  getters: {
    double(state) {
      return state.count * 2
    }
  },
  mutations: {
    add(state, data) {
      state.count += data
    }
  },
  actions: {
    asyncAdd({ commit }, data) {
      setTimeout(() => {
        commit('add', data)
      }, 1000)
    }
  },
  modules: {
    aCount: {
      namespaced: true,
      state: {
        count: 0
      },
      mutations: {
        add(state, data) {
          state.count += data
        }
      },
      modules: {
        cCount: {
          namespaced: true,
          state: {
            count: 0
          },
          mutations: {
            add(state, data) {
              state.count += data
            }
          }
        }
      }
    },
    bCount: {
      namespaced: true,
      state: {
        count: 0
      },
      mutations: {
        add(state, data) {
          state.count += data
        }
      }
    }
  }
})
