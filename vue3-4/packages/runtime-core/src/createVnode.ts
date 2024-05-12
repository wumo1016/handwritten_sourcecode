/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-12 17:23:59
 */
import { ShapeFlags, isString } from '@vue/shared'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} value
 */
export function isVnode(value) {
  return value?.__v_isVnode
}

/**
 * @Author: wyb
 * @Descripttion: 是否是同一个vnode
 * @param {*} n1
 * @param {*} n2
 */
export function isSameVnode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}

export function createVnode(type, props, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key, // diff算法后面需要的key
    el: null, // 虚拟节点需要对应的真实节点是谁
    shapeFlag
  }
  // 添加孩子类型标记
  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    } else {
      children = String(children)
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    }
  }
  return vnode
}