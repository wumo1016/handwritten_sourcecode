import { apiCreateApp } from './apiCreateApp'
import { effect } from "@vue/reactivity/src";
import { ShapeFlags } from "@vue/shared/src"
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
  } = renderOptions

  function patch(n1, n2, container) {
    const { shapeFlag, type } = n2
    switch (type) {
      case Text:  // 处理多个子文本的情况
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) { // 元素节点
          processElement(n1, n2, container)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) { // 组件
          processComponent(n1, n2, container)
        }
        break
    }
  }

  /* ---------------- 文本相关 ----------------------- */
  function processText(n1, n2, container){
    if(n1 == null){
      hostInsert(n2.el = hostCreateText(n2.children), container)
    }
  }

  /* ---------------- 元素相关 ----------------------- */
  function processElement(n1, n2, container) {
    if (n1 == null) { // 初始化
      mountElement(n2, container)
    } else { // 更新

    }
  }

  function mountElement(vnode, container) {
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
    hostInsert(el, container)
  }

  // children可能是多个文本节点
  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      const child = normailzeVNode(children[i])
      patch(null, child, container)
    }
  }

  /* ------------- 组件相关 ----------------------- */
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
        console.log('更新啦');
      }
    }, { // 自定义更新流程
      scheduler: queueJob
    })
  }

  /* --------------- 创建renderer --------------- */

  const renderer = (vnode, container) => {
    // 根据不同虚拟节点创建对应的真实元素
    patch(null, vnode, container)
  }

  return {
    createApp: apiCreateApp(renderer)
  }
}
