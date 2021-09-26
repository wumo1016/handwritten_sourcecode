import { inject, reactive } from 'vue'

// 全局注入的默认变量名
const storeKey = 'store'
class Store {
  constructor(options) {
    // this.state = reactive(options.state)
    // 为了解决重新赋值的问题 replaceState this._state = reactive(newState) => this._state.data = newState
    this._state = reactive({ data: options.state })
  }

  get state() {
    return this._state.data
  }

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
