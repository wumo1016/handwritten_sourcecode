import { apiCreateApp } from './apiCreateApp'
import { invokeArrayFns } from './apiLifecycle'
import { effect } from "@vue/reactivity/src";
import { hasOwn, ShapeFlags } from "@vue/shared/src"
import { createComponentInstance, setupComponent } from "./component";
import { normailzeVNode, Text } from './vnode';
import { queueJob } from './scheduler';

export function createRenderer(renderOptions) {

  const {
    createElemnet: hostCeateElemnet,
    insert: hostInsert,
    remove: hostRemove,
    querySelector: hostQuerySelector,
    setElementText: hostSetElementText,
    createText: hostCreateText,
    setText: hostSetText,
    patchProps: hostPatchProps,
    nextSibling: hostNextSibling,
  } = renderOptions

  function isSameVNodeType(n1, n2) {
    return n1 && n2 && n1.type == n2.type && n1.key == n2.key
  }

  function unmount(vnode) { // 如果是组件 需要特殊操作
    hostRemove(vnode.el)
  }

  function patch(n1, n2, container, anchor = null) {

    const { shapeFlag, type } = n2

    // 如果新旧的不是同一个类型的节点 直接删除老dom
    if (n1 && !isSameVNodeType(n1, n2)) {
      // 取得当前节点的下一个节点 防止更新错误
      anchor = hostNextSibling(n1.el)
      unmount(n1) // 卸载老节点
      n1 = null // 相当与重新渲染 n2的内容
    }

    switch (type) {
      case Text:  // 处理多个子文本的情况
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) { // 元素节点
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // 组件
          processComponent(n1, n2, container)
        }
        break
    }
  }

  /* ---------------- 文本相关 ----------------------- */
  function processText(n1, n2, container) {
    if (n1 == null) {
      hostInsert(n2.el = hostCreateText(n2.children), container)
    } else { // 文本更新

    }
  }

  /* ---------------- 元素相关 ----------------------- */
  function processElement(n1, n2, container, anchor) {
    if (n1 == null) { // 初始化
      mountElement(n2, container, anchor)
    } else { // 元素更新
      patchElement(n1, n2, container)
    }
  }

  function mountElement(vnode, container, anchor) {
    const { type, props, shapeFlag, children } = vnode
    const el = vnode.el = hostCeateElemnet(type)
    if (props) {
      for (const key in props) {
        hostPatchProps(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 孩子是文本节点
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container) {// children可能是多个文本节点
    for (let i = 0; i < children.length; i++) {
      const child = normailzeVNode(children[i])
      patch(null, child, container)
    }
  }

  function patchElement(oldVnode, newVnode, container) {
    // 复用老dom
    const el = newVnode.el = oldVnode.el
    // 更新属性
    const oldProps = oldVnode.props || {}
    const newProps = newVnode.props || {}
    patchProps(el, oldProps, newProps)
    // 更新children
    patchChildren(oldVnode, newVnode, el)

  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 新的覆盖旧的
      for (const key in newProps) {
        if (oldProps[key] !== newProps[key]) {
          hostPatchProps(el, key, oldProps[key], newProps[key])
        }
      }
      // 老的有新的没有 删除旧的
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProps(el, key, oldProps[key], null)
        }
      }
    }
  }

  function patchChildren(oldVnode, newVnode, el) {
    const c1 = oldVnode.children
    const c2 = newVnode.children

    const oldShapeFlag = oldVnode.shapeFlag
    const newShapeFlag = newVnode.shapeFlag
    if (newShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 新孩子是文本
      // 老孩子是数组 需要遍历移除
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1) // 如果中包含组件 需要销毁组件
      }
      if (c2 !== c1) {
        hostSetElementText(el, c2)
      }
    } else { // 新孩子是元素 或 null
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 老孩子是数组 
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 新孩子是数组
          // diff算法
          patchKeyedChildren(c1, c2, el)
        } else { // 新的没有孩子 删除老的孩子
          unmountChildren(c1)
        }
      } else { // 老孩子是文本 或 null
        if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 老孩子是文本
          hostSetElementText(el, '')
        }
        if (newShapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 新孩子是数组
          mountChildren(c2, el)
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }

  function patchKeyedChildren(c1, c2, el) {

    let i = 0 // 头部指针
    let e1 = c1.length - 1 // 旧的尾部指针
    const l2 = c2.length
    let e2 = l2 - 1 // 新的尾部指针

    while (i <= e1 && i <= e2) { // diff1: 头头比较 sync from start
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }

    while (i <= e1 && i <= e2) { // diff2: 尾尾比较 sync from end
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }

    // 有一方完全比对完成
    if (i > e1) { // diff3: 新的多 需要新增
      if (i <= e2) { // 表示新增的部份
        let anchor = e2 + 1 < l2 ? c2[e2 + 1].el : null
        while (i <= e2) {
          patch(null, c2[i], el, anchor)
          i++
        }
      }
    } else if (i > e2) { // diff4: 旧的多 需要移除
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    } else { // diff5 乱序比较

      let s1 = i // 旧的开头
      let s2 = i // 新的开头

      // 将新的key和索引做一个映射表
      const keyToNewIndexMap = new Map()
      for (let index = s2; index <= e2; index++) {
        const newChild = c2[index]
        keyToNewIndexMap.set(newChild.key, index)
      }

      const toBePatched = e2 - s2 + 1 // 新孩子乱序的个数
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0) // 记录乱序数值中谁patch过了

      // 去老的里找有没有可以复用的
      for (let index = s1; index <= e1; index++) {
        const oldChild = c1[index]
        const newIndex = keyToNewIndexMap.get(oldChild.key)
        if (newIndex === undefined) { // diff5.1: 如果新的里面没有 直接移除
          unmount(oldChild)
        } else {  // diff5.2: 都有 直接patch 但是并没有改变位置
          // 将newIndexToOldIndexMap对应的index标记为已经patch过
          newIndexToOldIndexMap[newIndex - s2] = i + 1 // 为防止与默认值相同 加+
          patch(oldChild, c2[newIndex], el)
        }
      }

      const increaseingNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let j = increaseingNewIndexSequence.length - 1

      // 倒序循环乱序数组 然后找到每一个乱序数组的最后一个
      for (let index = toBePatched - 1; index >= 0; index--) {
        const currentIndex = s2 + index // 当前循环的最后一项索引
        const child = c2[currentIndex] // 当前循环的最后一项
        const anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null // 当前循环的最后一项的下一项 可以作为插入的标记
        if (newIndexToOldIndexMap[index] == 0) { // 说明没有被patch过 就是新增
          patch(null, child, el, anchor)
        } else { // 有patch过 就直接插入 做移动操作
          if (index != increaseingNewIndexSequence[j]) { // 对应的xinag
            hostInsert(child.el, el, anchor)
          } else {
            j-- // 跳过不需要移动的元素
          }
        }
      }
    }
  }

  /* ------------------- 组件相关 ----------------------- */
  function processComponent(n1, n2, container) {
    if (n1 == null) { // 初始化
      mountComponent(n2, container)
    } else { // 组件更新

    }
  }

  function mountComponent(vnode, container) {
    // 1.创建组件实例
    const instance = vnode.component = createComponentInstance(vnode)
    // 2.初始化实例(生成render)
    setupComponent(instance)
    // 3.创建effect(执行render)
    setupRenderEffect(instance, container)
  }

  function setupRenderEffect(instance, container) {
    instance.update = effect(function componentEffect() { // 每个组件都有一个effect 当组件依赖的响应式变量更新时 会重新执行
      if (!instance.isMounted) { // 初次渲染
        const { bm, m } = instance
        if (bm) {
          invokeArrayFns(bm)
        }
        const subTree = instance.subTree = instance.render.call(instance.proxy, instance.proxy)
        patch(null, subTree, container)
        instance.isMounted = true
        if (m) {
          invokeArrayFns(m)
        }
      } else {
        const prevTree = instance.subTree
        const newTree = instance.render.call(instance.proxy, instance.proxy)

        const { bu, u } = instance
        if (bu) {
          invokeArrayFns(bu)
        }

        patch(prevTree, newTree, container)
        instance.subTree = newTree

        if (u) {
          invokeArrayFns(u)
        }

      }
    }, { // 自定义更新流程
      scheduler: queueJob
    })
  }

  /* --------------- 创建render --------------- */

  const render = (vnode, container) => {
    // 根据不同虚拟节点创建对应的真实元素
    patch(null, vnode, container)
  }

  return {
    createApp: apiCreateApp(render)
  }
}


function getSequence(list) {
  let len = list.length
  const result = [0] // 先保存第一个
  const p = list.slice(0) // 用来存放索引
  let start
  let end
  let middle

  for (let i = 0; i < list.length; i++) {
    const arrI = list[i];
    if (arrI !== 0) {
      const resultLastIndex = result[result.length - 1]
      if (list[resultLastIndex] < arrI) {
        p[i] = resultLastIndex // 如果是新增 当前项的的前一个就是新数组中的最后一个
        result.push(i)
        continue
      }

      // 二分查找 找到第一个比当前值大的那一个
      start = 0
      end = result.length - 1
      while (start < end) {
        middle = ((start + end) / 2) | 0 // 找到中间位置 如果是小数 取前面一个
        if (list[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      if (list[result[start]] > arrI) { // 只有比当前项大才替换
        if (start > 0) { // 只有不是第一个 才需要标记前面一个是谁
          p[i] = result[start - 1]
        }
        result[start] = i // 替换掉
      }
    }
  }

  // 从后面开始找 因为最后一个肯定是最大得
  // 找到每个值的前一个值 替换掉
  len = result.length
  let last = result[len - 1]
  while (len-- > 0) {
    result[len] = last
    last = p[last]
  }

  return result

}
