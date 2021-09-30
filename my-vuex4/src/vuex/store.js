import { reactive } from 'vue'
import ModuleCollection from './module/module-collection'
import { forEachObj } from './utils'

function installModule(store, rootState, path, module) {
  const namespaced = store._modules.getNamespaced(path)

  if (path.length !== 0) {
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState)
    parentState[path[path.length - 1]] = module._state
  }

  // 递归构建state关系
  module.forEachChild(function(key, childModule) {
    installModule(store, rootState, path.concat(key), childModule)
  })

  // 构建getters
  module.forEachGetter(function(key, getter) {
    store._wrappedGetters[namespaced + key] = () => {
      return getter(getNextedState(store.state, path))
    }
  })
}

function resetStoreState(store, state) {
  store._state = reactive({ data: state })

  store.getters = {}
  forEachObj(store._wrappedGetters, function(key, getter) {
    Object.defineProperty(store.getters, key, {
      enumerable: true,
      get() {
        return getter()
      }
    })
  })
}

function getNextedState(rootState, path) {
  return path.reduce((state, curPath) => state[curPath], rootState)
}

const store = class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)

    this._wrappedGetters = Object.create(null)

    const root = this._modules.root
    installModule(this, root._state, [], root)

    resetStoreState(this, root._state)
  }

  get state() {
    return this._state.data
  }
}

export default store
