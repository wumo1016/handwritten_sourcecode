import assign from 'shared/assign'
import {
  enqueueConcurrentClassUpdate,
  markUpdateLaneFromFiberToRoot
} from './ReactFiberConcurrentUpdates'
import { NoLanes } from './ReactFiberLane'

export const UpdateState = 0

/**
 * @Author: wyb
 * @Descripttion: 初始化更新队列
 * @param {*} fiber
 */
export function initialUpdateQueue(fiber) {
  const queue = {
    baseState: fiber.memoizedState, // 本次状态
    firstBaseUpdate: null, // 上次跳过的链表头部
    lastBaseUpdate: null, // 上次跳过的链表尾部
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue
}
/**
 * @Author: wyb
 * @Descripttion:
 */
export function createUpdate(lane) {
  const update = { tag: UpdateState, lane, next: null }
  return update
}
/**
 * @Author: wyb
 * @Descripttion: 入队
 * @param {*} fiber
 * @param {*} update
 */
export function enqueueUpdate(fiber, update, lane) {
  // const updateQueue = fiber.updateQueue
  // const pending = updateQueue.shared.pending
  // if (pending === null) {
  //   update.next = update
  // } else {
  //   update.next = pending.next
  //   pending.next = update
  // }
  // // pending要指向最后一个更新，最后一个更新 next指向第一个更新
  // // 单向循环链表
  // updateQueue.shared.pending = update
  // return markUpdateLaneFromFiberToRoot(fiber)

  // 获取更新队列
  const updateQueue = fiber.updateQueue
  // 获取共享队列
  const sharedQueue = updateQueue.shared

  return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane)
}
/**
 * @Author: wyb
 * @Descripttion: 根据老状态和更新队列中的更新计算最新的状态
 * @param {*} fiber 要计算的fiber
 */
export function processUpdateQueue(fiber, nextProps, renderLanes) {
  // const queue = fiber.updateQueue
  // const pending = queue.shared.pending
  // if (pending !== null) {
  //   // 清除等待更新的队列
  //   queue.shared.pending = null
  //   // 最后一个更新
  //   const lastPendingUpdate = pending
  //   const firstPendingUpdate = lastPendingUpdate.next
  //   // 把环状链接剪开
  //   lastPendingUpdate.next = null
  //   let newState = fiber.memoizedState
  //   let update = firstPendingUpdate
  //   while (update) {
  //     newState = getStateFromUpdate(update, newState)
  //     update = update.next
  //   }
  //   fiber.memoizedState = newState
  // }
  const queue = fiber.updateQueue
  let firstBaseUpdate = queue.firstBaseUpdate // 老链表头
  let lastBaseUpdate = queue.lastBaseUpdate // 老链表尾
  const pendingQueue = queue.shared.pending // 新链表尾
  // 合并新老链表为单链表
  if (pendingQueue !== null) {
    // 清空队列
    queue.shared.pending = null
    // 新链表尾部
    const lastPendingUpdate = pendingQueue
    // 新链表头
    const firstPendingUpdate = lastPendingUpdate.next
    // 将新链表尾指向断开，变成单链表
    lastPendingUpdate.next = null
    // 如果没有老链表，将其指向新的链表头
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate
    } else {
      // 如果有，就让老链表尾指向新链表头
      lastBaseUpdate.next = firstPendingUpdate
    }
    // 让老链表尾执行新链表尾
    lastBaseUpdate = lastPendingUpdate
  }
  // 遍历队列
  if (firstBaseUpdate !== null) {
    // 上次跳过更新前的状态
    let newState = queue.baseState
    // 尚未执行的更新的lane
    let newLanes = NoLanes
    // 本次跳过更新前的状态
    let newBaseState = null

    let newFirstBaseUpdate = null // 将要跳过的链表头
    let newLastBaseUpdate = null // 将要跳过的链表尾
    let update = firstBaseUpdate
    do {
      // 获取此更新车道
      const updateLane = update.lane
      // 是否需要跳过本次更新，如果是就先克隆一份
      // 如果当前更新车道是当前渲染车道的子集，就执行，否则就跳过
      if (!((renderLanes & updateLane) === updateLane)) {
        const clone = {
          id: update.id,
          lane: updateLane,
          payload: update.payload
        }
        // 第一个跳过的更新
        if (newLastBaseUpdate === null) {
          newFirstBaseUpdate = clone
          newLastBaseUpdate = clone
          newBaseState = newState
        } else {
          // 构建跳过链表
          newLastBaseUpdate.next = clone
          newLastBaseUpdate = clone
        }
        // 更新Lane
        newLanes = newLanes | updateLane
      } else {
        if (newLastBaseUpdate !== null) {
          const clone = {
            id: update.id,
            lane: NoLane,
            payload: update.payload
          }
          // 构建跳过链表
          newLastBaseUpdate.next = clone
          newLastBaseUpdate = clone
        }
        newState = getStateFromUpdate(update, newState, nextProps)
      }
      update = update.next
    } while (update)

    if (newBaseState) {
      queue.baseState = newBaseState
    }
    queue.firstBaseUpdate = newFirstBaseUpdate
    queue.lastBaseUpdate = newLastBaseUpdate
    fiber.lanes = newLanes
    fiber.memoizedState = newState
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} update
 * @param {*} prevState
 */
function getStateFromUpdate(update, prevState, nextProps) {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update
      let partialState
      if (typeof payload === 'function') {
        partialState = payload.call(null, prevState, nextProps)
      } else {
        partialState = payload
      }
      return assign({}, prevState, partialState)
  }
}
/**
 * @Author: wyb
 * @Descripttion: 克隆 fiber 的 updateQueue
 * @param {*} oldFiber
 * @param {*} newFiber
 */
export function cloneUpdateQueue(oldFiber, newFiber) {
  const newUpdatequeue = newFiber.updateQueue
  const oldUpdatequeue = oldFiber.updateQueue
  // 如果新的队列和老的队列是同一个对象的话
  if (oldUpdatequeue === newUpdatequeue) {
    const clone = {
      baseState: oldUpdatequeue.baseState,
      firstBaseUpdate: oldUpdatequeue.firstBaseUpdate,
      firstBaseUpdate: oldUpdatequeue.firstBaseUpdate,
      lastBaseUpdate: oldUpdatequeue.lastBaseUpdate,
      shared: oldUpdatequeue.shared
    }
    newFiber.updateQueue = clone
  }
}
