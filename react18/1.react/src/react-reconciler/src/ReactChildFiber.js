import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress
} from './ReactFiber'
import { Placement } from './ReactFiberFlags'
import isArray from 'shared/isArray'

/**
 * @param {*} shouldTrackSideEffects 是否跟踪副作用 是否是更新
 */
function createChildReconciler(shouldTrackSideEffects) {
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} parentFiber
   * @param {*} currentFirstFiber
   * @param {*} newChild
   */
  function reconcileSingleElement(parentFiber, oldFiberFirstChild, newChild) {
    // 新的虚拟DOM的key,也就是唯一标识
    const key = newChild.key // null
    let childFiber = oldFiberFirstChild // 老的FunctionComponent对应的fiber
    while (childFiber !== null) {
      // 判断此老fiber对应的key和新的虚拟DOM对象的key是否一样 null===null
      if (childFiber.key === key) {
        // 判断老fiber对应的类型和新虚拟DOM元素对应的类型是否相同 p div
        if (childFiber.type === newChild.type) {
          // 删除剩余的子节点
          // deleteRemainingChildren(parentFiber, childFiber.sibling)
          // 如果key一样，类型也一样，则认为此节点可以复用
          const existing = useFiber(childFiber, newChild.props)
          existing.return = parentFiber
          return existing
        } else {
          //如果找到一key一样老fiber,但是类型不一样，不能此老fiber,把剩下的全部删除
          // deleteRemainingChildren(parentFiber, childFiber)
        }
      } else {
        // deleteChild(parentFiber, childFiber)
      }
      childFiber = childFiber.sibling
    }
    // 因为我们现实的初次挂载，老节点oldFiberFirstChild肯定是没有的
    // 根据虚拟DOM创建新的Fiber节点
    const newChildFiber = createFiberFromElement(newChild)
    newChildFiber.return = parentFiber
    return newChildFiber
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} fiber
   * @param {*} pendingProps
   */
  function useFiber(oldFiber, pendingProps) {
    const fiber = createWorkInProgress(oldFiber, pendingProps)
    fiber.index = 0
    fiber.sibling = null
    return fiber
  }
  /**
   * 设置副作用
   * @param {*} newFiber
   * @returns
   */
  function placeSingleChild(newFiber) {
    // 说明要添加副作用 没有老fiber
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // 要在最后的提交阶段插入此节点  React渲染分成渲染(创建Fiber树)和提交(更新真实DOM)二个阶段
      newFiber.flags |= Placement
    }
    return newFiber
  }
  /**
   * @Author: wyb
   * @Descripttion: 创建一个子 fiber
   * @param {*} parentFiber
   * @param {*} newChild
   */
  function createChild(parentFiber, newChild) {
    // 文本节点
    if (
      (typeof newChild === 'string' && newChild !== '') ||
      typeof newChild === 'number'
    ) {
      const created = createFiberFromText(`${newChild}`)
      created.return = parentFiber
      return created
    }
    // 其他
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created = createFiberFromElement(newChild)
          created.return = parentFiber
          return created
        }
        default:
          break
      }
    }
    return null
  }
  /**
   * @Author: wyb
   * @Descripttion: 设置副作用 并添加索引
   * @param {*} newFiber
   * @param {*} newIdx
   */
  function placeChild(newFiber, newIdx) {
    newFiber.index = newIdx
    if (shouldTrackSideEffects) {
      //如果一个fiber它的flags上有Placement,说明此节点需要创建真实DOM并且插入到父容器中
      //如果父fiber节点是初次挂载，shouldTrackSideEffects=false,不需要添加flags
      //这种情况下会在完成阶段把所有的子节点全部添加到自己身上
      newFiber.flags |= Placement
    }
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} newFiber
   * @param {*} oldFiberFirstChild
   * @param {*} newChildren
   */
  function reconcileChildrenArray(newFiber, oldFiberFirstChild, newChildren) {
    let resultingFirstChild = null // 返回的第一个新儿子
    let previousNewFiber = null // 上一个的一个新的fiber
    let newIdx = 0
    for (; newIdx < newChildren.length; newIdx++) {
      const newChildFiber = createChild(newFiber, newChildren[newIdx])
      if (newChildFiber === null) continue
      placeChild(newChildFiber, newIdx)
      // 如果previousNewFiber为null，说明这是第一个fiber
      if (previousNewFiber === null) {
        resultingFirstChild = newChildFiber //这个 newChildFiber 就是大儿子
      } else {
        // 否则说明不是大儿子，就把这个 newChildFiber 添加上一个子节点后面
        previousNewFiber.sibling = newChildFiber
      }
      // 让 newChildFiber 成为最后一个或者说上一个子fiber
      previousNewFiber = newChildFiber
    }
    return resultingFirstChild
  }
  /**
   * 比较子Fibers  DOM-DIFF 就是用老的子fiber链表和新的虚拟DOM进行比较的过程
   * @param {*} newFiber 新的父Fiber
   * @param {*} oldFiberFirstChild 老fiber第一个子fiber   current一般来说指的是老
   * @param {*} newChild 新的子虚拟DOM  h1虚拟DOM
   */
  function reconcileChildFibers(newFiber, oldFiberFirstChild, newChild) {
    // 单节点
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(newFiber, oldFiberFirstChild, newChild)
          )
        default:
          break
      }
    }
    // 多节点
    if (isArray(newChild)) {
      return reconcileChildrenArray(newFiber, oldFiberFirstChild, newChild)
    }
    return null
  }
  return reconcileChildFibers
}
//有老父fiber更新的时候用这个
export const reconcileChildFibers = createChildReconciler(true)
//如果没有老父fiber,初次挂载的时候用这个
export const mountChildFibers = createChildReconciler(false)
