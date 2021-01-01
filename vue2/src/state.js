import { observe } from "./observer/index"
import { isFunction } from "./utils"

export function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data
  data = vm._data =  isFunction(data) ? data.call(vm) : data // 对data的处理，可以是对象或者函数
  observe(data)
}