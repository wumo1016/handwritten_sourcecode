import { getCurrentInstance } from 'vue'

import { inject, effectScope } from 'vue'
import { symbolPinia } from './util'

export function defineStore(idOrOptions, setup) {
  let id, options
  if (typeof idOrOptions === 'string') {
    id = idOrOptions
    options = setup
  } else {
    id = idOrOptions.id
    options = idOrOptions
  }

  function useStore() {
    const currentInstance = getCurrentInstance()
    const pinia = currentInstance && inject(symbolPinia)

    // 应该做缓存 用户多次调用useStore 返回第一次创建的store
    if (!pinia._s.has(id)) {
      createOptionsStore(id, options, pinia)
    }
    const store = pinia._s.get(id)

    return store
  }

  return useStore
}

function createOptionsStore(id, options, pinia) {
  const { state } = options
  function setup() {
    // 全局保存state
    pinia.state.value[id] = state ? state() : {}
  }

  // 自己的独立的store 可以独立停止
  let scope
  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })
}
