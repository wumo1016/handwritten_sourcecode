import {
  observe
} from "./observer/index"
import {
  isFunction
} from "./utils"

export function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}

function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[data][key]
    },
    set(newValue) {
      log(123465)
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