import { reactive } from 'vue'
import { storeKey } from './injectKey'
import ModuleCollection from './module/module-collection'
/**
 * @Descripttion: 处理数据 state getters mutations action
 * @param {*} store
 * @param {*} rootState
 * @param {*} path
 * @param {*} module
 */
function installModule(store, rootState, path, module) {
  let isRoot = path.length === 0

  if (!isRoot) {
    // 组装state
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState)
    parentState[path[path.length - 1]] = module.state
  }

  module.forEachGetter(function(key, getter) {
    store._wrappedGetters[key] = () => {
      // 直接使用 module.state 不是响应式的
      return getter(getNextedState(store.state, path))
    }
  })

  module.forEachMutation(function(key, motation) {})

  module.forEachAction(function(key, action) {})

  module.forEachChild(function(key, childModule) {
    installModule(store, rootState, path.concat(key), childModule)
  })
}
/**
 * @Descripttion: 根据路径获取store上面的最新状态
 * @param {*} state
 * @param {*} path
 */
function getNextedState(rootState, path) {
  return path.reduce((state, key) => state[key], rootState)
}

export default class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)

    this._wrappedGetters = Object.create(null)
    this._mutations = Object.create(null)
    this._actions = Object.create(null)

    const root = this._modules.root
    installModule(this, root.state, [], root)

    console.log(this._modules)
  }

  install(app, injectKey) {
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
  }
}
