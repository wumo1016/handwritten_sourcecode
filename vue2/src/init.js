import { initState } from "./state"

export function initMixin(Vue) { // 在Vue的基础上做混合操作
  Vue.prototype._init = function (options) {
    const vm = this

    // 在当前this上挂载用户传入的options
    vm.$options = options
    // 对数据初始化
    initState(vm)

  }
}