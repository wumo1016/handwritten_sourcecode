import { isNumber, isString } from '@vue/shared'
import { createVNode, isSameVNode, ShapeFlags, Text } from './createVNode'

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
   * @Descripttion: 卸载单个vnode
   * @param {*} n1
   */
  function unmount(n1) {
    hostRemove(n1.el)
  }

  /**
   * @Author: wyb
   * @Descripttion: 批量卸载vnode
   * @param {*} children
   */
  function unmountChildren(children) {
    children.forEach(child => {
      unmount(child)
    })
  }

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
  function processElement(n1, n2, container, anchor) {
    // 初始化
    if (n1 == null) {
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2)
    }
  }
  /**
   * @Author: wyb
   * @Descripttion: 挂载元素节点
   * @param {*} vnode
   * @param {*} container
   */
  function mountElement(vnode, container, anchor) {
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

    hostInsert(el, container, anchor)
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
   * @Descripttion: 更新元素
   * @param {*} n1
   * @param {*} n2
   * @param {*} container
   */
  function patchElement(n1, n2) {
    // 节点复用
    const el = (n2.el = n1.el)
    // 更新属性
    patchProps(el, n1.props, n2.props)
    // 更新孩子
    pathChildren(n1, n2, el)
  }

  /**
   * @Author: wyb
   * @Descripttion: 比对孩子
   * @param {*} n1
   * @param {*} n2
   */
  function pathChildren(n1, n2, el) {
    /* 
     新    旧
    文本	数组	（删除老儿子，设置文本内容）
    文本	文本/空	（更新文本即可）
    数组	数组	（diff算法）
    数组	文本	（清空文本，进行挂载）
    数组	空	（进行挂载） 与上面的类似
    空	数组	（删除所有儿子）
    空	文本	（清空文本）
    空	空	（无需处理）
    */

    const oldShapFlag = n1.shapeFlag
    const newShapFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children

    // 新文本
    if (newShapFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧数组
      if (oldShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      // 旧文本 或 旧空
      if (c1 !== c2) {
        hostSetElementText(el, c2)
      }
      // 新数组
    } else if (newShapFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 旧数组
      if (oldShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, el)
        // 旧文本 或 旧文本
      } else {
        // 旧文本
        if (oldShapFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '') // 先清空旧文本
        }
        // 旧空
        mountChildren(c2, el) // 直接挂载孩子
      }
      // 新空
    } else {
      // 旧数组
      if (oldShapFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1) // 卸载旧孩子
      }
      // 旧文本 或 旧空
      hostSetElementText(el, c2)
    }
  }

  /**
   * @Author: wyb
   * @Descripttion: diff算法
   * @param {*} c1
   * @param {*} c2
   */
  function patchKeyedChildren(c1, c2, el) {
    let i = 0 // 头指针
    let e1 = c1.length - 1 // 旧尾指针
    let e2 = c2.length - 1 // 新尾指针

    // 从头开始比 sync from start
    // 有任何一方比对完毕 就无需比对了
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el)
        i++
      } else {
        break
      }
    }

    // console.log(i, e1, e2)

    // 从尾开始比 sync from end
    // 有任何一方比对完毕 就无需比对了
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el)
        e1--
        e2--
      } else {
        break
      }
    }

    // 有新增
    if (i > e1) {
      while (i <= e2) {
        // 看e2是不是末尾项 找到插入的参照物
        const nextPos = e2 + 1
        const anchor = nextPos >= c2.length ? null : c2[nextPos].el
        patch(null, c2[i], el, anchor)
        i++
      }
    } else if (i > e2) {
      // 有减少
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }

    // 乱序比对
    let s1 = i // s1 => e1 老的需要比对的地方
    let s2 = i // s2 => e2 新的需要比对的地方

    // 将新的数据做一个映射表 childKey => index
    const keyToNewIndexMap = new Map()
    for (let j = s2; j <= e2; j++) {
      keyToNewIndexMap.set(c2[j].key, j)
    }

    // 需要插入的个数
    const toBePatch = e2 - s2 + 1
    // 用新的位置和老的位置做一个关联
    const seq = new Array(toBePatch).fill(0)

    // 循环老的
    for (let j = s1; j <= e1; j++) {
      const oldVNode = c1[j]
      const newIndex = keyToNewIndexMap.get(oldVNode.key)

      // 如果新的里面没有 直接移除
      if (newIndex == null) {
        unmount(oldVNode)
      } else {
        // 都有做 patch
        patch(oldVNode, c2[newIndex], el)
        // 新的相对索引 => 老的真实索引
        seq[newIndex - s2] = j + 1 // 加1 保证不会出现0
      }
    }

    console.log(seq)

    // 倒序插入 新增的元素
    for (let j = toBePatch - 1; j >= 0; j--) {
      const curIndex = s2 + j
      const child = c2[curIndex]
      const anchor = curIndex + 1 >= c2.length ? null : c2[curIndex + 1].el
      // 新增
      // if (child.el == null) {
      if (seq[j] === 0) {
        patch(null, child, el, anchor)
      } else {
        hostInsert(child.el, el, anchor)
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
  function patch(n1, n2, container, anchor = null) {
    // 如果不是同一个节点 直接将旧的移除
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1)
      n1 = null
    }

    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
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
      if (container._vnode) {
        unmount(container._vnode)
      }
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
