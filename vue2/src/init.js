import {
  compileToFunction
} from "./compiler/index"
import {
  callHook,
  mountComponent
} from "./lifecycle"
import {
  initState
} from "./state"
import { mergeOptions } from "./utils"
export function initMixin(Vue) { // 在Vue的基础上做混合操作
  Vue.prototype._init = function (options) {
    const vm = this

    // 在当前this上挂载用户传入的options
    // vm.constructor 对于new Vue的时候就是Vue
    vm.$options = mergeOptions(vm.constructor.options, options)

    // 初始化数据之前
    callHook(vm, 'beforeCreate')

    // 对数据初始化
    initState(vm)

    // 初始化数据之后
    callHook(vm, 'created')

    if (options.el) {
      vm.$mount(options.el)
    }

  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = vm.$el = document.querySelector(el)

    if (!vm.$options.render) {
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      options.render = compileToFunction(template)
    }
    mountComponent(vm, el)
  }
}