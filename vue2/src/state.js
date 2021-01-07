import {
  observe
} from "./observer/index"
import Watcher from "./observer/watcher"
import {
  isFunction
} from "./utils"
import Dep from "./observer/dep";

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true
    const watcher = new Watcher(this, key, handler, options)
    if (options.immediate) {
      handler(watcher.value)
    }
  }
}

export function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
  if (opts.watch) {
    initWatch(vm, opts.watch)
  }
  if (opts.computed) {
    initComputed(vm, opts.computed)
  }
}

function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[data][key]
    },
    set(newValue) {
      vm[data][key] = newValue
    }
  })
}

function initData(vm) {
  let data = vm.$options.data
  data = vm._data = isFunction(data) ? data.call(vm) : data // 对data的处理，可以是对象或者函数
  for (const key in data) {
    proxy(vm, '_data', key) // 将data的属性代理到this实例上
  }
  observe(data)
}

function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) { // 数组情况
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else { // 函数情况
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  return vm.$watch(key, handler)
}

function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = {}
  for (const key in computed) {
    const userDef = computed[key]
    let getter = typeof userDef === 'function' ? userDef : userDef.get
    // 将 watcher 和 key 做一个映射
    watchers[key] = new Watcher(vm, getter, () => {}, {
      lazy: true
    })
    // 将key代理到vm上
    defineComputed(vm, key, userDef)
  }
}

function defineComputed(vm, key, userDef) {
  let shardProperty = {}
  if (typeof userDef === 'object') {
    shardProperty.set = userDef.set
  }
  shardProperty.get = createComputedGetter(key)
  Object.defineProperty(vm, key, shardProperty)
}

function createComputedGetter(key) {
  return function computedGetter() { // 取计算属性的时候，调用的是这个函数 因为是this调用的，所以this就是vm
    const watcher = this._computedWatchers[key]
    if (watcher.dirty) { // 如果还没取值 / 依赖值改变了
      log(`使用${key}啦`)
      watcher.evaluate()
    }
    // 现在需要做的就是让computed依赖的属性收集使用到computed属性的render computed
    // 由于 computed watcher 中的deps中收集了依赖属性的dep
    // 所以只需要循环依赖属性的dep，将当前的render watcher加入到这个dep的subs中即可
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}