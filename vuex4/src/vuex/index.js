import { inject } from 'vue'

// 全局注入的默认变量名
const storeKey = 'store'
class Store {
  constructor() {}
  install(app, injectKey) {
    // 全局暴露一个变量 暴露的是store的示例
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
  }
}

export function createStore(options) {
  return new Store(options)
}

export function useStore(injectKey = storeKey) {
  return inject(injectKey)
}
