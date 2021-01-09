import Watcher from "./observer/watcher"
import {
  nextTick
} from "./utils"
import {
  patch
} from "./vdom/patch"

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {

    const vm = this

    vm.$el = patch(vm.$el, vnode) // 更新实例保存的dom 因为原来的已经被删除了

  }
  Vue.prototype.$nextTick = nextTick
}

export function mountComponent(vm, el) {
  // 首次和更新都会执行
  const updateComponent = () => {
    // 1.调用render函数生成vdom 
    // 2.使用vdom生成真实dom
    const vnode = vm._render()
    // log(vdom)
    vm._update(vnode)
  }

  // 挂载之前
  callHook(vm, 'beforeMount')

  // updateComponent()
  // true 代表渲染 watcher
  new Watcher(vm, updateComponent, () => {
    log('更新啦')
  }, true)
}

// 调用钩子函数
export function callHook(vm, hook) {
  // log(vm.$options)
  const handler = vm.$options[hook]
  if (handler) {
    for (let i = 0; i < handler.length; i++) {
      handler[i].call(vm)
    }
  }
}