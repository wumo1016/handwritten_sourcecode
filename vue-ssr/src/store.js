import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 服务端中使用vuex 将数据保存到全局变量中 浏览器用服务端渲染好的数据进行替换

export default () => {
  const store = new Vuex.Store({
    state: {
      name: 'wyb'
    },
    mutations: {
      changeName(state, payload){
        state.name = payload
      }
    },
    actions: {
      changeName({commit}, payload){
        return new Promise((r, j) => {
          setTimeout(() => {
            commit('changeName', payload)
            r()
          }, 1000)
        })
      }
    }
  })
  if(typeof window !== 'undefined' && window.__INITIAL_STATE__){
    // 将后端渲染好的结果同步给前端
    store.replaceState(window.__INITIAL_STATE__)
  }
  return store
}
