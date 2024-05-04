/*
 * @Description:
 * @Author: wyb
 * @LastEditors: wyb
 * @LastEditTime: 2024-05-04 17:50:59
 */
import { ShapeFlags } from '@vue/shared'

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
  const patch = (n1, n2, container) => {
    if (n1 == n2) return
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
    const el = hostCreateElement(type)
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

  // 多次调用render 会进行虚拟节点的比较，在进行更新
  const render = (vnode, container) => {
    patch(container._vnode || null, vnode, container)
  }

  return {
    render
  }
}
