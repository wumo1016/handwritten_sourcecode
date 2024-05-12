/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-12 17:25:58
 */
import { ShapeFlags } from '@vue/shared'
import { isSameVnode } from './createVnode'

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp
  } = renderOptions

  // 渲染 + 更新
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} n1 旧 vnode
   * @param {*} n2 新 vnode
   * @param {*} container
   */
  const patch = (n1, n2, container) => {
    if (n1 == n2) return

    // 如果不是同一个dom 直接移除旧的
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    // 初始化操作
    if (n1 === null) {
      mountElement(n2, container)
    }
  }

  /**
   * @Author: wyb
   * @Descripttion: 创建元素
   * @param {*} vnode
   * @param {*} container
   */
  const mountElement = (vnode, container) => {
    const { type, children, props, shapeFlag } = vnode
    // 创建元素
    const el = (vnode.el = hostCreateElement(type))
    // 处理属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 是否是文本元素
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    // 插入容器
    hostInsert(el, container)
  }

  /**
   * @Author: wyb
   * @Descripttion: 创建孩子
   * @param {*} children
   * @param {*} container
   */
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }

  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} vnode
   */
  const unmount = vnode => hostRemove(vnode.el)

  // 多次调用render 会进行虚拟节点的比较，在进行更新
  const render = (vnode, container) => {
    // 卸载元素
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    }

    patch(container._vnode || null, vnode, container)

    // 挂载旧的vnode
    container._vnode = vnode
  }

  return {
    render
  }
}
