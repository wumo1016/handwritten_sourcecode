import {
  compileToFunction
} from "./compiler/index"
import {
  mountComponent
} from "./lifecycle"
import {
  initState
} from "./state"
export function initMixin(Vue) { // 在Vue的基础上做混合操作
  Vue.prototype._init = function (options) {
    const vm = this

    // 在当前this上挂载用户传入的options
    vm.$options = options
    // 对数据初始化
    initState(vm)

    if (options.el) {
      vm.$mount(options.el)
    }

  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    el = document.querySelector(el)

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