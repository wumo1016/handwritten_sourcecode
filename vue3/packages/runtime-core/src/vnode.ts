import { isString } from "@vue/shared/src"

// type: tag(string) || component(object)
export const createVNode = (type, props, chlidren = null) => {

    

  const vnode = {
    __v_isVnode: true, // 是vnode节点
    type, // 类型 组件或者标签
    props,
    chlidren,
    key: props && props.key,
    el: null,
    shapeFlag: isString(type)
  }

  return vnode

}
