import logger, { indent } from 'shared/logger'
import {
  createTextInstance,
  createInstance,
  appendInitialChild,
  finalizeInitialChildren,
  prepareUpdate
} from 'react-dom-bindings/src/client/ReactDOMHostConfig'
import { NoFlags } from './ReactFiberFlags'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'

/**
 * 完成一个fiber节点
 * @param {*} oldFiber 老fiber
 * @param {*} newFiber 新的构建的fiber
 */
export function completeWork(oldFiber, newFiber) {
  indent.number -= 2
  // logger(' '.repeat(indent.number) + 'completeWork', newFiber)
  const newProps = newFiber.pendingProps
  switch (newFiber.tag) {
    case HostRoot:
      bubbleProperties(newFiber)
      break
    // 如果完成的是原生节点的话
    case HostComponent:
      // 现在只是在处理创建或者说挂载新节点的逻辑，后面此处分进行区分是初次挂载还是更新
      const { type } = newFiber
      // 如果老fiber存在 且新fiber上存在真实dom 走更新逻辑
      if (oldFiber !== null && newFiber.stateNode !== null) {
        updateHostComponent(oldFiber, newFiber, type, newProps)
      } else {
        // 创建真实的DOM节点
        const dom = createInstance(type, newProps, newFiber)
        // 把自己所有的儿子都添加到自己的身上
        appendAllChildren(dom, newFiber)
        newFiber.stateNode = dom
        // 处理已经完成挂载的dom 例如：设置dom属性等
        finalizeInitialChildren(dom, type, newProps)
      }
      bubbleProperties(newFiber)
      break
    case HostText:
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      const newText = newProps
      // 创建真实的DOM节点并传入stateNode
      newFiber.stateNode = createTextInstance(newText)
      // 向上冒泡属性
      bubbleProperties(newFiber)
      break
  }
}
/**
 * 把当前的完成的fiber所有的子节点对应的真实DOM都挂载到自己父parent真实DOM节点上
 * @param {*} parentDom 当前完成的fiber真实的DOM节点
 * @param {*} curFiber 完成的fiber
 */
function appendAllChildren(parentDom, curFiber) {
  // 一般只处理儿子 或者是 离自己最近的真实节点
  let childFiber = curFiber.child
  while (childFiber) {
    // 如果子节点类型是一个原生节点或者是一个文本节点
    if (childFiber.tag === HostComponent || childFiber.tag === HostText) {
      appendInitialChild(parentDom, childFiber.stateNode)
      // 如果第一个儿子不是一个原生节点，说明它可能是一个函数组件，跳到子节点
    } else if (childFiber.child !== null) {
      childFiber = childFiber.child
      continue
    }
    // 当子 fiber与当前 fiber 相等时 跳出循环
    if (childFiber === curFiber) {
      return
    }
    // 如果当前的节点没有弟弟，就一直向上找父亲，直到找到父亲的弟弟
    while (childFiber.sibling === null) {
      if (childFiber.return === null || childFiber.return === curFiber) {
        return
      }
      //回到父节点
      childFiber = childFiber.return
    }
    childFiber = childFiber.sibling
  }
}
/**
 * @Author: wyb
 * @Descripttion: 更新原生节点组件
 * @param {*} oldFiber
 * @param {*} newFiber
 * @param {*} type
 * @param {*} newProps
 */
function updateHostComponent(oldFiber, newFiber, type, newProps) {
  const oldProps = oldFiber.memoizedProps // 老的属性
  const newDom = newFiber.stateNode // 老的DOM节点
  // 比较新老属性，收集属性的差异
  const updatePayload = prepareUpdate(newDom, type, oldProps, newProps)
  // 让原生组件的新fiber更新队列等于[] => [prop1, value1, prop2, value2]
  newFiber.updateQueue = updatePayload
  if (updatePayload) {
    markUpdate(newFiber)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 更新当前节点的subtreeFlags 就是子节点有什么操作 例如更新、插入等
 * @param {*} curFiber
 */
function bubbleProperties(curFiber) {
  let subtreeFlags = NoFlags
  // 遍历当前fiber的所有子节点
  // 把所有的子节的副作用，以及子节点的子节点的副作用全部合并
  let child = curFiber.child
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child = child.sibling
  }
  curFiber.subtreeFlags = subtreeFlags
}
/**
 * @Author: wyb
 * @Descripttion: 给当前fiber标记更新
 * @param {*} fiber
 */
function markUpdate(fiber) {
  fiber.flags |= Update // 给当前的fiber添加更新的副作用
}
