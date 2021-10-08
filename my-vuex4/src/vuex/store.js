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

  // 构建mutations
  module.forEachMutation(function(key, mutation) {
    store._mutations[namespaced + key] = payload => {
      mutation(getNextedState(store.state, path), payload)
    }
  })

  // 构建actions
  module.forEachAction(function(key, action) {
    store._actions[namespaced + key] = plyload => {
      action(store, plyload)
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
/**
 * @Author: wyb
 * @Descripttion: 获取最新的状态
 * @param {*} rootState
 * @param {*} path
 */
function getNextedState(rootState, path) {
  return path.reduce((state, curPath) => state[curPath], rootState)
}

const store = class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)

    this._wrappedGetters = Object.create(null)
    this._mutations = Object.create(null)
    this._actions = Object.create(null)

    const root = this._modules.root
    installModule(this, root._state, [], root)

    resetStoreState(this, root._state)
  }

  get state() {
    return this._state.data
  }

  commit = (key, payload) => {
    const mutation = this._mutations[key]
    mutation && mutation(payload)
  }

  dispatch = (key, payload) => {
    const action = this._actions[key]
    action && action(payload)
  }
}

export default store
