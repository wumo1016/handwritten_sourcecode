import {
  isObject,
  isReservedTag
} from "../utils"

// _c方法
export function createElement(vm, tag, props = {}, ...children) {
  if (isReservedTag(tag)) {
    return vnode(vm, tag, props, props.key, children)
  }
  // 如果tag是一个component，创建组件vnode
  const Ctor = vm.$options.components[tag]
  return createComponent(vm, tag, props, props.key, children, Ctor)
}

// 创建组件的vnode
function createComponent(vm, tag, props, key, children, Ctor) {
  // 如果是对象 应该基于这个对象产生一个该组件的构造函数
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor)
  }
  props.hook = { // 组件渲染时 会调用
    init(vnode) {
      // 此时只是初始化 进行了选项合并 并未挂载
      // 在vnode上保存一个当前组件的实例 方便patch中createElm中执行组件渲染后 可以拿到 vm.$el
      if(!Ctor){
        throw new Error(`请注册组件${tag}`)
      }
      const vm = vnode.componentInstance = new Ctor({ isComponent: true })
      vm.$mount()
      // 挂载完就可以拿到$el
    }
  }
  return vnode(vm, `vue-component-${tag}`, props, key, undefined, undefined, {
    children,
    Ctor
  })
}

export function createTextElement(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, data, key, children, text, componentOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children: children || [],
    text,
    componentOptions
  }
}