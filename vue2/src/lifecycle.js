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
    const prevVnode = vm._vnode // 取上一次的vnode
    if (!prevVnode) {
      vm.$el = patch(vm.$el, vnode) // 更新实例保存的dom 因为原来的已经被删除了
    } else {
      vm.$el = patch(prevVnode, vnode)
    }
    vm._vnode = vnode
  }
  Vue.prototype.$nextTick = nextTick
}

export function mountComponent(vm) {
  // 首次和更新都会执行
  const updateComponent = () => {
    // 1.调用render函数生成vnode
    // 2.使用vdom生成真实dom
    const vnode = vm._render()
    vm._update(vnode)
  }

  // 挂载之前
  callHook(vm, 'beforeMount')

  // updateComponent()
  // true 代表渲染 watcher
  new Watcher(vm, updateComponent, () => {
    log('渲染watcher的回调')
  }, true)

  callHook(vm, 'mounted')
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