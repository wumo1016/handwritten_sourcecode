// 二个车道 1 2
const NoLanes = 0b00 // 0
const NoLane = 0b00 // 0
const SyncLane = 0b01 // 1
const InputContinuousHydrationLane = 0b10 //2

/**
 * @Author: wyb
 * @Descripttion: 初始化更新队列
 * @param {*} fiber
 */
function initializeUpdateQueue(fiber) {
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
 * @Descripttion: 入队-构建循环链表
 * @param {*} fiber
 * @param {*} update
 */
function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue
  const queueShared = updateQueue.shared
  const pending = queueShared.pending
  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }
  queueShared.pending = update
}
/**
 * @Author: wyb
 * @Descripttion: 处理更新队列
 * @param {*} fiber
 * @param {*} renderLanes 优先级
 */
function processUpdateQueue(fiber, renderLanes) {
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
    // 将新链表尾指向断开，变成单链表
    lastPendingUpdate.next = null
    // 新链表头
    const firstPendingUpdate = lastPendingUpdate.next
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
    let update = firstBaseUpdate
    let currentState = fiber.memoizedState
    do {
      // 如果更新优先级比渲染优先级高(值越小越高)，才生效
      if (update.lane <= renderLanes) {
        currentState = update.payload(currentState)
      }
      update = update.next
    } while (update)
    fiber.memoizedState = currentState
  }
}

// 新建一fiber
// 演示如何给fiber添加不同优先级的更新
// 在执行渲染的时候总是优先最高的更执行,跳过优先低的更新
const fiber = { memoizedState: '' }
initializeUpdateQueue(fiber)

// 入队 ABCD
;(function () {
  const updateA = {
    id: 'A',
    payload: (state) => state + 'A',
    lane: InputContinuousHydrationLane
  }
  enqueueUpdate(fiber, updateA)

  const updateB = { id: 'B', payload: (state) => state + 'B', lane: SyncLane }
  enqueueUpdate(fiber, updateB)

  const updateC = {
    id: 'C',
    payload: (state) => state + 'C',
    lane: InputContinuousHydrationLane
  }
  enqueueUpdate(fiber, updateC)

  const updateD = { id: 'D', payload: (state) => state + 'D', lane: SyncLane }
  enqueueUpdate(fiber, updateD)
})()

// 处理新队列，在处理的时候需要指定一个渲染优先级
processUpdateQueue(fiber, SyncLane) // 1
console.log(fiber.memoizedState) // BD

//
;(function () {
  debugger
  const updateE = {
    id: 'E',
    payload: (state) => state + 'E',
    lane: InputContinuousHydrationLane
  }
  enqueueUpdate(fiber, updateE)

  const updateF = { id: 'F', payload: (state) => state + 'F', lane: SyncLane }
  enqueueUpdate(fiber, updateF)
})()

processUpdateQueue(fiber, InputContinuousHydrationLane)
console.log(fiber.memoizedState) //ABCDEF
