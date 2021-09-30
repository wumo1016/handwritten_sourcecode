import { reactive } from 'vue'
import ModuleCollection from './module/module-collection'
import { forEachObj } from './utils'

function installModule(rootState, path, module) {
  if (path.length !== 0) {
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState)
    parentState[path[path.length - 1]] = module._state
  }

  // 递归构建state关系
  const childModules = module._children
  forEachObj(childModules, function(key, childModule) {
    installModule(rootState, path.concat(key), childModule)
  })
}

function resetStoreState(store, state) {
  store._state = reactive({ data: state })
}

const store = class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)

    const root = this._modules.root
    installModule(root._state, [], root)

    resetStoreState(this, root._state)
  }

  get state() {
    return this._state.data
  }
}

export default store
