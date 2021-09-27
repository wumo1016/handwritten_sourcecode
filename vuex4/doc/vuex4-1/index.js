import { inject, reactive } from 'vue'

// 全局注入的默认变量名
const storeKey = 'store'
class Store {
  constructor(options) {
    const store = this
    /** state
     * 为什么不这样做 this.state = reactive(options.state)
     * 为了解决重新赋值的问题 replaceState this._state = reactive(newState) => this._state.data = newState
     */
    store._state = reactive({ data: options.state })
    /** getters
     * 需要将函数转化为属性 直接使用
     */
    store.getters = {}
    forEachValue(options.getters || {}, function(key, value) {
      Object.defineProperty(store.getters, key, {
        get() {
          return value(store.state)
        }
      })
    })
    /** mutations
     */
    store._mutations = Object.create(null)
    forEachValue(options.mutations || {}, function(key, value) {
      store._mutations[key] = data => {
        value.call(store, store.state, data)
      }
    })
    /** actions
     */
    store._actions = Object.create(null)
    forEachValue(options.actions || {}, function(key, value) {
      store._actions[key] = data => {
        value.call(store, store, data)
      }
    })
  }

  get state() {
    return this._state.data
  }

  commit = (key, data) => {
    this._mutations[key] && this._mutations[key](data)
  }

  dispatch = (key, data) => {
    this._actions[key] && this._actions[key](data)
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

// 循环对象
export function forEachValue(obj, fn) {
  Reflect.ownKeys(obj).forEach(key => fn(key, obj[key]))
}
