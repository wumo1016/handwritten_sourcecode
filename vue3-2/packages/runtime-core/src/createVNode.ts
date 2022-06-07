import { isArray, isString } from '@vue/shared'

export function createVNode(type, props = null, children = null) {
  // 创建虚拟节点
  const vnode = {
    type,
    props,
    children,
    key: props && props.key,
    el: null, // 真实节点
    shapeFlag: isString(type) ? ShapeFlags.ELEMENT : 0 // 标记自己的类型
  }
  if (children) {
    let temp = 0 // 标记孩子的类型
    if (isArray(children)) {
      temp = ShapeFlags.ARRAY_CHILDREN
    } else {
      vnode.children = String(children)
      temp = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag = vnode.shapeFlag | temp // 可以同时标记 自己 和 孩子的类型 将来再与指定类型进行 & 如果成立则 存在
  }

  return vnode
}

export const enum ShapeFlags { // vue3提供的形状标识
  ELEMENT = 1, // 1
  FUNCTIONAL_COMPONENT = 1 << 1, // 2
  STATEFUL_COMPONENT = 1 << 2, // 4
  TEXT_CHILDREN = 1 << 3, // 8
  ARRAY_CHILDREN = 1 << 4, // 16
  SLOTS_CHILDREN = 1 << 5, // 32
  TELEPORT = 1 << 6, // 64
  SUSPENSE = 1 << 7, // 128
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

// vue 两部分组成  编译时（将模板变异成render函数 compiler-dom compiler-core），返回的依旧是虚拟节点
// 运行时 就是将虚拟节点变成（真实的节点）runtime-dom(提供domapi) runtime-core(虚拟节点),core中会调用runtime-dom ,你提供对应的方法，我内部会调用这个方法
// runtime-core 基于reactivity 内部用的是响应式原理来做的
// vue-loader webpack 里面做的，   vite  @vite/vue-plugin
// 早期mpvue 就是基于vue2源码扩展了一层 实现小程序的渲染  weex platform
//  我暴露api 提供给你 ，你基于这个方法来实现
