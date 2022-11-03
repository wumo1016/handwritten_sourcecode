import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress
} from './ReactFiber'
import { ChildDeletion, Placement } from './ReactFiberFlags'
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
          deleteRemainingChildren(parentFiber, childFiber.sibling)
          // 如果key一样，类型也一样，则认为此节点可以复用
          const existing = useFiber(childFiber, newChild.props)
          existing.return = parentFiber
          return existing
        } else {
          // key一样，type不一样，也就是不能复用，把子节点全部删除
          deleteRemainingChildren(parentFiber, childFiber)
        }
      } else {
        deleteChild(parentFiber, childFiber)
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
   * @Descripttion: 删除从 currentFirstChild 之后所有的fiber节点
   * @param {*} parentFiber
   * @param {*} currentFirstChild
   */
  function deleteRemainingChildren(parentFiber, currentFirstChild) {
    if (!shouldTrackSideEffects) return
    let childToDelete = currentFirstChild
    while (childToDelete !== null) {
      deleteChild(parentFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} parentFiber
   * @param {*} childToDelete
   */
  function deleteChild(parentFiber, childToDelete) {
    if (!shouldTrackSideEffects) return
    const deletions = parentFiber.deletions
    if (deletions === null) {
      parentFiber.deletions = [childToDelete]
      parentFiber.flags |= ChildDeletion
    } else {
      parentFiber.deletions.push(childToDelete)
    }
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
   * @Descripttion:
   * @param {*} parentFiber
   * @param {*} childToDelete
   */
  function deleteChild(parentFiber, childToDelete) {
    if (!shouldTrackSideEffects) return
    const deletions = parentFiber.deletions
    if (deletions === null) {
      parentFiber.deletions = [childToDelete]
      parentFiber.flags |= ChildDeletion
    } else {
      parentFiber.deletions.push(childToDelete)
    }
  }
  /**
   * @Author: wyb
   * @Descripttion: 多节点
   * @param {*} parentFiber
   * @param {*} oldFiberFirstChild
   * @param {*} newChildren
   */
  function reconcileChildrenArray(
    parentFiber,
    oldFiberFirstChild,
    newChildren
  ) {
    let resultingFirstChild = null // 返回的第一个新儿子 => 返回值
    let previousNewFiber = null // 新fiber链表的最后一个儿子 用于构建新链表

    let oldFiber = oldFiberFirstChild // 当前老fiber
    let nextOldFiber = null // 缓存下一个老fiber
    let lastPlacedIndex = 0 // 上一个不需要移动的老节点的索引
    let newIdx = 0

    // 遍历新孩子 老fiber不等于null 且 索引小于子的长度
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      // 先暂存下一个老fiber
      nextOldFiber = oldFiber.sibling
      // 试图更新或者试图复用老的fiber
      const newFiber = updateSlot(parentFiber, oldFiber, newChildren[newIdx])
      if (newFiber === null) {
        break
      }
      if (shouldTrackSideEffects) {
        // 如果是新创建的fiber 就删除老fiber
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(parentFiber, oldFiber)
        }
      }
      // 指定新fiber的位置
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
      // 指定新头fiber
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        // 构建新链表
        previousNewFiber.sibling = newFiber
      }
      // 更新新尾
      previousNewFiber = newFiber
      // 更新老fiber
      oldFiber = nextOldFiber
    }
    // 新虚拟dom已经循环完毕，但还有老fiber，就删除删除剩下的老fiber
    if (newIdx === newChildren.length && oldFiber) {
      deleteRemainingChildren(parentFiber, oldFiber)
      return resultingFirstChild
    }
    // 如果老fiber没有了，新的虚拟dom还有，就插入剩余的
    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newChildFiber = createChild(parentFiber, newChildren[newIdx])
        if (newChildFiber === null) continue
        lastPlacedIndex = placeChild(newChildFiber, lastPlacedIndex, newIdx)
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
    }
    /* 处理移动的情况 */
    // 老节点对应的map key => fiber
    const existingChildrenMap = mapRemainingChildren(parentFiber, oldFiber)
    // 开始遍历剩下的虚拟dom
    for (; newIdx < newChildren.length; newIdx++) {
      // 根据map进行更新
      const newFiber = updateFromMap(
        existingChildrenMap,
        parentFiber,
        newIdx,
        newChildren[newIdx]
      )
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          // 如果有老fiber
          if (newFiber.alternate !== null) {
            existingChildrenMap.delete(
              newFiber.key === null ? newIdx : newFiber.key
            )
          }
        }
        // 指定新的fiber存放位置 ，并且给lastPlacedIndex赋值
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) {
          // 这个newFiber就是大儿子
          resultingFirstChild = newFiber
        } else {
          // 否则说明不是大儿子，就把这个newFiber添加上一个子节点后面
          previousNewFiber.sibling = newFiber
        }
        // 让newFiber成为最后一个或者说上一个子fiber
        previousNewFiber = newFiber
      }
    }
    if (shouldTrackSideEffects) {
      // 等全部处理完后，删除map中所有剩下的老fiber
      existingChildrenMap.forEach((child) => deleteChild(parentFiber, child))
    }
    return resultingFirstChild
  }
  /**
   * @Author: wyb
   * @Descripttion: 试图更新或者试图复用老的fiber
   * @param {*} parentFiber
   * @param {*} oldFiber
   * @param {*} newChild
   */
  function updateSlot(parentFiber, oldFiber, newChild) {
    const key = oldFiber !== null ? oldFiber.key : null
    // 新孩子是一个对象
    if (newChild !== null && typeof newChild === 'object') {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          // 如果key一样，进入更新元素的逻辑
          if (newChild.key === key) {
            return updateElement(parentFiber, oldFiber, newChild)
          }
        }
        default:
          return null
      }
    }
    return null
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} parentFiber
   * @param {*} oldFiber
   * @param {*} newChild
   */
  function updateElement(parentFiber, oldFiber, newChild) {
    const elementType = newChild.type
    if (oldFiber !== null) {
      // 判断是否类型一样，则表示key和type都一样，可以复用老的fiber和真实DOM
      if (oldFiber.type === elementType) {
        const existing = useFiber(oldFiber, newChild.props)
        existing.return = parentFiber
        return existing
      }
    }
    const created = createFiberFromElement(newChild)
    created.return = parentFiber
    return created
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
   * @Descripttion:
   * @param {*} newFiber
   * @param {*} lastPlacedIndex
   * @param {*} newIdx
   */
  function placeChild(newFiber, lastPlacedIndex, newIdx) {
    // 指定新的fiber在新的挂载索引
    newFiber.index = newIdx
    // 如果不需要跟踪副作用
    if (!shouldTrackSideEffects) {
      return lastPlacedIndex
    }
    // 获取它的老fiber
    const current = newFiber.alternate
    // 存在老fiber
    if (current !== null) {
      const oldIndex = current.index
      // 如果找到的老fiber的索引比lastPlacedIndex要小，则老fiber对应的DOM节点需要移动
      if (oldIndex < lastPlacedIndex) {
        newFiber.flags |= Placement
        return lastPlacedIndex
      } else {
        return oldIndex
      }
    } else {
      // 说明是新fiber，需要插入
      newFiber.flags |= Placement
      return lastPlacedIndex
    }
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} parentFiber
   * @param {*} firstOldFiber
   */
  function mapRemainingChildren(parentFiber, firstOldFiber) {
    const existingChildrenMap = new Map()
    let existingChild = firstOldFiber
    while (existingChild != null) {
      // 如果有key用key,如果没有key使用索引
      if (existingChild.key !== null) {
        existingChildrenMap.set(existingChild.key, existingChild)
      } else {
        existingChildrenMap.set(existingChild.index, existingChild)
      }
      existingChild = existingChild.sibling
    }
    return existingChildrenMap
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} existingChildrenMap
   * @param {*} parentFiber
   * @param {*} newIdx
   * @param {*} newChild
   */
  function updateFromMap(existingChildrenMap, parentFiber, newIdx, newChild) {
    // 纯文本节点
    if (
      (typeof newChild === 'string' && newChild !== '') ||
      typeof newChild === 'number'
    ) {
      // 纯文本没有key 所以直接用索引找
      const matchedFiber = existingChildrenMap.get(newIdx) || null
      return updateTextNode(parentFiber, matchedFiber, '' + newChild)
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const matchedFiber =
            existingChildrenMap.get(
              newChild.key === null ? newIdx : newChild.key
            ) || null
          return updateElement(parentFiber, matchedFiber, newChild)
        }
      }
    }
  }
  /**
   * @Author: wyb
   * @Descripttion:
   * @param {*} returnFiber
   * @param {*} fiber
   * @param {*} textContent
   */
  function updateTextNode(parentFiber, fiber, textContent) {
    if (fiber === null || fiber.tag !== HostText) {
      const created = createFiberFromText(textContent)
      created.return = parentFiber
      return created
    } else {
      const existing = useFiber(fiber, textContent)
      existing.return = parentFiber
      return existing
    }
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
// 有老父fiber更新的时候用这个
export const reconcileChildFibers = createChildReconciler(true)
// 如果没有老父fiber,初次挂载的时候用这个
export const mountChildFibers = createChildReconciler(false)
