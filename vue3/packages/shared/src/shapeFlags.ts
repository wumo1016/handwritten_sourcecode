export const enum ShapeFlags {
  ELEMENT = 1, // 元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数组件
  STATEFUL_COMPONENT = 1 << 2, // 有状态组件
  TEXT_CHILDREN = 1 << 3, // 文本孩子
  ARRAY_CHILDREN = 1 << 4,
  SLOTS_CHILDREN = 1 << 5,
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}

// 元素节点   00000001
// 函数组件   00000010
// 状态组件   00000100
// 文本孩子   00001000
// 数组孩子   00010000
