import { apiCreateApp } from './apiCreateApp'
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
    return n1.type == n2.type && n1.key == n2.key
  }

  function unmount(vnode) {
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

  function patchChildren(el, oldProps, newProps){
    const c1 = oldProps.children
    const c2 = newProps.children
    // 新的有 老的没有

    // 新的没有 老得有

    // 都是文本

    // 其他
  }

  // children可能是多个文本节点
  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      const child = normailzeVNode(children[i])
      patch(null, child, container)
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
        const subTree = instance.subTree = instance.render.call(instance.proxy, instance.proxy)
        instance.isMounted = true
        patch(null, subTree, container)
      } else {
        const prevTree = instance.subTree
        const newTree = instance.render.call(instance.proxy, instance.proxy)

        patch(prevTree, newTree, container)
        instance.subTree = newTree

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
