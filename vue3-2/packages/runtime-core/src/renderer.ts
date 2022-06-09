import { isNumber, isString } from '@vue/shared'
import { createVNode, ShapeFlags, Text } from './createVNode'

/**
 * @Author: wyb
 * @Descripttion: 格式化 children(文本、数字) => 虚拟节点
 * @param {*} children
 * @param {*} i
 */
function normalize(children, i) {
  if (isString(children[i]) || isNumber(children[i])) {
    children[i] = createVNode(Text, null, children[i])
  }
  return children[i]
}

/**
 * @Author: wyb
 * @Descripttion: 创建自定义渲染器
 * @param {*} options
 */
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    createTextNode: hostCreateTextNode,
    insert: hostInsert,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setText: hostSetText,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp
  } = options

  /**
   * @Author: wyb
   * @Descripttion: 处理文本节点
   * @param {*} n1
   * @param {*} n2
   * @param {*} container
   */
  function processText(n1, n2, container) {
    // 初始化
    if (n1 == null) {
      hostInsert((n2.el = hostCreateTextNode(n2.children)), container)
    }
  }

  /**
   * @Author: wyb
   * @Descripttion: 处理元素节点
   * @param {*} n1
   * @param {*} n2
   * @param {*} container
   */
  function processElement(n1, n2, container) {
    // 初始化
    if (n1 == null) {
      mountElement(n2, container)
    } else {
    }
  }
  /**
   * @Author: wyb
   * @Descripttion: 挂载元素节点
   * @param {*} vnode
   * @param {*} container
   */
  function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode
    // 创建真实元素 并将其保存到 vnode 上
    const el = (vnode.el = hostCreateElement(type))

    // 处理 props
    if (props) {
      patchProps(el, null, props)
    }

    // 渲染孩子 - 文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    // 渲染孩子 - 数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }

    hostInsert(el, container)
  }

  /**
   * @Author: wyb
   * @Descripttion: 渲染孩子
   * @param {*} children
   * @param {*} container
   */
  function mountChildren(children, container) {
    // 递归渲染子节点
    for (let i = 0, len = children.length; i < len; i++) {
      const child = normalize(children, i)
      patch(null, child, container)
    }
  }

  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} el
   * @param {*} oldProp
   * @param {*} newProps
   */
  function patchProps(el, oldProps, newProps) {
    if (!oldProps) oldProps = {}
    if (!newProps) newProps = {}
    // 新的覆盖旧的
    for (let key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key])
    }
    // 老的有的新没有要删除
    for (let key in oldProps) {
      if (newProps[key] == null) {
        hostPatchProp(el, key, oldProps[key], null)
      }
    }
  }

  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} n1 oldVNode
   * @param {*} n2 newVNode
   * @param {*} container 容器
   */
  function patch(n1, n2, container) {
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container)
        }
    }
  }

  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} vnode
   * @param {*} container
   */
  function render(vnode, container) {
    // 卸载
    if (vnode == null) {
    } else {
      // 初始化 或 更新
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode // 第一次渲染的时候将vnode保存到dom上
  }

  return {
    render
  }
}
