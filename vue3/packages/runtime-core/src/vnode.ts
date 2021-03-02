import { isArray, isObject, isString, ShapeFlags } from "@vue/shared/src"

// type: tag(string) || component(object)
export const createVNode = (type, props, chlidren = null) => {

  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ?
    ShapeFlags.STATEFUL_COMPONENT : 0

  const vnode = {
    __v_isVnode: true, // 是vnode节点
    type, // 组件对象 / 标签
    props,
    chlidren, // 字符串或数组
    component: null, // 组件实例
    key: props && props.key,
    el: null,
    shapeFlag // 节点类型 标签或者组件等(自己的类型和儿子的类型)
  }

  normalizeChildren(vnode, chlidren)

  return vnode

}

export const isVnode = obj => obj && obj.__v_isVnode

// 对孩子进行处理
function normalizeChildren(vnode, chlidren) {
  let type = 0
  if (chlidren == null) {
    chlidren == null
  } else if (isArray(chlidren)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else {
    type = ShapeFlags.TEXT_CHILDREN
  } // 还有一种插槽
  vnode.shapeFlag |= type
}
