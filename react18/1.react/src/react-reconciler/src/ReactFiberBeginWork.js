import logger, { indent } from 'shared/logger'
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
  FunctionComponent
} from './ReactWorkTags'
import { processUpdateQueue } from './ReactFiberClassUpdateQueue'
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { shouldSetTextContent } from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import { renderWithHooks } from 'react-reconciler/src/ReactFiberHooks'

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} oldFiber 老fiber
 * @param {*} newFiber 新的fiber
 */
export function beginWork(oldFiber, newFiber) {
  logger(' '.repeat(indent.number) + 'beginWork', newFiber)
  indent.number += 2
  switch (newFiber.tag) {
    // 因为在React里组件其实有两种，一种是函数组件，一种是类组件，但是它们都是都是函数
    case IndeterminateComponent:
      return mountIndeterminateComponent(oldFiber, newFiber, newFiber.type)
    case HostRoot:
      return updateHostRoot(oldFiber, newFiber)
    case HostComponent:
      return updateHostComponent(oldFiber, newFiber)
    case HostText:
      return null
    default:
      return null
  }
}
/**
 * @Author: wyb
 * @Descripttion: 更新根节点
 * @param {*} oldFiber 老fiber
 * @param {*} newFiber 新的fiber
 */
function updateHostRoot(oldFiber, newFiber) {
  // 将虚拟dom 从更新队列中保存到 memoizedState 中
  processUpdateQueue(newFiber)
  // 新的子虚拟 dom
  const nextChildren = newFiber.memoizedState.element // h1
  // 根据新的虚拟DOM生成子fiber链表 就是给 chlid 赋值
  reconcileChildren(oldFiber, newFiber, nextChildren)
  // 返回第一个子节点
  return newFiber.child
}
/**
 * 根据新的虚拟DOM生成新的Fiber链表
 * @param {*} oldFiber 老的父Fiber
 * @param {*} newFiber 新的你Fiber
 * @param {*} nextChildren 新的子虚拟DOM
 */
function reconcileChildren(oldFiber, newFiber, nextChildren) {
  // 如果此新fiber没有老fiber,说明此新fiber是新创建的
  // 如果此fiber没能对应的老fiber,说明此fiber是新创建的，如果这个父fiber是新的创建的，它的儿子们也肯定都是新创建的
  if (oldFiber === null) {
    newFiber.child = mountChildFibers(newFiber, null, nextChildren)
  } else {
    // 如果说有老Fiber的话，做DOM-DIFF 拿老的子fiber链表和新的子虚拟DOM进行比较 ，进行最小化的更新
    newFiber.child = reconcileChildFibers(
      newFiber,
      oldFiber.child,
      nextChildren
    )
  }
}
/**
 * 构建原生组件的子fiber链表
 * @param {*} oldFiber 老fiber
 * @param {*} newFiber 新fiber h1
 */
function updateHostComponent(oldFiber, newFiber) {
  const { type } = newFiber
  // 拿到props 里面有 children 子虚拟节点
  const nextProps = newFiber.pendingProps
  let nextChildren = nextProps.children
  // 判断当前虚拟DOM它的儿子是不是一个文本独生子
  const isDirectTextChild = shouldSetTextContent(type, nextProps)
  if (isDirectTextChild) {
    nextChildren = null
  }
  reconcileChildren(oldFiber, newFiber, nextChildren)
  return newFiber.child
}
/**
 * 挂载函数组件
 * @param {*} oldFiber  老fiber
 * @param {*} newFiber 新的fiber
 * @param {*} fn 组件类型，也就是函数组件的定义
 */
export function mountIndeterminateComponent(oldFiber, newFiber, fn) {
  const props = newFiber.pendingProps
  const value = renderWithHooks(oldFiber, newFiber, fn, props)
  newFiber.tag = FunctionComponent
  reconcileChildren(oldFiber, newFiber, value)
  return newFiber.child
}
