import { effect } from "@vue/reactivity/src";
import { ShapeFlags } from "@vue/shared/src"
import { createComponentInstance, setupComponent } from "./component";

// n1老的vnode节点 n2新的vnode
export function patch(n1, n2, container){
  const { shapeFlag } = n2
  if(shapeFlag & ShapeFlags.ELEMENT){ // 元素节点
    console.log(n2);
  } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){ // 组件
    processComponent(n1, n2, container)
  }
}

function processComponent(n1, n2, container){
  if(n1 == null){ // 初始化
    mountComponent(n2, container)
  } else { // 组件更新

  }
}

function mountComponent(vnode, container){
  // 1.创建组件实例
  const instance = vnode.component = createComponentInstance(vnode)
  // 2.初始化实例(生成render)
  setupComponent(instance)
  // 3.创建effect(执行render)
  setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container){
  instance.update = effect(function componentEffect(){ // 每个组件都有一个effect
    if(!instance.isMounted){ // 初次渲染

      const subTree = instance.subTree = instance.render.call(instance.proxy, instance.proxy)
      instance.isMounted = true
      patch(null, subTree, container)
      
    } else { // 更新

    }
  })
}
