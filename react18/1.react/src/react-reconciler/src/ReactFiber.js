import { NoFlags } from './ReactFiberFlags'
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent
} from './ReactWorkTags'

/**
 * @Author: wyb
 * @Descripttion: 创建根 Fiber
 */
export function createHostRootFiber() {
  return createFiber(HostRoot)
}
/**
 * @Author: wyb
 * @Descripttion: 创建 Fiber
 * @param {*} tag
 * @param {*} paddingProps
 * @param {*} key
 */
export function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key)
}
/**
 * @Author: wyb
 * @Descripttion: 创建 Fiber 节点
 * @param {*} tag filber类型
 * @param {*} pendingProps 等待处理或生效的属性
 * @param {*} key 唯一标识
 */
export function FiberNode(tag, pendingProps, key) {
  this.key = key
  this.tag = tag // fiber类型
  this.type = null // 虚拟DOM节点的type  span div p
  this.stateNode = null // 对应的真实DOM

  this.return = null // 指向父节点
  this.child = null // 指向第一个子节点
  this.sibling = null // 指向弟弟

  this.pendingProps = pendingProps // 等待生效的属性
  this.memoizedProps = null // 已经生效的属性

  this.memoizedState = null // fiber自身的状态，每一类fiber的状态不一样
  this.updateQueue = null // 自己身上的更新队列
  this.flags = NoFlags // 副作用标识 表示要针对此fiber节点进行何种操作
  this.subtreeFlags = NoFlags // 子节点对应的副使用标识
  this.alternate = null // 替身，轮替 dom diff时使用
  this.index = 0 // 此fiber在兄弟节点中的位置
}
/**
 * @Author: wyb
 * @Descripttion: 基于老的fiber和新的属性创建新的fiber
 * @param {*} current 老fiber
 * @param {*} pendingProps 新属性
 */
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key)
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    // 新旧 fiber 建立双向指针
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
  }
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  return workInProgress
}

/**
 * 根据虚拟DOM创建Fiber节点
 * @param {*} element
 */
export function createFiberFromElement(element) {
  const { type, key, props: pendingProps } = element
  return createFiberFromTypeAndProps(type, key, pendingProps)
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} type
 * @param {*} key
 * @param {*} pendingProps
 */
function createFiberFromTypeAndProps(type, key, pendingProps) {
  let tag = IndeterminateComponent // 未决策的 例如：函数组件、类组件
  // 如果类型 type是一字符串 span div ，说此此Fiber类型是一个原生组件
  if (typeof type === 'string') {
    tag = HostComponent
  }
  const fiber = createFiber(tag, pendingProps, key)
  fiber.type = type
  return fiber
}
/**
 * @Author: wyb
 * @Descripttion: 根据文本创建Fiber节点
 * @param {*} content
 */
export function createFiberFromText(content) {
  return createFiber(HostText, content, null)
}
