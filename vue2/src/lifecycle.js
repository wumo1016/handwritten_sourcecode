import { patch } from "./vdom/patch"

export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {

    const vm = this

    patch(vm.$el, vnode)

  }
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
  updateComponent()
}