import { isObject } from '@vue/shared'
import { createVNode, isVnode } from './createVNode'

/**
 * @Author: wyb
 * @Descripttion: 用户用来创建虚拟节点
 * @param {*} type
 * @param {*} propsOrChildren
 * @param {*} children
 */
export function h(type, propsOrChildren, children) {
  const l = arguments.length
  // h(type, string\object\array)
  if (l === 2) {
    // 属性 或者 vnode对象
    if (isObject(propsOrChildren)) {
      if (isVnode(propsOrChildren))
        return createVNode(type, null, [propsOrChildren])
      return createVNode(type, propsOrChildren)
    } else {
      return createVNode(type, null, propsOrChildren) // h(type,[] )  h(type,'文本')
    }
  } else {
    if (l === 3 && isVnode(children)) {
      children = [children]
    } else if (l > 3) {
      children = Array.from(arguments).slice(2) // h(type, 属性，儿子数组)
    }
    return createVNode(type, propsOrChildren, children)
  }
}
