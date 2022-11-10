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
            lane: 0,
            payload: update.payload
          }
          // 构建跳过链表
          newLastBaseUpdate.next = clone
          newLastBaseUpdate = clone
        }
        newState = update.payload(newState)
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
    lane: SyncLane
  }
  enqueueUpdate(fiber, updateA)

  const updateB = {
    id: 'B',
    payload: (state) => state + 'B',
    lane: InputContinuousHydrationLane
  }
  enqueueUpdate(fiber, updateB)

  const updateC = {
    id: 'C',
    payload: (state) => state + 'C',
    lane: SyncLane
  }
  enqueueUpdate(fiber, updateC)

  const updateD = {
    id: 'D',
    payload: (state) => state + 'D',
    lane: InputContinuousHydrationLane
  }
  enqueueUpdate(fiber, updateD)
})()

// 处理新队列，在处理的时候需要指定一个渲染优先级
processUpdateQueue(fiber, SyncLane) // 1
console.log(fiber.memoizedState) // BD
;(function () {
  const updateE = {
    id: 'E',
    payload: (state) => state + 'E',
    lane: InputContinuousHydrationLane
  }
  enqueueUpdate(fiber, updateE)

  const updateF = { id: 'F', payload: (state) => state + 'F', lane: InputContinuousHydrationLane }
  enqueueUpdate(fiber, updateF)
})()

processUpdateQueue(fiber, InputContinuousHydrationLane)
console.log(fiber.memoizedState) //ABCDEF
