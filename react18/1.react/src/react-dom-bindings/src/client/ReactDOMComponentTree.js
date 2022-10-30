const randomKey = Math.random().toString(36).slice(2)
const internalInstanceKey = '__reactFiber$' + randomKey
const internalPropsKey = '__reactProps$' + randomKey

/**
 * 从真实的DOM节点上获取它对应的fiber节点
 * @param {*} targetNode
 */
export function getClosestInstanceFromNode(targetNode) {
  // 在 completeWork => createInstance 中缓存的
  const targetInst = targetNode[internalInstanceKey]
  return targetInst || null
}
/**
 * 提前缓存fiber节点的实例到DOM节点上 构建冒泡和捕获队列的
 * @param {*} hostInst
 * @param {*} node
 */
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst
}
/**
 * @Author: wyb
 * @Descripttion: 缓存属性
 * @param {*} node
 * @param {*} props
 */
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} node
 */
export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null
}
