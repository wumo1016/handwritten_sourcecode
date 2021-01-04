import { isObject } from "./utils"
import { createElement, createTextElement } from "./vdom/index"

export function renderMixin(Vue){

  // 创建标签
  Vue.prototype._c = function(tag, props, ...children){ // createElement
    return createElement(this, ...arguments)
  }

  // 创建文本
  Vue.prototype._v = function(text){ // createTextElement
    return createTextElement(this, text)
  }

  // 处理变量
  Vue.prototype._s = function(value){
    return isObject(value) ? JSON.stringify(value) : value
  }

  Vue.prototype._render = function(){
    const vm = this
    const render = vm.$options.render
    const vnode = render.call(vm)
    return vnode
  }
}