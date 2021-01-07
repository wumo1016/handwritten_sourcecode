import {
  observe
} from "./observer/index"
import Watcher from "./observer/watcher"
import {
  isFunction
} from "./utils"

export function stateMixin(Vue) {
  Vue.prototype.$watch = function (key, handler, options = {}) {
    options.user = true
    const watcher = new Watcher(this, key, handler, options)
    if(options.immediate){
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