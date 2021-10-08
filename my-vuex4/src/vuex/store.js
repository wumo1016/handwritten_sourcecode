import { reactive, watch } from 'vue'
import ModuleCollection from './module/module-collection'
import { DefaultKey, forEachObj } from './utils'

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
    const entry =
      store._mutations[namespaced + key] ||
      (store._mutations[namespaced + key] = [])
    entry.push(payload => {
      store._withCommit(() =>
        mutation.call(store, getNextedState(store.state, path), payload)
      )
    })
  })

  // 构建actions
  module.forEachAction(function(key, action) {
    const entry =
      store._actions[namespaced + key] ||
      (store._actions[namespaced + key] = [])
    entry.push(plyload => {
      action.call(store, store, plyload)
    })
  })
}

/**
 * @Author: wyb
 * @Descripttion: 开启严格模式
 * @param {*}
 */
function enableStrictMode(store) {
  watch(
    () => store.state,
    () => {
      if (!store._commiting) {
        throw new Error(
          'vuex: do not mutate vuex store state outside mutation handlers.'
        )
      }
    },
    {
      deep: true,
      flush: 'sync'
    }
  )
}

function resetStoreState(store, state) {
  store._state = reactive({ data: state })
  /**
   * @Author: wyb
   * @Descripttion: 构建getters
   * @param {*}
   */
  if (store.strict) {
    enableStrictMode(store)
  }

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

    this._commiting = false
    this.strict = options.strict || false

    const root = this._modules.root
    installModule(this, root._state, [], root)

    resetStoreState(this, root._state)

    this._subscribers = []
    ;(options.plugins || []).forEach(plugin => plugin(this))
  }

  install(app, key = DefaultKey) {
    app.provide(key, this)
    app.config.globalProperties.$store = this
  }

  get state() {
    return this._state.data
  }

  commit = (type, payload) => {
    const mutations = this._mutations[type]
    if (!mutations) {
      throw new Error(`[vuex] unknown mutation type: ${type}`)
    }
    mutations.forEach(fn => fn(payload))

    this._subscribers.forEach(fn =>
      fn(
        {
          type,
          payload
        },
        this.state
      )
    )
  }

  dispatch = (type, payload) => {
    const actions = this._actions[type] || []
    actions.forEach(fn => fn(payload))
  }

  _withCommit(fn) {
    const commiting = this._commiting
    this._commiting = true
    fn()
    this._commiting = commiting
  }

  subscribe(fn) {
    this._subscribers.push(fn)
  }

  replaceState(state) {
    this._withCommit(() => {
      this._state.data = state
    })
  }

  registerModule(path, rawModule) {
    if (typeof path === 'string') path = [path]

    const newModule = this._modules.register(rawModule, path)

    const root = this._modules.root
    installModule(this, root._state, path, newModule)

    resetStoreState(this, root._state)
  }
}

export default store
