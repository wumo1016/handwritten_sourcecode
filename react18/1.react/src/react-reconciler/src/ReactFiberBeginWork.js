import logger, { indent } from 'shared/logger'
import {
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
  FunctionComponent
} from './ReactWorkTags'
// import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
// import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
// import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
// import { renderWithHooks } from 'react-reconciler/src/ReactFiberHooks';

/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} current 老fiber
 * @param {*} workInProgress 新的fiber
 */
export function beginWork(current, workInProgress) {
  logger(' '.repeat(indent.number) + 'beginWork', workInProgress)
  indent.number += 2
  switch (workInProgress.tag) {
    // 因为在React里组件其实有两种，一种是函数组件，一种是类组件，但是它们都是都是函数
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type
      )
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return null
    default:
      return null
  }
}
/**
 * @Author: wyb
 * @Descripttion: 更新根节点
 * @param {*} current 老fiber
 * @param {*} workInProgress 新的fiber
 */
function updateHostRoot(current, workInProgress) {
  console.log(workInProgress)
  // 将虚拟dom 从更新队列中保存到 memoizedState 中
  // processUpdateQueue(workInProgress)
  // const nextState = workInProgress.memoizedState
  // // 新的子虚拟 dom
  // const nextChildren = nextState.element //h1
  // // 根据新的虚拟DOM生成子fiber链表 就是给 chlid 赋值
  // reconcileChildren(current, workInProgress, nextChildren)
  // 返回第一个子节点
  return workInProgress.child
}
/**
 * 根据新的虚拟DOM生成新的Fiber链表
 * @param {*} current 老的父Fiber
 * @param {*} workInProgress 新的你Fiber
 * @param {*} nextChildren 新的子虚拟DOM
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  //如果此新fiber没有老fiber,说明此新fiber是新创建的
  //如果此fiber没能对应的老fiber,说明此fiber是新创建的，如果这个父fiber是新的创建的，它的儿子们也肯定都是新创建的
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    //如果说有老Fiber的话，做DOM-DIFF 拿老的子fiber链表和新的子虚拟DOM进行比较 ，进行最小化的更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    )
  }
}
/**
 * 构建原生组件的子fiber链表
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber h1
 */
function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress
  const nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children
  //判断当前虚拟DOM它的儿子是不是一个文本独生子
  const isDirectTextChild = shouldSetTextContent(type, nextProps)
  if (isDirectTextChild) {
    nextChildren = null
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}
/**
 * 挂载函数组件
 * @param {*} current  老fiber
 * @param {*} workInProgress 新的fiber
 * @param {*} Component 组件类型，也就是函数组件的定义
 */
export function mountIndeterminateComponent(
  current,
  workInProgress,
  Component
) {
  const props = workInProgress.pendingProps
  //const value = Component(props);
  const value = renderWithHooks(current, workInProgress, Component, props)
  workInProgress.tag = FunctionComponent
  reconcileChildren(current, workInProgress, value)
  return workInProgress.child
}
