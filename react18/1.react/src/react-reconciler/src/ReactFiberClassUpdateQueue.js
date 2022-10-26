import { markUpdateLaneFromFiberToRoot } from './ReactFiberConcurrentUpdates'

export const UpdateState = 0

/**
 * @Author: wyb
 * @Descripttion: 初始化更新队列
 * @param {*} fiber
 */
export function initialUpdateQueue(fiber) {
  const queue = {
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
export function createUpdate() {
  const update = { tag: UpdateState }
  return update
}
/**
 * @Author: wyb
 * @Descripttion: 入队
 * @param {*} fiber
 * @param {*} update
 */
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue
  const pending = updateQueue.shared.pending
  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }
  // pending要指向最后一个更新，最后一个更新 next指向第一个更新
  // 单向循环链表
  updateQueue.shared.pending = update
  return markUpdateLaneFromFiberToRoot(fiber)
}
/**
 * @Author: wyb
 * @Descripttion: 根据老状态和更新队列中的更新计算最新的状态
 * @param {*} fiber 要计算的fiber
 */
export function processUpdateQueue(fiber) {
  const queue = fiber.updateQueue
  const pending = queue.shared.pending
  if (pending !== null) {
    // 清除等待更新的队列
    queue.shared.pending = null
    // 最后一个更新
    const lastPendingUpdate = pending
    const firstPendingUpdate = lastPendingUpdate.next
    // 把环状链接剪开
    lastPendingUpdate.next = null
    let newState = fiber.memoizedState
    let update = firstPendingUpdate
    while (update) {
      newState = getStateFromUpdate(update, newState)
      update = update.next
    }
    fiber.memoizedState = newState
  }
}
/**
 * @Author: wyb
 * @Descripttion:
 * @param {*} update
 * @param {*} prevState
 */
function getStateFromUpdate(update, prevState) {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update
      return Object.assign({}, prevState, payload)
  }
}
