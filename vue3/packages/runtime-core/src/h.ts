import { isArray, isObject } from "@vue/shared/src";
import { createVNode, isVnode } from "./vnode";

export function h(type, propsOrChildren, children = null){

  const l = arguments.length

  if(l == 2){ // 类型 + 属性 类型 + 孩子
    if(isObject(propsOrChildren) && !isArray(propsOrChildren)){
      if(isVnode(propsOrChildren)){ // 如果是嵌套的 h('div', h('span'))
        return createVNode(type, null, [propsOrChildren])
      } else {
        return createVNode(type, propsOrChildren)
      }
    } else { // 如果第二个参数不是对象 一定是孩子
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if(l > 3){ // 超过三个
      children = Array.prototype.slice.call(arguments, 2)
    } else if(l == 3 && isVnode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }

}
