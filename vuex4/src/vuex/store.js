import { reactive } from 'vue'
import { forEachValue } from './utils'
import { storeKey } from './injectKey'
import ModuleCollection from './module/module-collection'

function installModule(store, rootState, path, module) {
  let isRoot = path.length === 0

  if (!isRoot) {
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState)
    parentState[path[path.length - 1]] = module.state
  }

  module.forEachChild(function(key, childModule) {
    installModule(store, rootState, path.concat(key), childModule)
  })
}

export default class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)

    // 定义状态
    // 根状态
    const root = this._modules.root
    installModule(this, root.state, [], root)
    console.log(this._modules)
  }

  install(app, injectKey) {
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
  }
}
