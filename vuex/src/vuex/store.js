import {
  Vue
} from './install'
import ModuleCollection from './module/module-collection';
import {
  forEach
} from './util'

function installModule(store, rootState, path, currentModule) {

  // 组装 state 关系
  if (path.length > 0) {
    // 需要找到对应的父模块 将当前模块的state声明到父模块中的state中
    const parentState = path.slice(0, -1).reduce((memo, key) => {
      return memo[key]
    }, rootState)
    // 由于有可能是新添加的属性 所以需要设置响应式
    // Vue.set(parentState, path[path.length - 1], currentModule.state)
    parentState[path[path.length - 1]] = currentModule.state
  }

  // 没有 namespace getters都放在根上 actions和mutations会被合并成数组
  currentModule.forEachGetter((fn, key) => {
    store.wrapperGetters[key] = function () {
      return fn.call(store, currentModule.state)
    }
  })

  currentModule.forEachMutation((fn, key) => {
    store.mutations[key] = store.mutations[key] || []
    store.mutations[key].push((payload) => {
      return fn.call(store, currentModule.state, payload)
    })
  })

  currentModule.forEachAction((fn, key) => {
    store.actions[key] = store.actions[key] || []
    store.actions[key].push((payload) => {
      return fn.call(store, store, payload)
    })
  })

  currentModule.forEachChildren((module, key) => {
    installModule(store, rootState, path.concat(key), module)
  })

}

class Store {

  constructor(options) {

    this.modules = new ModuleCollection(options) // 模块格式化

    this.wrapperGetters = {}
    this.getters = {}
    this.mutations = {}
    this.actions = {}

    const computed = {}

    // 组装 state getters mutations actions 等模块
    const state = options.state
    installModule(this, state, [], this.modules.root)

    forEach(this.wrapperGetters, (getter, key) => {
      computed[key] = getter
      Object.defineProperty(this.getters, key, {
        get: () => {
          return this._vm[key]
        }
      })
    })

    this._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    })

  }

  get state() {
    return this._vm._data.$$state
  }

  commit = (type, payload) => {
    this.mutations[type] && this.mutations[type].forEach(fn => fn(payload))
  }

  dispatch = (type, payload) => {
    this.actions[type] && this.actions[key].forEach(fn => fn(payload))
  }

}

export default Store