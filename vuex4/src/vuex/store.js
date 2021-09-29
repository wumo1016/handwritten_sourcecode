import { reactive, watch } from 'vue'
import { storeKey } from './injectKey'
import ModuleCollection from './module/module-collection'
import { forEachValue, isPromise } from './utils'
/**
 * @Descripttion: 处理数据 state getters mutations action
 * @param {*} store
 * @param {*} rootState
 * @param {*} path
 * @param {*} module
 */
function installModule(store, rootState, path, module) {
  let isRoot = path.length === 0

  const namespaced = store._modules.getNamespaced(path)

  // 组装state
  if (!isRoot) {
    const parentState = path
      .slice(0, -1)
      .reduce((state, key) => state[key], rootState)
    parentState[path[path.length - 1]] = module.state
  }
  // 组装getters
  module.forEachGetter(function(key, getter) {
    store._wrappedGetters[namespaced + key] = () => {
      // 直接使用 module.state 不是响应式的
      return getter(getNextedState(store.state, path))
    }
  })
  // 组装mutations commmit('add', payload)
  // 不考虑namespaced的情况下 相同key的mutation将会被合并成一个数组
  module.forEachMutation(function(key, mutation) {
    const entry =
      store._mutations[namespaced + key] ||
      (store._mutations[namespaced + key] = [])
    entry.push(payload => {
      mutation.call(store, getNextedState(store.state, path), payload)
    })
  })
  // 组装actions dispatch('asyncAdd', payload) 区别是action返回的是一个Pormise
  // 不考虑namespaced的情况下 相同key的action将会被合并成一个数组
  module.forEachAction(function(key, action) {
    const entry =
      store._actions[namespaced + key] ||
      (store._actions[namespaced + key] = [])
    entry.push(payload => {
      const res = action.call(store, store, payload)
      // 将结果包装成 Promise
      if (!isPromise(res)) {
        return Promise.resolve(res)
      }
      return res
    })
  })

  // 递归执行
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

function resetStoreState(store, state) {
  store._state = reactive({ data: state })

  const _wrappedGetters = store._wrappedGetters
  store.getters = {}
  forEachValue(_wrappedGetters, function(key, getter) {
    Reflect.defineProperty(store.getters, key, {
      enumerable: true,
      get() {
        return getter()
      }
    })
  })

  if (store.strict) {
    enableStrictMode(store)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 非法修改报警告
 * @param {*} store
 */
function enableStrictMode(store) {
  // 监控数据变化
  watch(
    () => store._state.data,
    () => {
      // console.assert(
      //   store._commiting,
      //   'do not mutate vuex store outside mutation handlers'
      // )
      if (!store._commiting) {
        throw new Error(
          '[vuex] do not mutate vuex store state outside mutation handlers.'
        )
      }
    },
    {
      deep: true,
      flush: 'async' // 同步监控 默认是异步
    }
  )
}

export default class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options)

    this._wrappedGetters = Object.create(null)
    this._mutations = Object.create(null)
    this._actions = Object.create(null)

    this.strict = options.strict || false
    this._commiting = false // 是否mutation修改状态

    const root = this._modules.root
    installModule(this, root.state, [], root)
    // 将_state和getters设置到store上
    resetStoreState(this, root.state)
  }

  get state() {
    return this._state.data
  }

  commit = (key, payload) => {
    const mutation = this._mutations[key] || []
    this._withCommit(() => {
      mutation.forEach(fn => fn(payload))
    })
  }

  dispatch = (key, payload) => {
    const action = this._actions[key] || []
    return Promise.all(action.map(fn => fn(payload)))
  }

  install(app, injectKey) {
    app.provide(injectKey || storeKey, this)
    app.config.globalProperties.$store = this
  }
  // 切片编程
  _withCommit(fn) {
    const commiting = this._commiting
    this._commiting = true
    fn()
    this._commiting = commiting
  }
}
