function initialUpdateQueue(fiber) {
  // 创建一个新的更新队列
  // pending其实是一个循环链接
  const queue = {
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue
}

function createUpdate() {
  return {}
}
/**
 * @Author: wyb
 * @Descripttion: 入队
 * @param {*} fiber
 * @param {*} update
 */
function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue
  const shared = updateQueue.shared
  const pending = shared.pending
  if (pending === null) {
    update.next = update
  } else {
    //如果更新队列不为空的话，取出第一个更新
    update.next = pending.next
    //然后让原来队列的最后一个的next指向新的next
    pending.next = update
  }
  updateQueue.shared.pending = update
}
/**
 * @Author: wyb
 * @Descripttion: 处理队列 获取新状态
 * @param {*} fiber
 */
function processUpdateQueue(fiber) {
  const queue = fiber.updateQueue
  const pending = queue.shared.pending
  if (pending !== null) {
    // 断开连接
    queue.shared.pending = null
    //最后一个更新
    const lastPendingUpdate = pending
    const firstPendingUpdate = lastPendingUpdate.next
    //把环状链接剪开
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

function getStateFromUpdate(update, newState) {
  return Object.assign({}, newState, update.payload)
}

let fiber = { memoizedState: { id: 1 } }
initialUpdateQueue(fiber)
let update1 = createUpdate()
update1.payload = { name: 'zhufeng' }
enqueueUpdate(fiber, update1)

let update2 = createUpdate()
update2.payload = { age: 14 }
enqueueUpdate(fiber, update2)

// 基于老状态，计算新状态
processUpdateQueue(fiber)
console.log(fiber)
