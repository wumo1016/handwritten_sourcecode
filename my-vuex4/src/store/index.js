// import { createStore } from 'vuex'
import { createStore } from '@/vuex'

function customPlugin(store) {
  let local = localStorage.getItem('VUEX:STATE')
  if (local) {
    store.replaceState(JSON.parse(local))
  }
  store.subscribe((mutation, state) => {
    console.log(mutation, state)
    localStorage.setItem('VUEX:STATE', JSON.stringify(state))
  })
}

const store = createStore({
  plugins: [customPlugin],
  strict: true,
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
      return new Promise((r, j) => {
        setTimeout(() => {
          commit('add', data)
          r()
        }, 1000)
      })
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
      }
      // modules: {
      //   cCount: {
      //     namespaced: true,
      //     state: {
      //       count: 0
      //     },
      //     mutations: {
      //       add(state, data) {
      //         state.count += data
      //       }
      //     }
      //   }
      // }
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

// 在aCount模块下 注册一个cCount模块
// store.registerModule(['aCount', 'cCount'], {
//   namespaced: true,
//   state: {
//     count: 0
//   },
//   mutations: {
//     add(state, data) {
//       state.count += data
//     }
//   }
// })

export default store
