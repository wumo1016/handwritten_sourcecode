import {
  Vue
} from './install'
import ModuleCollection from './module/module-collection';
import {
  forEach
} from './util'

function newNewState(store, path) {
  return path.reduce((memo, current) => {
    return memo[current]
  }, store.state)
}

function installModule(store, rootState, path, currentModule) {

  // 根据 path 生成命名空间
  const ns = store.modules.getNamespace(path)
  const nsKey = key => ns + key

  // 组装 state 关系
  if (path.length > 0) {
    // 需要找到对应的父模块 将当前模块的state声明到父模块中的state中
    const parentState = path.slice(0, -1).reduce((memo, key) => {
      return memo[key]
    }, rootState)
    // 由于有可能是新添加的属性 所以需要设置响应式 (动态注册模块)
    Vue.set(parentState, path[path.length - 1], currentModule.state)
    // parentState[path[path.length - 1]] = currentModule.state
  }

  // 没有 namespace getters都放在根上 actions和mutations会被合并成数组
  currentModule.forEachGetter((fn, key) => {
    store.wrapperGetters[nsKey(key)] = function () {
      return fn.call(store, newNewState(store, path))
    }
  })

  currentModule.forEachMutation((fn, key) => {
    store.mutations[nsKey(key)] = store.mutations[nsKey(key)] || []
    store.mutations[nsKey(key)].push((payload) => {
      fn.call(store, newNewState(store, path), payload)
      store._subscribes.forEach(fn => {
        fn({
          type: nsKey(key),
          payload
        }, store.state)
      })
    })
  })

  currentModule.forEachAction((fn, key) => {
    store.actions[nsKey(key)] = store.actions[nsKey(key)] || []
    store.actions[nsKey(key)].push((payload) => {
      return fn.call(store, store, payload)
    })
  })

  currentModule.forEachChildren((module, key) => {
    installModule(store, rootState, path.concat(key), module)
  })

}

// 针对动态注册的模块 getters 需要重新创建实例
function resetVM(store, state) {

  const oldVm = store._vm

  const computed = {}
  store.getters = {}

  forEach(store.wrapperGetters, (getter, key) => {
    computed[key] = getter
    Object.defineProperty(store.getters, key, {
      get: () => {
        return store._vm[key]
      }
    })
  })

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })

  if(oldVm) Vue.nextTick(() => oldVm.$destroy())
  
}

class Store {

  constructor(options) {

    this.modules = new ModuleCollection(options) // 模块格式化

    this.wrapperGetters = {}
    
    this.mutations = {}
    this.actions = {}
    this._subscribes = []


    // 组装 state getters mutations actions 等模块
    const state = options.state
    installModule(this, state, [], this.modules.root)

    resetVM(this, state)

    if (options.plugins) {
      options.plugins.forEach(plugin => {
        plugin(this)
      })
    }

    if(options.plugins){
      options.plugins.forEach(plugin => {
        plugin(this)
      })
    }

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

  subscribe(fn) {
    this._subscribes.push(fn)
  }

  replaceState(newState) {
    this._vm._data.$$state = newState
  }

  registerModule(path, module) {
    if (typeof path === 'string') path = [path]
    // 先注册模块
    this.modules.register(path, module)
    // 然后进行安装 安装之前将用户的module转换成处理后的
    installModule(this, this.state, path, module.newModule)

    resetVM(this, this.state)
  }

}

export default Store