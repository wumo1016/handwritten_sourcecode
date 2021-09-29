// import { createStore } from 'vuex'
import { createStore } from '@/vuex'

function customPlugin(store) {
  let local = localStorage.getItem('VUEX:STATE')
  if (local) {
    store.replaceState(JSON.parse(local)) // 替换状态
  }
  // 状态变化的时候(mutation修改状态) 会执行此回调
  store.subscribe((mutation, state) => {
    console.log(mutation, state)
    localStorage.setItem('VUEX:STATE', JSON.stringify(state))
  })
}

export default createStore({
  plugins: [
    // 会按照注册的顺序依次执行插件 执行的时候会store传递
    customPlugin
  ],
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
