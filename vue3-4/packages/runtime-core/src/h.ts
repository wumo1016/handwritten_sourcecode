/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-04 18:00:06
 */
import { isObject } from '@vue/shared'
import { createVnode, isVnode } from './createVnode'

export function h(type, propsOrChildren?, children?) {
  let l = arguments.length
  if (l === 2) {
    // 第二个参数 => 虚拟节点 | 属 性
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      // 虚拟节点
      if (isVnode(propsOrChildren)) {
        return createVnode(type, null, [propsOrChildren])
      } else {
        // 属性
        return createVnode(type, propsOrChildren)
      }
    }
    // 儿子 => 数组 | 文本
    return createVnode(type, null, propsOrChildren)
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2)
    }
    if (l == 3 && isVnode(children)) {
      children = [children]
    }
    // == 3  | == 1
    return createVnode(type, propsOrChildren, children)
  }
}
